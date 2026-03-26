import Link from "next/link";
import {
  ArrowDownToLine,
  BriefcaseBusiness,
  ClipboardCheck,
  MoveUpRight,
  Users2,
} from "lucide-react";

import { requireLeadProfile } from "@/lib/auth";
import { reconcilePendingCollections } from "@/lib/collections";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

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
  const activeTasks = leadTasks.filter((task) => !["paid", "cancelled"].includes(task.status)).length;
  const totalAvailable = leadWallets.reduce((sum, wallet) => sum + Number(wallet.available_balance_minor), 0);

  const transactions = [
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
    .slice(0, 6);

  function formatSignedCurrency(amountMinor: number) {
    const formatted = formatCurrency(Math.abs(amountMinor));
    return amountMinor < 0 ? `-${formatted}` : `+${formatted}`;
  }

  const quickActions = [
    {
      href: "/lead/wallet",
      label: "Fund",
      icon: ArrowDownToLine,
    },
    {
      href: "/lead/tasks/new",
      label: "Task",
      icon: BriefcaseBusiness,
    },
    {
      href: "/lead/tasks",
      label: "Review",
      icon: ClipboardCheck,
    },
    {
      href: "/lead/teams",
      label: "Teams",
      icon: Users2,
    },
  ] as const;

  return (
    <div className="space-y-5">
      <SectionCard className="space-y-5">
        <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Available</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{formatCurrency(totalAvailable)}</div>
          <p className="mt-2 text-sm text-slate-600">Current balance available across the teams you manage.</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_16px_32px_rgba(31,100,255,0.22)]">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-slate-900">{action.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Teams</p>
            <div className="mt-2 text-2xl font-bold text-slate-950">{leadTeams.length}</div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tasks</p>
            <div className="mt-2 text-2xl font-bold text-slate-950">{activeTasks}</div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approvals</p>
            <div className="mt-2 text-2xl font-bold text-slate-950">{pendingApprovals.length}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Transactions</p>
            <p className="text-sm text-slate-600">Recent funding and payout activity.</p>
          </div>
          <Link href="/lead/wallet" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            See all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <MoveUpRight className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">{transaction.title}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {transaction.subtitle} {" - "} {formatRelative(transaction.createdAt)}
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
              No wallet transactions yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Pending reviews</p>
            <p className="text-sm text-slate-600">Submissions waiting on owner or manager approval.</p>
          </div>
          <Link href="/lead/tasks" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            View tasks
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {pendingApprovals.length > 0 ? (
            pendingApprovals.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                href={`/lead/tasks/${task.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <div>
                  <div className="font-semibold text-slate-950">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</div>
                </div>
                <Badge tone="warning">Submitted</Badge>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              Nothing is waiting for review right now.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
