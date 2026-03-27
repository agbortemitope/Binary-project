import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";

import { requireLeadProfile } from "@/lib/auth";
import { reconcilePendingCollections } from "@/lib/collections";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { FundWalletForm } from "@/components/forms/fund-wallet-form";
import { SectionCard } from "@/components/section-card";

export default async function LeadWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ verification?: string; teamId?: string }>;
}) {
  const { profile } = await requireLeadProfile();
  let snapshot = await getSnapshotForUser(profile.user_id, { includeCollections: true });
  const leadTeamIds = snapshot.memberships
    .filter((membership) => membership.role !== "member")
    .map((membership) => membership.team_id);
  const pendingCollections = snapshot.collections.filter(
    (collection) => leadTeamIds.includes(collection.team_id) && collection.status === "pending",
  );
  const { verification } = await searchParams;
  const shouldReconcilePending = Boolean(verification) || pendingCollections.length > 0;

  if (shouldReconcilePending) {
    const reconciliation = await reconcilePendingCollections(leadTeamIds);
    if (reconciliation.changed > 0) {
      snapshot = await getSnapshotForUser(profile.user_id, { includeCollections: true });
    }
  }

  const currentLeadTeamIds = snapshot.memberships
    .filter((membership) => membership.role !== "member")
    .map((membership) => membership.team_id);
  const teams = snapshot.teams.filter((team) => currentLeadTeamIds.includes(team.id));
  const wallets = snapshot.wallets.filter((wallet) => currentLeadTeamIds.includes(wallet.team_id));

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

  const fundingSuccess = verificationResult === "successful";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {verificationResult ? (
        <div
          className={`rounded-[28px] border p-5 ${
            fundingSuccess
              ? "border-emerald-200 bg-emerald-50"
              : verificationResult === "failed"
                ? "border-rose-200 bg-rose-50"
                : "border-slate-200 bg-slate-50"
          }`}
        >
          <p
            className={`font-semibold ${
              fundingSuccess ? "text-emerald-800" : verificationResult === "failed" ? "text-rose-700" : "text-slate-700"
            }`}
          >
            {fundingSuccess
              ? "Wallet funded successfully"
              : verificationResult === "failed"
                ? "Funding not completed"
                : "Verification pending"}
          </p>
          <p
            className={`mt-1 text-sm ${
              fundingSuccess ? "text-emerald-700" : verificationResult === "failed" ? "text-rose-600" : "text-slate-600"
            }`}
          >
            {fundingSuccess
              ? "Your team balance has been updated. You can now create and assign tasks."
              : verificationResult === "failed"
                ? "Interswitch returned a failed or cancelled result for this attempt. Please try again."
                : "The payment is still being verified. Check back shortly."}
          </p>
          {fundingSuccess && (
            <Link
              href="/lead/tasks/new"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Create a task now
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : null}

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Fund a team wallet</p>
          <p className="mt-1 text-sm text-slate-600">
            Adds NGN to a team&apos;s available balance via Interswitch. Funds are reserved when you assign tasks.
          </p>
        </div>

        {wallets.length > 0 && (
          <div className="mt-4 space-y-2">
            {teams.map((team) => {
              const wallet = wallets.find((w) => w.team_id === team.id);
              if (!wallet) return null;
              const available = Number(wallet.available_balance_minor);
              const reserved = Number(wallet.reserved_balance_minor);
              return (
                <div key={team.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-800">{team.name}</p>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Available</p>
                      <p className="text-sm font-bold text-slate-950">{formatCurrency(available)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600">Reserved</p>
                      <p className="text-sm font-bold text-slate-950">{formatCurrency(reserved)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <FundWalletForm teams={teams} />
        </div>
      </SectionCard>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">How it works</p>
        <ol className="mt-3 space-y-2 text-sm text-slate-600">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
            <span>Fund your team wallet — money goes to <strong>Available</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">2</span>
            <span>Create a task with a reward — money moves to <strong>Reserved</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">3</span>
            <span>Worker submits — you approve to release the payout</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">4</span>
            <span>Interswitch sends the NGN directly to the worker&apos;s bank account</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
