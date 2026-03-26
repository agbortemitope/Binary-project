import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AssignmentMode } from "@/lib/types";

type CreateManagedTaskInput = {
  actorUserId: string;
  teamId: string;
  title: string;
  description: string;
  assignmentMode: AssignmentMode;
  rewardMinor: number;
  deadlineAt: string | null;
  assigneeUserId: string | null;
};

type ApproveZeroRewardTaskInput = {
  actorUserId: string;
  taskId: string;
  submissionId: string;
};

async function insertNotification(input: {
  userId: string;
  teamId: string;
  taskId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("notifications").insert({
    user_id: input.userId,
    team_id: input.teamId,
    task_id: input.taskId,
    type: input.type,
    title: input.title,
    body: input.body,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createManagedTask(input: CreateManagedTaskInput) {
  const admin = createSupabaseAdminClient();
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title || !description) {
    throw new Error("Task title and description are required.");
  }

  if (input.rewardMinor < 0) {
    throw new Error("Task reward cannot be negative.");
  }

  const { data: membership, error: membershipError } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", input.teamId)
    .eq("user_id", input.actorUserId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    throw new Error("You do not have permission to create tasks for this team.");
  }

  if (input.assignmentMode === "assigned" && !input.assigneeUserId) {
    throw new Error("Assigned tasks need an assignee.");
  }

  if (input.assigneeUserId) {
    const { data: assigneeMembership, error: assigneeError } = await admin
      .from("team_members")
      .select("user_id")
      .eq("team_id", input.teamId)
      .eq("user_id", input.assigneeUserId)
      .eq("status", "active")
      .maybeSingle();

    if (assigneeError) {
      throw new Error(assigneeError.message);
    }

    if (!assigneeMembership) {
      throw new Error("Assigned user is not an active member of this team.");
    }
  }

  let reservedWalletState: { available: number; reserved: number } | null = null;

  if (input.rewardMinor > 0) {
    const { data: wallet, error: walletLookupError } = await admin
      .from("team_wallets")
      .select("available_balance_minor, reserved_balance_minor")
      .eq("team_id", input.teamId)
      .maybeSingle();

    if (walletLookupError) {
      throw new Error(walletLookupError.message);
    }

    if (!wallet) {
      throw new Error("Team wallet not found.");
    }

    if (Number(wallet.available_balance_minor) < input.rewardMinor) {
      throw new Error("Insufficient wallet balance.");
    }

    reservedWalletState = {
      available: Number(wallet.available_balance_minor),
      reserved: Number(wallet.reserved_balance_minor),
    };

    const { error: walletUpdateError } = await admin
      .from("team_wallets")
      .update({
        available_balance_minor: reservedWalletState.available - input.rewardMinor,
        reserved_balance_minor: reservedWalletState.reserved + input.rewardMinor,
      })
      .eq("team_id", input.teamId);

    if (walletUpdateError) {
      throw new Error(walletUpdateError.message);
    }

  }

  const { data: task, error: taskError } = await admin
    .from("tasks")
    .insert({
      team_id: input.teamId,
      created_by_user_id: input.actorUserId,
      assignment_mode: input.assignmentMode,
      title,
      description,
      reward_minor: input.rewardMinor,
      deadline_at: input.deadlineAt,
      status: input.assignmentMode === "assigned" ? "assigned" : "open",
      assignee_user_id: input.assignmentMode === "assigned" ? input.assigneeUserId : null,
    })
    .select("id")
    .single();

  if (taskError || !task) {
    if (reservedWalletState) {
      await admin
        .from("team_wallets")
        .update({
          available_balance_minor: reservedWalletState.available,
          reserved_balance_minor: reservedWalletState.reserved,
        })
        .eq("team_id", input.teamId);
    }
    throw new Error(taskError?.message ?? "Unable to create task.");
  }

  if (reservedWalletState) {
    const { error: ledgerError } = await admin.from("wallet_ledger_entries").insert({
      team_id: input.teamId,
      type: "task_reserve",
      amount_minor: -input.rewardMinor,
      task_id: task.id,
      created_by_user_id: input.actorUserId,
      metadata: {
        assignment_mode: input.assignmentMode,
      },
    });

    if (ledgerError) {
      throw new Error(ledgerError.message);
    }
  }

  const { data: room, error: roomError } = await admin
    .from("chat_rooms")
    .insert({
      team_id: input.teamId,
      task_id: task.id,
      type: "task",
      name: title,
      created_by_user_id: input.actorUserId,
    })
    .select("id")
    .single();

  if (roomError || !room) {
    throw new Error(roomError?.message ?? "Unable to create the task chat room.");
  }

  const chatMembers = [input.actorUserId, input.assigneeUserId].filter(Boolean).map((userId) => ({
    room_id: room.id,
    user_id: userId,
  }));

  if (chatMembers.length > 0) {
    const { error: memberError } = await admin.from("chat_room_members").upsert(chatMembers, {
      onConflict: "room_id,user_id",
      ignoreDuplicates: true,
    });

    if (memberError) {
      throw new Error(memberError.message);
    }
  }

  if (input.assigneeUserId && input.assigneeUserId !== input.actorUserId) {
    await insertNotification({
      userId: input.assigneeUserId,
      teamId: input.teamId,
      taskId: task.id,
      type: "task_assigned",
      title: "Task assigned",
      body:
        input.rewardMinor > 0
          ? "A new funded task was assigned to you."
          : "A new task was assigned to you. This task carries no payout value yet.",
      metadata: {
        team_id: input.teamId,
        task_id: task.id,
        reward_minor: input.rewardMinor,
      },
    });
  }

  return task.id;
}

export async function approveZeroRewardTaskSubmission(input: ApproveZeroRewardTaskInput) {
  const admin = createSupabaseAdminClient();
  const { data: task, error: taskError } = await admin
    .from("tasks")
    .select("id, team_id, status, reward_minor, assignee_user_id")
    .eq("id", input.taskId)
    .maybeSingle();

  if (taskError) {
    throw new Error(taskError.message);
  }

  if (!task) {
    throw new Error("Task not found.");
  }

  const { data: membership, error: membershipError } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", task.team_id)
    .eq("user_id", input.actorUserId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    throw new Error("Only team owners and managers can review submissions.");
  }

  if (task.status !== "submitted") {
    throw new Error("Task is not waiting for review.");
  }

  if (Number(task.reward_minor) !== 0) {
    throw new Error("This shortcut is only for zero-reward tasks.");
  }

  const { data: submission, error: submissionLookupError } = await admin
    .from("task_submissions")
    .select("id")
    .eq("id", input.submissionId)
    .eq("task_id", input.taskId)
    .maybeSingle();

  if (submissionLookupError) {
    throw new Error(submissionLookupError.message);
  }

  if (!submission) {
    throw new Error("Submission not found for this task.");
  }

  const timestamp = new Date().toISOString();
  const { error: submissionError } = await admin
    .from("task_submissions")
    .update({
      status: "approved",
      rejection_reason: null,
      reviewed_by_user_id: input.actorUserId,
      reviewed_at: timestamp,
    })
    .eq("id", input.submissionId)
    .eq("task_id", input.taskId);

  if (submissionError) {
    throw new Error(submissionError.message);
  }

  const { error: taskUpdateError } = await admin
    .from("tasks")
    .update({
      status: "paid",
      approved_at: timestamp,
      paid_at: timestamp,
      updated_at: timestamp,
    })
    .eq("id", input.taskId);

  if (taskUpdateError) {
    throw new Error(taskUpdateError.message);
  }

  if (task.assignee_user_id) {
    await insertNotification({
      userId: task.assignee_user_id,
      teamId: task.team_id,
      taskId: input.taskId,
      type: "task_approved",
      title: "Task approved",
      body: "Your submission was approved and marked complete. No payout was needed for this zero-value task.",
      metadata: {
        team_id: task.team_id,
        task_id: input.taskId,
        reward_minor: 0,
      },
    });
  }

  return task.id;
}
