import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Payout,
  PayoutFrequency,
  PayoutMethod,
  PayoutMode,
  Profile,
  Task,
  Team,
  TeamMember,
  TeamMemberRole,
} from "@/lib/types";

type TeamMemberRow = TeamMember & {
  profile?: Profile | null;
};

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export type TeamMemberWithPayout = TeamMemberRow & {
  payoutMethod: PayoutMethod | null;
  assignedPayoutMinor: number;
};

export function getAssignedPayoutMinorFromMetadata(
  providerMetadata: Record<string, unknown> | null | undefined,
  teamId: string,
) {
  const root = asRecord(providerMetadata);
  const settings = asRecord(root?.team_payout_settings);
  const teamSettings = asRecord(settings?.[teamId]);
  const amountMinor = Number(teamSettings?.assigned_payout_minor ?? 0);

  if (!Number.isFinite(amountMinor) || amountMinor < 0) {
    return 0;
  }

  return Math.round(amountMinor);
}

function withAssignedPayoutMetadata(
  providerMetadata: Record<string, unknown> | null | undefined,
  teamId: string,
  amountMinor: number,
) {
  const root = { ...(asRecord(providerMetadata) ?? {}) };
  const settings = { ...(asRecord(root.team_payout_settings) ?? {}) };

  if (amountMinor > 0) {
    settings[teamId] = {
      ...(asRecord(settings[teamId]) ?? {}),
      assigned_payout_minor: amountMinor,
    };
  } else {
    delete settings[teamId];
  }

  root.team_payout_settings = settings;
  return root;
}

export async function requireTeamAdminRole(actorUserId: string, teamId: string) {
  const admin = createSupabaseAdminClient();
  const { data: membership, error } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", actorUserId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    throw new Error("You do not have permission to manage this team.");
  }

  return membership.role as TeamMemberRole;
}

export async function getTeamMembersWithPayouts(teamId: string) {
  const admin = createSupabaseAdminClient();
  const { data: members, error: membersError } = await admin
    .from("team_members")
    .select("*, profile:profiles(*)")
    .eq("team_id", teamId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  if (membersError) {
    throw new Error(membersError.message);
  }

  const memberRows = (members ?? []) as TeamMemberRow[];
  const userIds = [...new Set(memberRows.map((member) => member.user_id))];
  const { data: payoutMethods, error: payoutMethodsError } = userIds.length
    ? await admin.from("payout_methods").select("*").in("user_id", userIds)
    : { data: [] as PayoutMethod[], error: null };

  if (payoutMethodsError) {
    throw new Error(payoutMethodsError.message);
  }

  const payoutMethodByUserId = new Map((payoutMethods ?? []).map((item) => [item.user_id, item as PayoutMethod]));

  return memberRows.map((member) => {
    const payoutMethod = payoutMethodByUserId.get(member.user_id) ?? null;

    return {
      ...member,
      payoutMethod,
      assignedPayoutMinor: getAssignedPayoutMinorFromMetadata(payoutMethod?.provider_metadata ?? null, teamId),
    } satisfies TeamMemberWithPayout;
  });
}

export async function updateTeamSettings(input: {
  actorUserId: string;
  teamId: string;
  payoutMode: PayoutMode;
  payoutFrequency: PayoutFrequency | null;
  thresholdMinor: number;
}) {
  const admin = createSupabaseAdminClient();
  const actorRole = await requireTeamAdminRole(input.actorUserId, input.teamId);

  if (actorRole !== "owner") {
    throw new Error("Only the team owner can update team settings.");
  }

  const { data: team, error } = await admin
    .from("teams")
    .update({
      payout_mode: input.payoutMode,
      payout_frequency: input.payoutMode === "scheduled" ? input.payoutFrequency : null,
      threshold_minor: Math.max(0, input.thresholdMinor),
    })
    .eq("id", input.teamId)
    .eq("owner_user_id", input.actorUserId)
    .select("*")
    .single();

  if (error || !team) {
    throw new Error(error?.message ?? "Unable to update team settings.");
  }

  return team as Team;
}

export async function updateTeamMember(input: {
  actorUserId: string;
  teamId: string;
  memberUserId: string;
  role?: TeamMemberRole;
  assignedPayoutMinor?: number;
}) {
  const admin = createSupabaseAdminClient();
  const actorRole = await requireTeamAdminRole(input.actorUserId, input.teamId);

  const { data: member, error: memberError } = await admin
    .from("team_members")
    .select("*")
    .eq("team_id", input.teamId)
    .eq("user_id", input.memberUserId)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    throw new Error("Team member not found.");
  }

  if (typeof input.role === "undefined" && typeof input.assignedPayoutMinor === "undefined") {
    throw new Error("No team member changes were provided.");
  }

  if (typeof input.role !== "undefined") {
    if (actorRole !== "owner") {
      throw new Error("Only the team owner can change member roles.");
    }

    if (input.memberUserId === input.actorUserId) {
      throw new Error("You cannot change your own owner role from here.");
    }

    if (member.role === "owner") {
      throw new Error("The team owner role cannot be changed from member management.");
    }

    const { error } = await admin
      .from("team_members")
      .update({ role: input.role })
      .eq("team_id", input.teamId)
      .eq("user_id", input.memberUserId);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (typeof input.assignedPayoutMinor !== "undefined") {
    if (input.assignedPayoutMinor < 0) {
      throw new Error("Assigned payout cannot be negative.");
    }

    const { data: payoutMethod, error: payoutMethodError } = await admin
      .from("payout_methods")
      .select("*")
      .eq("user_id", input.memberUserId)
      .maybeSingle();

    if (payoutMethodError) {
      throw new Error(payoutMethodError.message);
    }

    if (!payoutMethod) {
      throw new Error("This member has not added payout details yet.");
    }

    const { error } = await admin
      .from("payout_methods")
      .update({
        provider_metadata: withAssignedPayoutMetadata(
          payoutMethod.provider_metadata as Record<string, unknown> | null,
          input.teamId,
          input.assignedPayoutMinor,
        ),
      })
      .eq("id", payoutMethod.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function removeTeamMember(input: {
  actorUserId: string;
  teamId: string;
  memberUserId: string;
}) {
  const admin = createSupabaseAdminClient();
  const actorRole = await requireTeamAdminRole(input.actorUserId, input.teamId);

  if (actorRole !== "owner") {
    throw new Error("Only the team owner can remove members.");
  }

  if (input.memberUserId === input.actorUserId) {
    throw new Error("You cannot remove yourself from your own team.");
  }

  const { data: member, error: memberError } = await admin
    .from("team_members")
    .select("*")
    .eq("team_id", input.teamId)
    .eq("user_id", input.memberUserId)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    throw new Error("Team member not found.");
  }

  if (member.role === "owner") {
    throw new Error("The team owner cannot be removed.");
  }

  const { data: activeTasks, error: taskError } = await admin
    .from("tasks")
    .select("id, status")
    .eq("team_id", input.teamId)
    .eq("assignee_user_id", input.memberUserId);

  if (taskError) {
    throw new Error(taskError.message);
  }

  if ((activeTasks ?? []).some((task) => !["paid", "cancelled"].includes(String(task.status)))) {
    throw new Error("Finish or reassign this member's active tasks before removing them.");
  }

  const { error: updateError } = await admin
    .from("team_members")
    .update({ status: "left" })
    .eq("team_id", input.teamId)
    .eq("user_id", input.memberUserId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { data: rooms, error: roomError } = await admin.from("chat_rooms").select("id").eq("team_id", input.teamId);
  if (roomError) {
    throw new Error(roomError.message);
  }

  const roomIds = (rooms ?? []).map((room) => room.id);
  if (roomIds.length > 0) {
    const { error: memberChatError } = await admin
      .from("chat_room_members")
      .delete()
      .eq("user_id", input.memberUserId)
      .in("room_id", roomIds);

    if (memberChatError) {
      throw new Error(memberChatError.message);
    }
  }
}

export async function getLeadTeamMemberDetail(input: {
  actorUserId: string;
  teamId: string;
  memberUserId: string;
}) {
  const admin = createSupabaseAdminClient();
  await requireTeamAdminRole(input.actorUserId, input.teamId);

  const [{ data: team, error: teamError }, members, { data: tasks, error: tasksError }, { data: payouts, error: payoutsError }] =
    await Promise.all([
      admin.from("teams").select("*").eq("id", input.teamId).maybeSingle(),
      getTeamMembersWithPayouts(input.teamId),
      admin
        .from("tasks")
        .select("*")
        .eq("team_id", input.teamId)
        .or(
          `assignee_user_id.eq.${input.memberUserId},claimed_by_user_id.eq.${input.memberUserId},created_by_user_id.eq.${input.memberUserId}`,
        )
        .order("created_at", { ascending: false })
        .limit(8),
      admin
        .from("payouts")
        .select("*")
        .eq("team_id", input.teamId)
        .eq("worker_user_id", input.memberUserId)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  if (teamError) {
    throw new Error(teamError.message);
  }

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  if (payoutsError) {
    throw new Error(payoutsError.message);
  }

  const member = members.find((item) => item.user_id === input.memberUserId);
  if (!team || !member) {
    return null;
  }

  return {
    team: team as Team,
    member,
    tasks: (tasks ?? []) as Task[],
    payouts: (payouts ?? []) as Payout[],
  };
}
