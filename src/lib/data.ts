import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ChatRoom,
  Message,
  Notification,
  PaymentCollection,
  Payout,
  PayoutMethod,
  Profile,
  Task,
  TaskSubmission,
  Team,
  TeamMember,
  TeamWallet,
  WorkerEarning,
} from "@/lib/types";

type MembershipRow = TeamMember & {
  team?: Team | null;
};

type TeamMemberRow = TeamMember & {
  profile?: Profile | null;
};

type SnapshotOptions = {
  includePayoutMethod?: boolean;
  includeSubmissions?: boolean;
  includeCollections?: boolean;
  includePayouts?: boolean;
  includeNotifications?: boolean;
  includeChatRooms?: boolean;
};

function logError(scope: string, error: { message: string } | null) {
  if (error) {
    console.error(`[${scope}] ${error.message}`);
  }
}

function toArray<T>(data: T[] | null, scope: string, error: { message: string } | null) {
  logError(scope, error);
  return data ?? [];
}

async function hydrateMessageSenders(messages: Message[]) {
  if (messages.length === 0) {
    return messages;
  }

  const admin = createSupabaseAdminClient();
  const senderIds = [...new Set(messages.map((message) => message.sender_user_id))];
  const { data, error } = await admin.from("profiles").select("*").in("user_id", senderIds);
  logError("hydrateMessageSenders", error);

  const profilesById = new Map((data ?? []).map((profile) => [profile.user_id, profile as Profile]));

  return messages.map((message) => ({
    ...message,
    sender: profilesById.get(message.sender_user_id) ?? null,
  }));
}

export async function getProfileByUserId(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("profiles").select("*").eq("user_id", userId).single();
  logError("getProfileByUserId", error);
  return (data ?? null) as Profile | null;
}

export async function getPayoutMethodByUserId(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("payout_methods").select("*").eq("user_id", userId).maybeSingle();
  logError("getPayoutMethodByUserId", error);
  return (data ?? null) as PayoutMethod | null;
}

export async function getMembershipsForUser(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("team_members")
    .select("*, team:teams(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: false });

  return toArray(data as MembershipRow[] | null, "getMembershipsForUser", error);
}

export async function getSnapshotForUser(userId: string, options: SnapshotOptions = {}) {
  const admin = createSupabaseAdminClient();
  const [profile, payoutMethod, memberships] = await Promise.all([
    getProfileByUserId(userId),
    options.includePayoutMethod ? getPayoutMethodByUserId(userId) : Promise.resolve(null),
    getMembershipsForUser(userId),
  ]);

  const teams = memberships
    .map((membership) => membership.team)
    .filter(Boolean) as Team[];
  const teamIds = teams.map((team) => team.id);

  if (teamIds.length === 0) {
    return {
      profile,
      payoutMethod,
      memberships,
      teams: [] as Team[],
      wallets: [] as TeamWallet[],
      tasks: [] as Task[],
      submissions: [] as TaskSubmission[],
      earnings: [] as WorkerEarning[],
      collections: [] as PaymentCollection[],
      payouts: [] as Payout[],
      notifications: [] as Notification[],
      chatRooms: [] as ChatRoom[],
    };
  }

  const [
    walletsResult,
    tasksResult,
    earningsResult,
    collectionsResult,
    payoutsResult,
    notificationsResult,
    chatRoomsResult,
  ] = await Promise.all([
    admin.from("team_wallets").select("*").in("team_id", teamIds),
    admin.from("tasks").select("*").in("team_id", teamIds).order("created_at", { ascending: false }),
    admin.from("worker_earnings").select("*").in("team_id", teamIds).order("approved_at", { ascending: false }),
    options.includeCollections
      ? admin.from("payment_collections").select("*").in("team_id", teamIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as PaymentCollection[], error: null }),
    options.includePayouts
      ? admin.from("payouts").select("*").in("team_id", teamIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Payout[], error: null }),
    options.includeNotifications
      ? admin.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Notification[], error: null }),
    options.includeChatRooms
      ? admin.from("chat_room_members").select("room:chat_rooms(*)").eq("user_id", userId)
      : Promise.resolve({ data: [] as Array<{ room: ChatRoom[] | null }>, error: null }),
  ]);

  const tasks = toArray(tasksResult.data as Task[] | null, "getSnapshotForUser.tasks", tasksResult.error);
  const taskIds = tasks.map((task) => task.id);

  let submissions: TaskSubmission[] = [];
  if (options.includeSubmissions && taskIds.length > 0) {
    const result = await admin
      .from("task_submissions")
      .select("*")
      .in("task_id", taskIds)
      .order("created_at", { ascending: false });
    submissions = toArray(result.data as TaskSubmission[] | null, "getSnapshotForUser.submissions", result.error);
  }

  return {
    profile,
    payoutMethod,
    memberships,
    teams,
    wallets: toArray(walletsResult.data as TeamWallet[] | null, "getSnapshotForUser.wallets", walletsResult.error),
    tasks,
    submissions,
    earnings: toArray(earningsResult.data as WorkerEarning[] | null, "getSnapshotForUser.earnings", earningsResult.error),
    collections: toArray(collectionsResult.data as PaymentCollection[] | null, "getSnapshotForUser.collections", collectionsResult.error),
    payouts: toArray(payoutsResult.data as Payout[] | null, "getSnapshotForUser.payouts", payoutsResult.error),
    notifications: toArray(
      notificationsResult.data as Notification[] | null,
      "getSnapshotForUser.notifications",
      notificationsResult.error,
    ),
    chatRooms: ((chatRoomsResult.data ?? []) as Array<{ room: ChatRoom[] | null }>).flatMap((row) => row.room ?? []),
  };
}

export async function getTeamDetailForUser(userId: string, teamId: string) {
  const admin = createSupabaseAdminClient();
  const memberships = await getMembershipsForUser(userId);
  const membership = memberships.find((item) => item.team_id === teamId);

  if (!membership?.team) {
    return null;
  }

  const [walletResult, membersResult, tasksResult, teamRoomResult] = await Promise.all([
    admin.from("team_wallets").select("*").eq("team_id", teamId).maybeSingle(),
    admin
      .from("team_members")
      .select("*, profile:profiles(*)")
      .eq("team_id", teamId)
      .eq("status", "active")
      .order("joined_at", { ascending: true }),
    admin.from("tasks").select("*").eq("team_id", teamId).order("created_at", { ascending: false }),
    admin.from("chat_rooms").select("*").eq("team_id", teamId).eq("type", "team").maybeSingle(),
  ]);

  return {
    team: membership.team as Team,
    membership,
    wallet: (walletResult.data ?? null) as TeamWallet | null,
    members: toArray(membersResult.data as TeamMemberRow[] | null, "getTeamDetailForUser.members", membersResult.error),
    tasks: toArray(tasksResult.data as Task[] | null, "getTeamDetailForUser.tasks", tasksResult.error),
    teamRoom: (teamRoomResult.data ?? null) as ChatRoom | null,
  };
}

export async function getTaskDetailForUser(userId: string, taskId: string) {
  const admin = createSupabaseAdminClient();
  const { data: task, error } = await admin.from("tasks").select("*").eq("id", taskId).maybeSingle();
  logError("getTaskDetailForUser.task", error);

  if (!task) {
    return null;
  }

  const memberships = await getMembershipsForUser(userId);
  if (!memberships.some((membership) => membership.team_id === task.team_id)) {
    return null;
  }

  const [teamResult, submissionsResult, earningResult, roomResult] = await Promise.all([
    admin.from("teams").select("*").eq("id", task.team_id).single(),
    admin.from("task_submissions").select("*").eq("task_id", taskId).order("created_at", { ascending: false }),
    admin.from("worker_earnings").select("*").eq("task_id", taskId).maybeSingle(),
    admin.from("chat_rooms").select("*").eq("task_id", taskId).maybeSingle(),
  ]);

  let messages: Message[] = [];
  if (roomResult.data?.id) {
    const messagesResult = await admin
      .from("messages")
      .select("*")
      .eq("room_id", roomResult.data.id)
      .order("created_at", { ascending: true });
    messages = await hydrateMessageSenders(
      toArray(messagesResult.data as Message[] | null, "getTaskDetailForUser.messages", messagesResult.error),
    );
  }

  return {
    task: task as Task,
    team: (teamResult.data ?? null) as Team | null,
    submissions: toArray(submissionsResult.data as TaskSubmission[] | null, "getTaskDetailForUser.submissions", submissionsResult.error),
    earning: (earningResult.data ?? null) as WorkerEarning | null,
    room: (roomResult.data ?? null) as ChatRoom | null,
    messages,
  };
}

export async function getChatRoomDetail(userId: string, roomId: string) {
  const admin = createSupabaseAdminClient();
  const { data: membership, error: membershipError } = await admin
    .from("chat_room_members")
    .select("*")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();

  logError("getChatRoomDetail.membership", membershipError);
  if (!membership) {
    return null;
  }

  const [roomResult, messagesResult] = await Promise.all([
    admin.from("chat_rooms").select("*").eq("id", roomId).single(),
    admin.from("messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }),
  ]);

  const messages = await hydrateMessageSenders(
    toArray(messagesResult.data as Message[] | null, "getChatRoomDetail.messages", messagesResult.error),
  );

  return {
    room: (roomResult.data ?? null) as ChatRoom | null,
    messages,
  };
}
