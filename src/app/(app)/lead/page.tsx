import Link from "next/link";

import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function LeadDashboardPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);

  const leadMemberships = snapshot.memberships.filter((membership) => membership.role !== "member");
  const leadTeamIds = leadMemberships.map((membership) => membership.team_id);
  const leadTeams = snapshot.teams.filter((team) => leadTeamIds.includes(team.id));
  const leadWallets = snapshot.wallets.filter((wallet) => leadTeamIds.includes(wallet.team_id));
  const leadTasks = snapshot.tasks.filter((task) => leadTeamIds.includes(task.team_id));
  const pendingApprovals = leadTasks.filter((task) => task.status === "submitted");
  const totalAvailable = leadWallets.reduce((sum, wallet) => sum + Number(wallet.available_balance_minor), 0);
  const totalReserved = leadWallets.reduce((sum, wallet) => sum + Number(wallet.reserved_balance_minor), 0);
  const totalPendingPayout = leadWallets.reduce((sum, wallet) => sum + Number(wallet.pending_payout_balance_minor), 0);

  return (
    <div className="space-y-5">
      <SectionCard className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Lead dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Own the flow from funding to approval.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create teams, reserve task rewards, review submissions, and release payouts from one workspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/lead/tasks/new">Create task</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/lead/teams">Create or manage teams</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
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
            <div className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(totalPendingPayout)}</div>
          </div>
        </div>
      </SectionCard>

      <div className="dashboard-grid">
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Teams you manage</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950">{leadTeams.length}</h3>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Pending approvals</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950">{pendingApprovals.length}</h3>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Active tasks</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950">{leadTasks.filter((task) => !["paid", "cancelled"].includes(task.status)).length}</h3>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Pending reviews</p>
            <p className="text-sm text-slate-600">Submissions waiting on owner or manager approval.</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/lead/tasks">View tasks</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {pendingApprovals.length > 0 ? (
            pendingApprovals.slice(0, 5).map((task) => (
              <Link key={task.id} href={`/lead/tasks/${task.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
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
