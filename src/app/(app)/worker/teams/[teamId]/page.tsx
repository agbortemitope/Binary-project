import { requireProfile } from "@/lib/auth";
import { getTeamDetailForUser } from "@/lib/data";

import { TeamDetailView } from "@/components/team/team-detail-view";
import { SectionCard } from "@/components/section-card";

export default async function WorkerTeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { profile } = await requireProfile();
  const { teamId } = await params;
  const detail = await getTeamDetailForUser(profile.user_id, teamId);

  if (!detail) {
    return <SectionCard>Team not found or inaccessible.</SectionCard>;
  }

  return (
    <TeamDetailView
      roleView="worker"
      currentUserId={profile.user_id}
      team={detail.team}
      membershipRole={detail.membership.role}
      wallet={detail.wallet}
      members={detail.members}
      tasks={detail.tasks}
      teamRoom={detail.teamRoom}
    />
  );
}
