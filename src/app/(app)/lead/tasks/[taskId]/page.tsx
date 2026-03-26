import Link from "next/link";

import { requireProfile } from "@/lib/auth";
import { getTaskDetailForUser } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

import { ReviewTaskActions } from "@/components/forms/review-task-actions";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function LeadTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { profile } = await requireProfile();
  const { taskId } = await params;
  const detail = await getTaskDetailForUser(profile.user_id, taskId);

  if (!detail) {
    return <SectionCard>Task not found or inaccessible.</SectionCard>;
  }

  const latestSubmission = detail.submissions[0];

  return (
    <div className="space-y-5">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Task detail</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{detail.task.title}</h2>
          </div>
          <Badge tone={detail.task.status === "submitted" ? "warning" : detail.task.status === "paid" ? "success" : detail.task.status === "approved" ? "info" : "neutral"}>
            {detail.task.status}
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{detail.task.description}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reward</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{formatCurrency(Number(detail.task.reward_minor))}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Deadline</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{formatDateTime(detail.task.deadline_at)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Team</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{detail.team?.name ?? "Unknown team"}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Latest submission</p>
            <p className="text-sm text-slate-600">Review evidence and release or reopen the task.</p>
          </div>
          {detail.room ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/chat/${detail.room.id}`}>Open task chat</Link>
            </Button>
          ) : null}
        </div>
        {latestSubmission ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Submission note</div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{latestSubmission.note || "No note added."}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Evidence</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {latestSubmission.evidence.length > 0 ? (
                  latestSubmission.evidence.map((item) => <li key={`${item.path}-${item.name}`}>{item.name}</li>)
                ) : (
                  <li>No evidence files uploaded.</li>
                )}
              </ul>
            </div>
            {detail.task.status === "submitted" ? (
              <ReviewTaskActions taskId={detail.task.id} submissionId={latestSubmission.id} />
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            No submission has been uploaded yet.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
