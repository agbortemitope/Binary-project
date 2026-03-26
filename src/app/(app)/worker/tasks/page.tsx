import Link from "next/link";

import { requireProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function WorkerTasksPage() {
  const { profile } = await requireProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);
  const claimable = snapshot.tasks.filter((task) => task.status === "open");
  const mine = snapshot.tasks.filter((task) => task.assignee_user_id === profile.user_id || task.claimed_by_user_id === profile.user_id);
  const tasks = [...mine, ...claimable.filter((task) => !mine.some((myTask) => myTask.id === task.id))];

  return (
    <SectionCard>
      <div>
        <p className="text-lg font-bold text-slate-950">Task board</p>
        <p className="text-sm text-slate-600">Assigned work and open-claim opportunities from your teams.</p>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Link key={task.id} href={`/worker/tasks/${task.id}`} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-950">{task.title}</div>
                <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</div>
              </div>
              <Badge tone={task.status === "open" ? "info" : task.status === "submitted" ? "warning" : task.status === "paid" ? "success" : "neutral"}>
                {task.status}
              </Badge>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            No tasks are available yet.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
