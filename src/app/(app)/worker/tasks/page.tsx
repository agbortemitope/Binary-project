import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";

function taskTone(status: Task["status"]): "warning" | "success" | "info" | "danger" | "neutral" {
  if (status === "submitted") return "warning";
  if (status === "paid") return "success";
  if (status === "approved") return "info";
  if (status === "cancelled") return "danger";
  if (status === "open") return "info";
  return "neutral";
}

function taskLabel(status: Task["status"]): string {
  const labels: Record<Task["status"], string> = {
    open: "Claim",
    assigned: "Assigned",
    submitted: "In review",
    approved: "Approved",
    paid: "Paid",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export default async function WorkerTasksPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);

  const claimable = snapshot.tasks.filter((task) => task.status === "open");
  const mine = snapshot.tasks.filter(
    (task) => task.assignee_user_id === profile.user_id || task.claimed_by_user_id === profile.user_id,
  );
  const active = mine.filter((t) => !["paid", "cancelled"].includes(t.status));
  const done = mine.filter((t) => ["paid", "cancelled"].includes(t.status));

  function getHref(task: Task) {
    if (task.status === "assigned" && task.assignee_user_id === profile.user_id) {
      return `/worker/tasks/${task.id}#submit-work`;
    }
    return `/worker/tasks/${task.id}`;
  }

  return (
    <div className="space-y-4">
      {claimable.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Available to claim</p>
          <div className="mt-3 space-y-2">
            {claimable.map((task) => (
              <Link
                key={task.id}
                href={getHref(task)}
                className="flex items-center justify-between rounded-[20px] border border-blue-100 bg-blue-50 px-4 py-3 transition hover:bg-blue-100"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {formatCurrency(Number(task.reward_minor))}
                    {task.deadline_at ? ` · Due ${formatRelative(task.deadline_at)}` : ""}
                  </p>
                </div>
                <Badge tone="info">Claim</Badge>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {active.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Active</p>
          <div className="mt-3 space-y-2">
            {active.map((task) => (
              <Link
                key={task.id}
                href={getHref(task)}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</p>
                </div>
                <Badge tone={taskTone(task.status)}>{taskLabel(task.status)}</Badge>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {done.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Completed</p>
          <div className="mt-3 space-y-2">
            {done.map((task) => (
              <Link
                key={task.id}
                href={getHref(task)}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</p>
                </div>
                <Badge tone={taskTone(task.status)}>{taskLabel(task.status)}</Badge>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {claimable.length === 0 && mine.length === 0 && (
        <SectionCard>
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No tasks available yet. Join a team to see claimable work.
          </div>
        </SectionCard>
      )}
    </div>
  );
}
