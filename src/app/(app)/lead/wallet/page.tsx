import { headers } from "next/headers";

import { requireLeadProfile } from "@/lib/auth";
import { reconcilePendingCollections } from "@/lib/collections";
import { getSnapshotForUser } from "@/lib/data";

import { FundWalletForm } from "@/components/forms/fund-wallet-form";
import { SectionCard } from "@/components/section-card";

export default async function LeadWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ verification?: string }>;
}) {
  const { profile } = await requireLeadProfile();
  let snapshot = await getSnapshotForUser(profile.user_id, { includeCollections: true });
  const leadTeamIds = snapshot.memberships.filter((membership) => membership.role !== "member").map((membership) => membership.team_id);
  const pendingCollections = snapshot.collections.filter((collection) => leadTeamIds.includes(collection.team_id) && collection.status === "pending");
  const { verification } = await searchParams;
  const shouldReconcilePending = Boolean(verification) || pendingCollections.length > 0;

  if (shouldReconcilePending) {
    const reconciliation = await reconcilePendingCollections(leadTeamIds);
    if (reconciliation.changed > 0) {
      snapshot = await getSnapshotForUser(profile.user_id, { includeCollections: true });
    }
  }

  const currentLeadTeamIds = snapshot.memberships.filter((membership) => membership.role !== "member").map((membership) => membership.team_id);
  const teams = snapshot.teams.filter((team) => currentLeadTeamIds.includes(team.id));
  let verificationResult: string | null = null;

  if (verification) {
    try {
      const requestHeaders = await headers();
      const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
      const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
      const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
      const response = await fetch(`${origin}/api/collections/verify?collectionId=${verification}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as { data?: { status?: string } };
      verificationResult = payload.data?.status ?? null;
    } catch {
      verificationResult = "pending";
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Fund a team wallet</p>
          <p className="text-sm text-slate-600">This sends you to Interswitch Web Checkout with a verified CrewPay funding reference.</p>
        </div>
        {verificationResult ? (
          <div
            className={`mt-4 rounded-2xl border p-4 text-sm ${
              verificationResult === "successful"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : verificationResult === "failed"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {verificationResult === "successful"
              ? "Wallet funded successfully. The team balance has been updated."
              : verificationResult === "failed"
                ? "Funding was not completed. Interswitch returned a failed or cancelled result for this attempt."
                : "Funding verification is still pending."}
          </div>
        ) : null}
        <div className="mt-4">
          <FundWalletForm teams={teams} />
        </div>
      </SectionCard>
    </div>
  );
}
