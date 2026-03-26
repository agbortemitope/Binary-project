import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPayoutTransfer, getPayoutWalletBalance, makeTransactionReference } from "@/lib/interswitch";
import { env, hasInterswitchPayoutConfig } from "@/lib/env";

function inferPayoutStatus(payload: Record<string, unknown>) {
  const raw = String(
    payload["status"] ??
      payload["paymentStatus"] ??
      (payload["response"] as Record<string, unknown> | undefined)?.["status"] ??
      "",
  ).toUpperCase();

  if (raw.includes("SUCCESS")) return "successful";
  if (raw.includes("FAIL")) return "failed";
  return "processing";
}

export async function attemptPayoutForEarning({
  earningId,
  initiatedByUserId,
}: {
  earningId: string;
  initiatedByUserId: string;
}) {
  const admin = createSupabaseAdminClient();
  const { data: earning, error: earningError } = await admin
    .from("worker_earnings")
    .select("*")
    .eq("id", earningId)
    .single();

  if (earningError || !earning) {
    throw new Error(earningError?.message ?? "Worker earning not found.");
  }

  const { data: payoutMethod, error: payoutMethodError } = await admin
    .from("payout_methods")
    .select("*")
    .eq("user_id", earning.worker_user_id)
    .maybeSingle();

  if (payoutMethodError || !payoutMethod) {
    throw new Error("Worker payout method is missing.");
  }

  if (!payoutMethod.is_verified) {
    throw new Error(payoutMethod.verification_message || "Worker payout method is not verified.");
  }

  if (!hasInterswitchPayoutConfig()) {
    return {
      started: false,
      payoutId: null as string | null,
      reason: "Interswitch payout configuration is incomplete.",
    };
  }

  const amountMajor = Number(earning.amount_minor) / 100;
  const walletBalance = await getPayoutWalletBalance();
  if (walletBalance.availableBalanceMajor < amountMajor) {
    return {
      started: false,
      payoutId: null as string | null,
      reason: `Interswitch wallet balance is too low for this payout. Available: NGN ${walletBalance.availableBalanceMajor.toFixed(2)}.`,
    };
  }

  const transactionReference = makeTransactionReference("CRW-PAY");
  const { data: payoutRecord, error: payoutRecordError } = await admin.rpc("create_payout_record", {
    p_earning_id: earningId,
    p_initiated_by_user_id: initiatedByUserId,
    p_transaction_reference: transactionReference,
    p_recipient_bank_code: payoutMethod.bank_code,
    p_recipient_bank_name: payoutMethod.bank_name,
    p_recipient_account_number: payoutMethod.account_number,
    p_recipient_account_name: payoutMethod.account_name,
    p_narration: "CrewPay task payout",
  });

  if (payoutRecordError || !payoutRecord) {
    throw new Error(payoutRecordError?.message ?? "Unable to create payout record.");
  }

  const providerPayload = await createPayoutTransfer({
    transactionReference,
    amountMajor,
    narration: "CrewPay task payout",
    sourceAccountName: env.interswitch.sourceAccountName,
    sourceAccountNumber: env.interswitch.sourceAccountNumber,
    recipientBankCode: payoutMethod.bank_code,
    recipientAccountNumber: payoutMethod.account_number,
  });

  const inferredStatus = inferPayoutStatus(providerPayload);

  await admin
    .from("payouts")
    .update({
      provider_payload: providerPayload,
    })
    .eq("id", payoutRecord);

  if (inferredStatus === "successful") {
    await admin.rpc("mark_payout_success", {
      p_payout_id: payoutRecord,
      p_payload: providerPayload,
      p_fee_minor: 0,
    });
  }

  if (inferredStatus === "failed") {
    await admin.rpc("mark_payout_failed", {
      p_payout_id: payoutRecord,
      p_reason: "Provider returned a failed payout status.",
      p_payload: providerPayload,
    });
  }

  return {
    started: true,
    payoutId: payoutRecord as string,
    reason: inferredStatus === "processing" ? "Payout is processing." : null,
  };
}
