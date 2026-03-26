import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getTaskDetailForUser } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

import { ClaimTaskButton } from "@/components/forms/claim-task-button";
import { SubmitTaskForm } from "@/components/forms/submit-task-form";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";

export default async function WorkerTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { profile } = await requireWorkerProfile();
  const { taskId } = await params;
  const detail = await getTaskDetailForUser(profile.user_id, taskId);

  if (!detail) {
    return <SectionCard>Task not found or inaccessible.</SectionCard>;
  }

  const canClaim = detail.task.status === "open";
  const canSubmit = detail.task.status === "assigned" && detail.task.assignee_user_id === profile.user_id;

  return (
    <div className="space-y-5">
      <BackButton fallbackHref="/worker/tasks" />

      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Task detail</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{detail.task.title}</h2>
          </div>
          <Badge tone={detail.task.status === "open" ? "info" : detail.task.status === "submitted" ? "warning" : detail.task.status === "paid" ? "success" : "neutral"}>
            {detail.task.status}
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{detail.task.description}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:border-0 md:bg-slate-50">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reward</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{formatCurrency(Number(detail.task.reward_minor))}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:border-0 md:bg-slate-50">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Deadline</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{formatDateTime(detail.task.deadline_at)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:border-0 md:bg-slate-50">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Team</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{detail.team?.name ?? "Unknown team"}</div>
          </div>
        </div>
      </SectionCard>

      {detail.room ? (
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-slate-950">Task chat</p>
              <p className="text-sm text-slate-600">Use the linked chat room for clarifications and updates.</p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/chat/${detail.room.id}`}>Open task chat</Link>
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {canClaim ? (
        <SectionCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-950">Open claim</p>
              <p className="text-sm text-slate-600">This task is available for the first eligible team member to claim.</p>
            </div>
            <ClaimTaskButton taskId={detail.task.id} />
          </div>
        </SectionCard>
      ) : null}

      {canSubmit ? (
        <SectionCard id="submit-work" className="scroll-mt-24">
          <div>
            <p className="text-lg font-bold text-slate-950">Submit your work</p>
            <p className="text-sm text-slate-600">Add notes and proof so the owner or manager can review the task.</p>
          </div>
          <div className="mt-4">
            <SubmitTaskForm taskId={detail.task.id} />
          </div>
        </SectionCard>
      ) : null}

      {detail.submissions.length > 0 ? (
        <SectionCard>
          <div>
            <p className="text-lg font-bold text-slate-950">Submission history</p>
            <p className="text-sm text-slate-600">Latest uploads and review notes for this task.</p>
          </div>
          <div className="mt-4 space-y-3">
            {detail.submissions.map((submission) => (
              <div key={submission.id} className="rounded-[24px] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">Submission {submission.id.slice(0, 8)}</div>
                  <Badge tone={submission.status === "approved" ? "success" : submission.status === "rejected" ? "danger" : "warning"}>
                    {submission.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-slate-600">{submission.note || "No note added."}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
