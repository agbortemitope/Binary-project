import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";

import { CreateTaskForm } from "@/components/forms/create-task-form";
import { SectionCard } from "@/components/section-card";

export default async function CreateTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const { profile } = await requireLeadProfile();
  const { teamId } = await searchParams;
  const snapshot = await getSnapshotForUser(profile.user_id);
  const leadTeamIds = snapshot.memberships.filter((membership) => membership.role !== "member").map((membership) => membership.team_id);
  const teams = snapshot.teams.filter((team) => leadTeamIds.includes(team.id));
  const admin = createSupabaseAdminClient();
  const { data: members } = leadTeamIds.length
    ? await admin
        .from("team_members")
        .select("team_id, user_id, role")
        .in("team_id", leadTeamIds)
        .eq("status", "active")
    : { data: [] as Array<{ team_id: string; user_id: string; role: "owner" | "manager" | "member" }> };
  const userIds = Array.from(new Set((members ?? []).map((member) => member.user_id)));
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("user_id, full_name").in("user_id", userIds)
    : { data: [] as Array<{ user_id: string; full_name: string }> };
  const profileMap = new Map((profiles ?? []).map((item) => [item.user_id, item.full_name]));

  return (
    <SectionCard>
      <div>
        <p className="text-lg font-bold text-slate-950">Create a task</p>
        <p className="text-sm text-slate-600">Funded tasks reserve money immediately. If you set the reward to 0, you can create and test the task flow first.</p>
      </div>
      <div className="mt-5">
        {teams.length > 0 ? (
          <CreateTaskForm
            teams={teams.map((team) => ({ id: team.id, name: team.name }))}
            members={(members ?? []).map((member) => ({
              teamId: member.team_id,
              userId: member.user_id,
              label: `${profileMap.get(member.user_id) ?? member.user_id} (${member.role})`,
            }))}
            initialTeamId={teamId}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            Create a team first before creating tasks.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
