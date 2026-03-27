import { requireLeadProfile } from "@/lib/auth";
import { getTeamDetailForUser } from "@/lib/data";
import { createTeamInviteLink } from "@/lib/team-invites";
import { getTeamMembersWithPayouts, getTeamScheduledPayoutAt } from "@/lib/team-management";
import { env } from "@/lib/env";

import { LeadTeamManagement } from "@/components/team/lead-team-management";
import { TeamDetailView } from "@/components/team/team-detail-view";
import { SectionCard } from "@/components/section-card";

export default async function LeadTeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { profile } = await requireLeadProfile();
  const { teamId } = await params;
  const detail = await getTeamDetailForUser(profile.user_id, teamId);

  if (!detail) {
    return <SectionCard>Team not found or inaccessible.</SectionCard>;
  }

  const [members, scheduledPayoutAt] = await Promise.all([
    getTeamMembersWithPayouts(teamId),
    getTeamScheduledPayoutAt(detail.team.owner_user_id, teamId),
  ]);

  return (
    <div className="space-y-5">
      <TeamDetailView
        roleView="lead"
        currentUserId={profile.user_id}
        team={detail.team}
        membershipRole={detail.membership.role}
        wallet={detail.wallet}
        members={members}
        tasks={detail.tasks}
        teamRoom={detail.teamRoom}
        inviteLink={createTeamInviteLink(env.appUrl, detail.team.invite_code)}
      />
      <LeadTeamManagement
        team={detail.team}
        members={members}
        canEditSettings={detail.membership.role === "owner"}
        scheduledPayoutAt={scheduledPayoutAt}
      />
    </div>
  );
}
