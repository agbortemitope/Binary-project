import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireLeadProfile } from "@/lib/auth";
import { getTaskDetailForUser } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils";

import { ReviewTaskActions } from "@/components/forms/review-task-actions";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const taskStatusLabels: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  submitted: "In review",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

function taskTone(status: string): "warning" | "success" | "info" | "danger" | "neutral" {
  if (status === "submitted") return "warning";
  if (status === "paid") return "success";
  if (status === "approved") return "info";
  if (status === "cancelled") return "danger";
  return "neutral";
}

export default async function LeadTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { profile } = await requireLeadProfile();
  const { taskId } = await params;
  const detail = await getTaskDetailForUser(profile.user_id, taskId);

  if (!detail) {
    return <SectionCard>Task not found or inaccessible.</SectionCard>;
  }

  const latestSubmission = detail.submissions[0];
  const admin = createSupabaseAdminClient();
  const participantIds = [
    ...new Set([latestSubmission?.submitted_by_user_id, detail.task.assignee_user_id].filter(Boolean)),
  ];
  const { data: profiles } = participantIds.length
    ? await admin.from("profiles").select("*").in("user_id", participantIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  const submitter = latestSubmission ? profileById.get(latestSubmission.submitted_by_user_id) ?? null : null;
  const assignee = detail.task.assignee_user_id ? profileById.get(detail.task.assignee_user_id) ?? null : null;
  const { data: payoutMethod } = detail.task.assignee_user_id
    ? await admin.from("payout_methods").select("*").eq("user_id", detail.task.assignee_user_id).maybeSingle()
    : { data: null };

  return (
    <div className="space-y-4">
      <Link
        href="/lead/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Tasks
      </Link>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-950">{detail.task.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{detail.team?.name}</p>
          </div>
          <Badge tone={taskTone(detail.task.status)}>
            {taskStatusLabels[detail.task.status] ?? detail.task.status}
          </Badge>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{detail.task.description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reward</p>
            <p className="mt-1.5 text-xl font-bold text-slate-950">{formatCurrency(Number(detail.task.reward_minor))}</p>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Deadline</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">{formatDateTime(detail.task.deadline_at)}</p>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Assignment</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950 capitalize">
              {detail.task.assignment_mode.replace("_", " ")}
            </p>
          </div>
        </div>

        {detail.room && (
          <div className="mt-4">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/chat/${detail.room.id}`}>Open task chat</Link>
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <p className="font-semibold text-slate-950">
          {detail.task.status === "submitted" ? "Review submission" : "Latest submission"}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {detail.task.status === "submitted"
            ? "Approve to trigger payout, or reject and reopen the task."
            : "Submitted work and evidence from the assigned worker."}
        </p>

        {latestSubmission ? (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Submitted by</p>
                <p className="mt-2 font-semibold text-slate-950">
                  {submitter?.full_name || submitter?.email || latestSubmission.submitted_by_user_id}
                </p>
                {submitter?.phone && <p className="mt-0.5 text-sm text-slate-500">{submitter.phone}</p>}
              </div>
              <div className="rounded-[18px] border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payout destination</p>
                <p className="mt-2 font-semibold text-slate-950">
                  {assignee?.full_name || assignee?.email || "No assignee"}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {payoutMethod
                    ? `${payoutMethod.bank_name} · ${payoutMethod.account_number}`
                    : "No payout method on file"}
                </p>
              </div>
            </div>

            <div className="rounded-[18px] border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Note</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {latestSubmission.note || "No note provided."}
              </p>
            </div>

            {latestSubmission.evidence.length > 0 && (
              <div className="rounded-[18px] border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Evidence</p>
                <ul className="mt-2 space-y-1">
                  {latestSubmission.evidence.map((item) => (
                    <li key={`${item.path}-${item.name}`} className="text-sm text-slate-700">
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detail.task.status === "submitted" && (
              <ReviewTaskActions taskId={detail.task.id} submissionId={latestSubmission.id} />
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
            No submission yet.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
