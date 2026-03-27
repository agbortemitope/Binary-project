import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { requireWorkerProfile } from "@/lib/auth";
import { getTaskDetailForUser } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

import { ClaimTaskButton } from "@/components/forms/claim-task-button";
import { SubmitTaskForm } from "@/components/forms/submit-task-form";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

function taskTone(status: string): "warning" | "success" | "info" | "danger" | "neutral" {
  if (status === "submitted") return "warning";
  if (status === "paid") return "success";
  if (status === "approved") return "info";
  if (status === "cancelled") return "danger";
  if (status === "open") return "info";
  return "neutral";
}

const statusLabels: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  submitted: "In review",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

export default async function WorkerTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { profile } = await requireWorkerProfile();
  const { taskId } = await params;
  const detail = await getTaskDetailForUser(profile.user_id, taskId);

  if (!detail) {
    return (
      <SectionCard>
        <p className="text-sm text-slate-500">Task not found or inaccessible.</p>
      </SectionCard>
    );
  }

  const canClaim = detail.task.status === "open";
  const canSubmit = detail.task.status === "assigned" && detail.task.assignee_user_id === profile.user_id;
  const latestSubmission = detail.submissions[0];

  return (
    <div className="space-y-4">
      <Link
        href="/worker/tasks"
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
            {statusLabels[detail.task.status] ?? detail.task.status}
          </Badge>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{detail.task.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reward</p>
            <p className="mt-1.5 text-lg font-bold text-slate-950">{formatCurrency(Number(detail.task.reward_minor))}</p>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Deadline</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">{formatDateTime(detail.task.deadline_at)}</p>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-3 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Mode</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950 capitalize">{detail.task.assignment_mode.replace("_", " ")}</p>
          </div>
        </div>

        {detail.room && (
          <div className="mt-4">
            <Link
              href={`/chat/${detail.room.id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <MessageSquare className="h-4 w-4" />
              Open task chat
            </Link>
          </div>
        )}
      </SectionCard>

      {canClaim && (
        <SectionCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">Claim this task</p>
              <p className="mt-0.5 text-sm text-slate-500">First eligible member to claim gets the assignment.</p>
            </div>
            <ClaimTaskButton taskId={detail.task.id} />
          </div>
        </SectionCard>
      )}

      {canSubmit && (
        <SectionCard id="submit-work" className="scroll-mt-24">
          <p className="font-semibold text-slate-950">Submit your work</p>
          <p className="mt-0.5 mb-4 text-sm text-slate-500">Add a note and attach proof so the lead can review.</p>
          <SubmitTaskForm taskId={detail.task.id} />
        </SectionCard>
      )}

      {detail.submissions.length > 0 && (
        <SectionCard>
          <p className="font-semibold text-slate-950">Submissions</p>
          <div className="mt-3 space-y-2">
            {detail.submissions.map((sub) => (
              <div key={sub.id} className="rounded-[20px] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">#{sub.id.slice(0, 8)}</p>
                  <Badge
                    tone={sub.status === "approved" ? "success" : sub.status === "rejected" ? "danger" : "warning"}
                  >
                    {sub.status}
                  </Badge>
                </div>
                {sub.note && <p className="mt-2 text-sm text-slate-700">{sub.note}</p>}
                {sub.rejection_reason && (
                  <p className="mt-2 text-sm text-rose-600">Rejection: {sub.rejection_reason}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
