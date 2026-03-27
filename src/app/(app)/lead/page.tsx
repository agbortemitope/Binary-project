import Link from "next/link";
import {
  ArrowDownToLine,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardCheck,
  MoveUpRight,
  Plus,
  Users2,
} from "lucide-react";

import { requireLeadProfile } from "@/lib/auth";
import { reconcilePendingCollections } from "@/lib/collections";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function LeadDashboardPage() {
  const { profile } = await requireLeadProfile();
  let snapshot = await getSnapshotForUser(profile.user_id, {
    includeCollections: true,
    includePayouts: true,
  });

  const initialLeadMemberships = snapshot.memberships.filter((membership) => membership.role !== "member");
  const initialLeadTeamIds = initialLeadMemberships.map((membership) => membership.team_id);
  const pendingCollections = snapshot.collections.filter(
    (collection) => initialLeadTeamIds.includes(collection.team_id) && collection.status === "pending",
  );

  if (pendingCollections.length > 0) {
    const reconciliation = await reconcilePendingCollections(initialLeadTeamIds);
    if (reconciliation.changed > 0) {
      snapshot = await getSnapshotForUser(profile.user_id, {
        includeCollections: true,
        includePayouts: true,
      });
    }
  }

  const leadMemberships = snapshot.memberships.filter((membership) => membership.role !== "member");
  const leadTeamIds = leadMemberships.map((membership) => membership.team_id);
  const leadTeams = snapshot.teams.filter((team) => leadTeamIds.includes(team.id));
  const leadWallets = snapshot.wallets.filter((wallet) => leadTeamIds.includes(wallet.team_id));
  const leadTasks = snapshot.tasks.filter((task) => leadTeamIds.includes(task.team_id));
  const leadCollections = snapshot.collections.filter((collection) => leadTeamIds.includes(collection.team_id));
  const leadPayouts = snapshot.payouts.filter((payout) => leadTeamIds.includes(payout.team_id));

  const pendingApprovals = leadTasks.filter((task) => task.status === "submitted");
  const totalAvailable = leadWallets.reduce((sum, wallet) => sum + Number(wallet.available_balance_minor), 0);
  const totalReserved = leadWallets.reduce((sum, wallet) => sum + Number(wallet.reserved_balance_minor), 0);
  const totalPendingPayout = leadWallets.reduce((sum, wallet) => sum + Number(wallet.pending_payout_balance_minor), 0);
  const totalPaidOut = leadPayouts
    .filter((payout) => payout.status === "successful")
    .reduce((sum, payout) => sum + Number(payout.amount_minor), 0);

  const recentTransactions = [
    ...leadCollections.map((collection) => ({
      id: `collection-${collection.id}`,
      title: collection.status === "successful" ? "Wallet funded" : "Funding attempt",
      subtitle: leadTeams.find((team) => team.id === collection.team_id)?.name ?? "CrewPay team",
      amountMinor: Number(collection.amount_minor),
      status: collection.status,
      createdAt: collection.updated_at ?? collection.created_at,
      tone:
        collection.status === "successful"
          ? ("success" as const)
          : collection.status === "failed" || collection.status === "cancelled"
            ? ("danger" as const)
            : ("warning" as const),
    })),
    ...leadPayouts.map((payout) => ({
      id: `payout-${payout.id}`,
      title: payout.status === "successful" ? "Payout sent" : "Payout attempt",
      subtitle: payout.recipient_account_name || "Crew member",
      amountMinor: -Number(payout.amount_minor),
      status: payout.status,
      createdAt: payout.updated_at ?? payout.created_at,
      tone:
        payout.status === "successful"
          ? ("info" as const)
          : payout.status === "failed" || payout.status === "cancelled"
            ? ("danger" as const)
            : ("warning" as const),
    })),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);

  function formatSignedCurrency(amountMinor: number) {
    const formatted = formatCurrency(Math.abs(amountMinor));
    return amountMinor < 0 ? `-${formatted}` : `+${formatted}`;
  }

  const hasTeams = leadTeams.length > 0;

  return (
    <div className="space-y-5">
      {pendingApprovals.length > 0 && (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Action required</p>
              <p className="mt-1 text-lg font-bold text-slate-950">
                {pendingApprovals.length} task{pendingApprovals.length !== 1 ? "s" : ""} waiting for your approval
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 bg-amber-600 text-white hover:bg-amber-700">
              <Link href="/lead/tasks">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Review now
              </Link>
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {pendingApprovals.slice(0, 3).map((task) => (
              <Link
                key={task.id}
                href={`/lead/tasks/${task.id}`}
                className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 transition hover:bg-white"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {formatCurrency(Number(task.reward_minor))} &middot; {leadTeams.find((t) => t.id === task.team_id)?.name}
                  </p>
                </div>
                <ChevronRight className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
            {pendingApprovals.length > 3 && (
              <Link
                href="/lead/tasks"
                className="block rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-center text-sm font-semibold text-amber-700 transition hover:bg-white"
              >
                +{pendingApprovals.length - 3} more
              </Link>
            )}
          </div>
        </div>
      )}

      <SectionCard className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wallet pipeline</p>
          <p className="mt-1 text-sm text-slate-600">How your NGN moves from funding to payout across all teams.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700">Available</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatCurrency(totalAvailable)}</p>
            <p className="mt-1 text-xs text-blue-600">Ready to assign</p>
          </div>
          <div className="rounded-[22px] border border-violet-100 bg-violet-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700">Reserved</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatCurrency(totalReserved)}</p>
            <p className="mt-1 text-xs text-violet-600">Locked in tasks</p>
          </div>
          <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Releasing</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatCurrency(totalPendingPayout)}</p>
            <p className="mt-1 text-xs text-amber-600">Approved, pending</p>
          </div>
          <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Paid out</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatCurrency(totalPaidOut)}</p>
            <p className="mt-1 text-xs text-emerald-600">Sent to crew</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
          <p className="mt-1 text-sm text-slate-600">Follow the steps to move funds through the pipeline.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/lead/wallet"
            className="group flex items-center gap-4 rounded-[22px] border border-blue-100 bg-blue-50 p-4 transition hover:border-blue-200 hover:bg-blue-100"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_28px_rgba(31,100,255,0.22)]">
              <ArrowDownToLine className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Step 1</p>
              <p className="mt-0.5 font-semibold text-slate-950">Fund wallet</p>
              <p className="mt-0.5 text-xs text-slate-600">Add NGN via Interswitch</p>
            </div>
          </Link>

          <Link
            href="/lead/tasks/new"
            className="group flex items-center gap-4 rounded-[22px] border border-violet-100 bg-violet-50 p-4 transition hover:border-violet-200 hover:bg-violet-100"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-[0_12px_28px_rgba(109,40,217,0.2)]">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">Step 2</p>
              <p className="mt-0.5 font-semibold text-slate-950">Create task</p>
              <p className="mt-0.5 text-xs text-slate-600">Reserve & assign work</p>
            </div>
          </Link>

          <Link
            href="/lead/tasks"
            className="group flex items-center gap-4 rounded-[22px] border border-amber-100 bg-amber-50 p-4 transition hover:border-amber-200 hover:bg-amber-100"
          >
            <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-[0_12px_28px_rgba(245,158,11,0.25)]">
              <ClipboardCheck className="h-5 w-5" />
              {pendingApprovals.length > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {pendingApprovals.length}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Step 3</p>
              <p className="mt-0.5 font-semibold text-slate-950">Review & approve</p>
              <p className="mt-0.5 text-xs text-slate-600">Trigger payouts to crew</p>
            </div>
          </Link>
        </div>
      </SectionCard>

      {hasTeams && (
        <SectionCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-950">Teams</p>
              <p className="text-sm text-slate-600">Wallet status per team.</p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/lead/teams">
                <Users2 className="mr-1.5 h-4 w-4" />
                Manage
              </Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {leadTeams.map((team) => {
              const wallet = leadWallets.find((w) => w.team_id === team.id);
              const available = Number(wallet?.available_balance_minor ?? 0);
              const reserved = Number(wallet?.reserved_balance_minor ?? 0);
              return (
                <div key={team.id} className="rounded-[22px] border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950">{team.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone={team.payout_mode === "instant" ? "info" : "success"}>{team.payout_mode}</Badge>
                      <Link
                        href={`/lead/wallet?teamId=${team.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3" />
                        Fund
                      </Link>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-blue-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">Available</p>
                      <p className="mt-1 text-base font-bold text-slate-950">{formatCurrency(available)}</p>
                    </div>
                    <div className="rounded-xl bg-violet-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">Reserved</p>
                      <p className="mt-1 text-base font-bold text-slate-950">{formatCurrency(reserved)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Recent activity</p>
            <p className="text-sm text-slate-600">Funding and payout history.</p>
          </div>
          <Link href="/lead/wallet" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            See all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <MoveUpRight className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">{transaction.title}</div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      {transaction.subtitle} &middot; {formatRelative(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-950">
                    {formatSignedCurrency(transaction.amountMinor)}
                  </div>
                  <div className="mt-1">
                    <Badge tone={transaction.tone} className="capitalize">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No wallet activity yet. Start by funding a team wallet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
