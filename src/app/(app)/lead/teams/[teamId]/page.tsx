import { requireLeadProfile } from "@/lib/auth";
import { getTeamDetailForUser } from "@/lib/data";
import { createTeamInviteLink } from "@/lib/team-invites";
import { env } from "@/lib/env";

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

  return (
    <TeamDetailView
      roleView="lead"
      currentUserId={profile.user_id}
      team={detail.team}
      membershipRole={detail.membership.role}
      wallet={detail.wallet}
      members={detail.members}
      tasks={detail.tasks}
      teamRoom={detail.teamRoom}
      inviteLink={createTeamInviteLink(env.appUrl, detail.team.invite_code)}
    />
  );
}
