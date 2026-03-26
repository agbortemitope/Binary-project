import { apiError, apiSuccess } from "@/lib/api";
import { persistCollectionVerification } from "@/lib/collections";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/interswitch";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-interswitch-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return apiError("Invalid webhook signature.", 401);
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const eventKey =
      String(payload["eventId"] ?? payload["transactionReference"] ?? payload["reference"] ?? `evt-${Date.now()}`);
    const eventType = String(payload["eventType"] ?? payload["type"] ?? "unknown");
    const admin = createSupabaseAdminClient();

    const { data: existing } = await admin.from("provider_events").select("*").eq("event_key", eventKey).maybeSingle();
    if (existing) {
      return apiSuccess({ processed: false, duplicate: true });
    }

    await admin.from("provider_events").insert({
      provider: "interswitch",
      event_key: eventKey,
      event_type: eventType,
      signature,
      payload,
      status: "received",
    });

    const transactionReference = String(
      payload["transactionReference"] ??
        payload["txnRef"] ??
        payload["merchantReference"] ??
        "",
    );
    const payoutReference = String(payload["transactionReference"] ?? payload["reference"] ?? "");
    const status = String(payload["status"] ?? payload["paymentStatus"] ?? "").toUpperCase();

    if (transactionReference.startsWith("CRW-FND-")) {
      const { data: collection } = await admin
        .from("payment_collections")
        .select("*")
        .eq("txn_ref", transactionReference)
        .maybeSingle();

      if (collection) {
        if (status.includes("SUCCESS")) {
          await persistCollectionVerification(
            collection.id,
            {
              ...payload,
              MerchantReference: transactionReference,
              PaymentId: String(payload["paymentId"] ?? payload["PaymentId"] ?? ""),
              ResponseCode: "00",
            },
            collection.txn_ref,
          );
        } else if (status.includes("FAIL")) {
          await persistCollectionVerification(
            collection.id,
            {
              ...payload,
              MerchantReference: transactionReference,
              ResponseCode: String(payload["responseCode"] ?? payload["ResponseCode"] ?? "FAILED"),
              ResponseDescription: String(payload["message"] ?? payload["responseMessage"] ?? payload["ResponseDescription"] ?? "Failed"),
            },
            collection.txn_ref,
          );
        }
      }
    }

    if (payoutReference.startsWith("CRW-PAY-")) {
      const { data: payout } = await admin
        .from("payouts")
        .select("*")
        .eq("transaction_reference", payoutReference)
        .maybeSingle();

      if (payout) {
        if (status.includes("SUCCESS")) {
          await admin.rpc("mark_payout_success", {
            p_payout_id: payout.id,
            p_payload: payload,
            p_fee_minor: 0,
          });
        } else if (status.includes("FAIL")) {
          await admin.rpc("mark_payout_failed", {
            p_payout_id: payout.id,
            p_reason: "Provider reported a failed payout status.",
            p_payload: payload,
          });
        }
      }
    }

    await admin
      .from("provider_events")
      .update({
        status: "processed",
      })
      .eq("event_key", eventKey);

    return apiSuccess({ processed: true });
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to process webhook.", 500);
  }
}
