import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";

export default async function LeadAnalyticsPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayouts: true });
  const leadTeamIds = snapshot.memberships.filter((membership) => membership.role !== "member").map((membership) => membership.team_id);
  const payouts = snapshot.payouts.filter((item) => leadTeamIds.includes(item.team_id));
  const tasks = snapshot.tasks.filter((item) => leadTeamIds.includes(item.team_id));
  const totalPayouts = payouts.reduce((sum, item) => sum + Number(item.amount_minor), 0);
  const createdTasks = tasks.length;
  const activeTasks = tasks.filter((task) => ["open", "assigned"].includes(task.status)).length;
  const tasksInReview = tasks.filter((task) => task.status === "submitted").length;
  const completedTasks = tasks.filter((task) => ["approved", "paid"].includes(task.status)).length;
  const latestTasks = tasks.slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="dashboard-grid">
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Total tasks</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{createdTasks}</h2>
          <p className="mt-2 text-sm text-slate-500">Every created task across teams you manage.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Open and assigned</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{activeTasks}</h2>
          <p className="mt-2 text-sm text-slate-500">Tasks that are live but not yet submitted.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Tasks in review</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{tasksInReview}</h2>
          <p className="mt-2 text-sm text-slate-500">Submitted tasks waiting for approval.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Completed tasks</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{completedTasks}</h2>
          <p className="mt-2 text-sm text-slate-500">Approved or already paid tasks.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-semibold text-slate-500">Total payouts</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{formatCurrency(totalPayouts)}</h2>
          <p className="mt-2 text-sm text-slate-500">Successful and in-process transfers together.</p>
        </SectionCard>
      </div>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Recent task activity</p>
          <p className="text-sm text-slate-600">This updates as soon as tasks are created, submitted, approved, or paid.</p>
        </div>
        <div className="mt-4 space-y-3">
          {latestTasks.length > 0 ? (
            latestTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-950">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</div>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  {task.status}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No task activity yet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
