import Link from "next/link";

import { formatCurrency } from "@/lib/utils";
import type { Team } from "@/lib/types";
import type { TeamMemberWithPayout } from "@/lib/team-management";

import { TeamBulkPayoutButton } from "@/components/forms/team-bulk-payout-button";
import { TeamSettingsForm } from "@/components/forms/team-settings-form";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export function LeadTeamManagement({
  team,
  members,
  canEditSettings,
  scheduledPayoutAt,
}: {
  team: Team;
  members: TeamMemberWithPayout[];
  canEditSettings: boolean;
  scheduledPayoutAt: string | null;
}) {
  const payableMembers = members.filter((member) => member.assignedPayoutMinor > 0);
  const totalAssignedPayout = payableMembers.reduce((sum, member) => sum + member.assignedPayoutMinor, 0);

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-950">Team management</p>
          <p className="text-sm text-slate-600">
            Set payout rules, assign member payout amounts, and trigger team payouts from here.
          </p>
        </div>
        <TeamBulkPayoutButton teamId={team.id} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Payout settings</p>
            <p className="mt-2 text-sm text-slate-600">
              Choose how the team releases money, and set the threshold for scheduled runs.
            </p>
          </div>
          {canEditSettings ? (
            <TeamSettingsForm
              teamId={team.id}
              payoutMode={team.payout_mode}
              payoutFrequency={team.payout_frequency}
              scheduledPayoutAt={scheduledPayoutAt}
              thresholdMinor={Number(team.threshold_minor)}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Only the team owner can edit payout mode, schedule, and threshold settings.
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
          <div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Assigned payouts</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Total</span>
                <span className="text-lg font-bold text-slate-950">{formatCurrency(totalAssignedPayout)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/lead/teams/${team.id}/members/${member.user_id}`}
                className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-950">
                    {member.profile?.full_name || member.profile?.email || member.user_id}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Assigned payout: {formatCurrency(member.assignedPayoutMinor)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!member.payoutMethod?.is_verified ? <Badge tone="warning">Payout unavailable</Badge> : null}
                  <Badge tone={member.role === "member" ? "neutral" : "warning"}>{member.role}</Badge>
                </div>
              </Link>
            ))}
            {members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No active members to manage yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
