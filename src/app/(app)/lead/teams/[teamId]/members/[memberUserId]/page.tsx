import Link from "next/link";

import { requireLeadProfile } from "@/lib/auth";
import { getLeadTeamMemberDetail, requireTeamAdminRole } from "@/lib/team-management";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { TeamMemberManagementForm } from "@/components/forms/team-member-management-form";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const taskLabels: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  submitted: "In review",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

const payoutLabels: Record<string, string> = {
  pending: "Queued",
  processing: "Pending",
  successful: "Successful",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default async function LeadTeamMemberDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; memberUserId: string }>;
}) {
  const { profile } = await requireLeadProfile();
  const { teamId, memberUserId } = await params;
  const [detail, actorRole] = await Promise.all([
    getLeadTeamMemberDetail({
      actorUserId: profile.user_id,
      teamId,
      memberUserId,
    }),
    requireTeamAdminRole(profile.user_id, teamId),
  ]);

  if (!detail) {
    return <SectionCard>Team member not found or inaccessible.</SectionCard>;
  }

  const memberName = detail.member.profile?.full_name || detail.member.profile?.email || detail.member.user_id;
  const latestPayout = detail.payouts[0] ?? null;
  const payoutBadgeTone = latestPayout
    ? latestPayout.status === "successful"
      ? "success"
      : latestPayout.status === "failed"
        ? "danger"
        : latestPayout.status === "processing"
          ? "info"
          : "neutral"
    : detail.member.payoutMethod?.is_verified
      ? "success"
      : "warning";
  const payoutBadgeLabel = latestPayout
    ? payoutLabels[latestPayout.status] ?? latestPayout.status
    : detail.member.payoutMethod?.is_verified
      ? "Payout ready"
      : "Payout unavailable";

  return (
    <div className="space-y-5">
      <Button asChild variant="secondary" size="sm" className="w-fit">
        <Link href={`/lead/teams/${teamId}`}>Back to team</Link>
      </Button>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Member detail</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{memberName}</h2>
            <p className="mt-2 text-sm text-slate-600">Everything stored for this team member and their payout setup.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={detail.member.role === "member" ? "neutral" : "warning"}>{detail.member.role}</Badge>
            <Badge tone={payoutBadgeTone}>{payoutBadgeLabel}</Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{detail.member.profile?.email || "No email"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{detail.member.profile?.phone || "No phone"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Joined</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{formatRelative(detail.member.joined_at)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assigned payout</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">
              {formatCurrency(detail.member.assignedPayoutMinor)}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Payout account</p>
          <p className="text-sm text-slate-600">This is the bank account CrewPay will use for direct member payouts.</p>
        </div>
        {detail.member.payoutMethod ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bank</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{detail.member.payoutMethod.bank_name}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account number</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{detail.member.payoutMethod.account_number}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account name</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{detail.member.payoutMethod.account_name}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Verification</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">
                {detail.member.payoutMethod.is_verified ? "Verified" : detail.member.payoutMethod.verification_message || "Pending"}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            This member has not added payout account details yet.
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Manage member</p>
          <p className="text-sm text-slate-600">Assign admin rights, set this member's payout amount, or pay them directly.</p>
        </div>
        <div className="mt-4">
          <TeamMemberManagementForm
            teamId={teamId}
            memberUserId={memberUserId}
            memberName={memberName}
            currentRole={detail.member.role}
            assignedPayoutMinor={detail.member.assignedPayoutMinor}
            canManageRole={actorRole === "owner" && detail.member.role !== "owner" && memberUserId !== profile.user_id}
            canRemove={actorRole === "owner" && detail.member.role !== "owner" && memberUserId !== profile.user_id}
            canTriggerPayout={detail.member.role !== "owner"}
            payoutReady={Boolean(detail.member.payoutMethod?.is_verified)}
          />
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard>
          <div>
            <p className="text-lg font-bold text-slate-950">Recent tasks</p>
            <p className="text-sm text-slate-600">Task history linked to this member inside the team.</p>
          </div>
          <div className="mt-4 space-y-3">
            {detail.tasks.length > 0 ? (
              detail.tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/lead/tasks/${task.id}`}
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</div>
                  </div>
                  <Badge tone={task.status === "submitted" ? "warning" : task.status === "paid" ? "success" : task.status === "approved" ? "info" : task.status === "cancelled" ? "danger" : "neutral"}>
                    {taskLabels[task.status] ?? task.status}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No team tasks are linked to this member yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <div>
            <p className="text-lg font-bold text-slate-950">Recent payouts</p>
            <p className="text-sm text-slate-600">Direct or task-based payouts that have been triggered for this member.</p>
          </div>
          <div className="mt-4 space-y-3">
            {detail.payouts.length > 0 ? (
              detail.payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 p-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-950">{formatCurrency(Number(payout.amount_minor))}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatRelative(payout.created_at)}</div>
                  </div>
                  <Badge tone={payout.status === "successful" ? "success" : payout.status === "processing" ? "info" : payout.status === "failed" ? "danger" : "neutral"}>
                    {payoutLabels[payout.status] ?? payout.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No payouts have been triggered for this member yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
