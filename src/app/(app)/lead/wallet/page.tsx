import { headers } from "next/headers";

import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { FundWalletForm } from "@/components/forms/fund-wallet-form";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function LeadWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ verification?: string }>;
}) {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);
  const leadTeamIds = snapshot.memberships.filter((membership) => membership.role !== "member").map((membership) => membership.team_id);
  const teams = snapshot.teams.filter((team) => leadTeamIds.includes(team.id));
  const wallets = snapshot.wallets.filter((wallet) => leadTeamIds.includes(wallet.team_id));
  const totalAvailable = wallets.reduce((sum, wallet) => sum + Number(wallet.available_balance_minor), 0);
  const totalReserved = wallets.reduce((sum, wallet) => sum + Number(wallet.reserved_balance_minor), 0);
  const totalPending = wallets.reduce((sum, wallet) => sum + Number(wallet.pending_payout_balance_minor), 0);
  const { verification } = await searchParams;
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
    <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Wallet controls</p>
          <p className="text-sm text-slate-600">Funding enters available balance. Task creation reserves from there, and approvals move value into pending payout.</p>
        </div>
        {verificationResult ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Latest funding verification status: <strong>{verificationResult}</strong>
          </div>
        ) : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] bg-blue-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Available</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(totalAvailable)}</div>
          </div>
          <div className="rounded-[24px] bg-amber-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Reserved</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(totalReserved)}</div>
          </div>
          <div className="rounded-[24px] bg-emerald-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Pending payout</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(totalPending)}</div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {teams.map((team) => {
            const wallet = wallets.find((item) => item.team_id === team.id);
            return (
              <div key={team.id} className="rounded-[24px] border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Invite code: {team.invite_code}</div>
                  </div>
                  <Badge tone={team.payout_mode === "instant" ? "info" : "success"}>{team.payout_mode}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Available</div>
                    <div className="mt-2 font-bold text-slate-950">{formatCurrency(Number(wallet?.available_balance_minor ?? 0))}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reserved</div>
                    <div className="mt-2 font-bold text-slate-950">{formatCurrency(Number(wallet?.reserved_balance_minor ?? 0))}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending payout</div>
                    <div className="mt-2 font-bold text-slate-950">{formatCurrency(Number(wallet?.pending_payout_balance_minor ?? 0))}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Fund a team wallet</p>
          <p className="text-sm text-slate-600">This sends you to Interswitch Web Checkout with a verified CrewPay funding reference.</p>
        </div>
        <div className="mt-4">
          <FundWalletForm teams={teams} />
        </div>
      </SectionCard>
    </div>
  );
}
