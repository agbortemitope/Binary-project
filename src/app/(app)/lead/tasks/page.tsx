import Link from "next/link";

import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function LeadTasksPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);
  const leadTeamIds = snapshot.memberships.filter((membership) => membership.role !== "member").map((membership) => membership.team_id);
  const tasks = snapshot.tasks.filter((task) => leadTeamIds.includes(task.team_id));

  return (
    <div className="space-y-5">
      <SectionCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-slate-950">Task operations</p>
          <p className="text-sm text-slate-600">Reserve, review, approve, and cancel work from one queue.</p>
        </div>
        <Button asChild>
          <Link href="/lead/tasks/new">Create task</Link>
        </Button>
      </SectionCard>

      <SectionCard>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Link key={task.id} href={`/lead/tasks/${task.id}`} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-950">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={task.status === "submitted" ? "warning" : task.status === "paid" ? "success" : task.status === "approved" ? "info" : "neutral"}>
                    {task.status}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              Create a funded task, or set the reward to 0 if you want to test the workflow before funding.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
