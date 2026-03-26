import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function WorkerDashboardPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);
  const myTasks = snapshot.tasks.filter((task) => task.assignee_user_id === profile.user_id || task.claimed_by_user_id === profile.user_id);
  const openClaimTasks = snapshot.tasks.filter((task) => task.status === "open");
  const myEarnings = snapshot.earnings.filter((earning) => earning.worker_user_id === profile.user_id);
  const pendingValue = myEarnings
    .filter((earning) => earning.status !== "paid")
    .reduce((sum, earning) => sum + Number(earning.amount_minor), 0);

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] bg-slate-950 px-5 py-5 text-white sm:px-6 sm:py-6">
        <div className="flex min-h-[10.75rem] flex-col justify-between gap-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Earnings</div>
            <div className="mt-2 text-[1.55rem] font-bold tracking-tight sm:text-[1.8rem]">{formatCurrency(pendingValue)}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/worker/tasks">Open task board</Link>
            </Button>
            <Button asChild>
              <Link href="/worker/teams">Join another team</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_14px_34px_rgba(15,23,42,0.04)] md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="dashboard-grid gap-2 md:gap-4">
          <div className="rounded-[22px] bg-white p-4 md:border md:border-slate-200 md:p-5">
            <p className="text-sm font-semibold text-slate-500">Assigned tasks</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">{myTasks.length}</h3>
          </div>
          <div className="rounded-[22px] bg-white p-4 md:border md:border-slate-200 md:p-5">
            <p className="text-sm font-semibold text-slate-500">Claimable tasks</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">{openClaimTasks.length}</h3>
          </div>
          <div className="rounded-[22px] bg-white p-4 md:border md:border-slate-200 md:p-5">
            <p className="text-sm font-semibold text-slate-500">Paid earnings</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">
              {formatCurrency(
                myEarnings.filter((earning) => earning.status === "paid").reduce((sum, earning) => sum + Number(earning.amount_minor), 0),
              )}
            </h3>
          </div>
        </div>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-950">Claimable work</p>
            <p className="text-sm text-slate-600">Open-claim tasks from teams you belong to.</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/worker/tasks">View all tasks</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {openClaimTasks.slice(0, 5).map((task) => (
            <Link key={task.id} href={`/worker/tasks/${task.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <div>
                <div className="font-semibold text-slate-950">{task.title}</div>
                <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</div>
              </div>
              <Badge tone="info">Open claim</Badge>
            </Link>
          ))}
          {openClaimTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No open-claim tasks right now.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
