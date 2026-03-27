import Link from "next/link";

import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "@/lib/types";

function taskTone(status: TaskStatus): "warning" | "success" | "info" | "danger" | "neutral" {
  if (status === "submitted") return "warning";
  if (status === "paid") return "success";
  if (status === "approved") return "info";
  if (status === "cancelled") return "danger";
  return "neutral";
}

function TaskRow({ task }: { task: Task }) {
  return (
    <Link
      href={`/lead/tasks/${task.id}`}
      className="flex flex-col gap-3 rounded-[22px] border border-slate-200 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="font-semibold text-slate-950">{task.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span>{formatCurrency(Number(task.reward_minor))}</span>
          {task.submitted_at && <span>Submitted {formatRelative(task.submitted_at)}</span>}
          {task.deadline_at && !task.submitted_at && <span>Due {formatRelative(task.deadline_at)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={taskTone(task.status)} className="capitalize">
          {task.status}
        </Badge>
      </div>
    </Link>
  );
}

export default async function LeadTasksPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);
  const leadTeamIds = snapshot.memberships
    .filter((membership) => membership.role !== "member")
    .map((membership) => membership.team_id);
  const tasks = snapshot.tasks.filter((task) => leadTeamIds.includes(task.team_id));

  const needsReview = tasks.filter((task) => task.status === "submitted");
  const inProgress = tasks.filter((task) => ["open", "assigned", "approved"].includes(task.status));
  const completed = tasks.filter((task) => ["paid", "cancelled"].includes(task.status));

  return (
    <div className="space-y-5">
      <SectionCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-slate-950">Task queue</p>
          <p className="text-sm text-slate-600">
            {tasks.length > 0
              ? `${tasks.length} task${tasks.length !== 1 ? "s" : ""} across your teams`
              : "Reserve, review, approve, and pay from one queue."}
          </p>
        </div>
        <Button asChild>
          <Link href="/lead/tasks/new">+ Create task</Link>
        </Button>
      </SectionCard>

      {needsReview.length > 0 && (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Needs approval</p>
              <p className="mt-1 text-base font-bold text-slate-950">
                {needsReview.length} submission{needsReview.length !== 1 ? "s" : ""} waiting
              </p>
            </div>
            <Badge tone="warning">{needsReview.length}</Badge>
          </div>
          <div className="space-y-2">
            {needsReview.map((task) => (
              <Link
                key={task.id}
                href={`/lead/tasks/${task.id}`}
                className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 transition hover:bg-white"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {formatCurrency(Number(task.reward_minor))}
                    {task.submitted_at ? ` · submitted ${formatRelative(task.submitted_at)}` : ""}
                  </p>
                </div>
                <span className="ml-3 shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">
                  Review
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">In progress</p>
          <p className="mb-4 mt-1 text-sm text-slate-600">{inProgress.length} active task{inProgress.length !== 1 ? "s" : ""}</p>
          <div className="space-y-2">
            {inProgress.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </SectionCard>
      )}

      {completed.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Completed</p>
          <p className="mb-4 mt-1 text-sm text-slate-600">{completed.length} finished task{completed.length !== 1 ? "s" : ""}</p>
          <div className="space-y-2">
            {completed.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </SectionCard>
      )}

      {tasks.length === 0 && (
        <SectionCard>
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="font-semibold text-slate-700">No tasks yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Create a funded task to reserve money from your team wallet. Set the reward to 0 to test the flow first.
            </p>
            <Button asChild className="mt-4">
              <Link href="/lead/tasks/new">Create your first task</Link>
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
