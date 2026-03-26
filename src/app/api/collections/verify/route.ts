import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { persistCollectionVerification } from "@/lib/collections";
import { verifyCollectionTransaction } from "@/lib/interswitch";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const collectionId = url.searchParams.get("collectionId");

    if (!collectionId) {
      return apiError("collectionId is required.", 400);
    }

    const admin = createSupabaseAdminClient();
    const { data: collection, error: collectionError } = await admin
      .from("payment_collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (collectionError || !collection) {
      return apiError(collectionError?.message ?? "Funding record not found.", 404);
    }

    const verification = await verifyCollectionTransaction({
      transactionReference: collection.txn_ref,
      amountMinor: Number(collection.amount_minor),
    });

    const status = await persistCollectionVerification(collectionId, verification, collection.txn_ref);
    return apiSuccess({ status, verification });
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to verify funding.", 500);
  }
}
