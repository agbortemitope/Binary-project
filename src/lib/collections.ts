import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyCollectionTransaction } from "@/lib/interswitch";

type CollectionVerification = {
  Amount?: number;
  MerchantReference?: string;
  PaymentId?: number | string;
  PaymentReference?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
};

function isSuccessfulVerification(verification: CollectionVerification) {
  return String(verification.ResponseCode ?? "") === "00";
}

export async function persistCollectionVerification(
  collectionId: string,
  verification: CollectionVerification,
  fallbackTxnRef: string,
) {
  const admin = createSupabaseAdminClient();

  if (isSuccessfulVerification(verification)) {
    const { error } = await admin.rpc("apply_collection_success", {
      p_collection_id: collectionId,
      p_provider_reference: String(verification.MerchantReference ?? fallbackTxnRef),
      p_provider_payment_id: String(verification.PaymentReference ?? verification.PaymentId ?? ""),
      p_payload: verification,
    });

    if (error) {
      throw new Error(error.message);
    }

    return "successful" as const;
  }

  const { error } = await admin.rpc("mark_collection_failed", {
    p_collection_id: collectionId,
    p_payload: verification,
  });

  if (error) {
    throw new Error(error.message);
  }

  return "failed" as const;
}

export async function reconcilePendingCollections(teamIds: string[]) {
  if (teamIds.length === 0) {
    return { changed: 0 };
  }

  const admin = createSupabaseAdminClient();
  const { data: collections, error } = await admin
    .from("payment_collections")
    .select("id, txn_ref, amount_minor, status")
    .in("team_id", teamIds)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !collections?.length) {
    return { changed: 0 };
  }

  let changed = 0;

  for (const collection of collections) {
    try {
      const verification = await verifyCollectionTransaction({
        transactionReference: collection.txn_ref,
        amountMinor: Number(collection.amount_minor),
      });

      const status = await persistCollectionVerification(collection.id, verification, collection.txn_ref);
      if (status === "successful" || status === "failed") {
        changed += 1;
      }
    } catch {
      // Ignore transient provider failures so the page can still load.
    }
  }

  return { changed };
}
