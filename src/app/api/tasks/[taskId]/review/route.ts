import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { attemptPayoutForEarning } from "@/lib/payouts";
import { approveZeroRewardTaskSubmission } from "@/lib/task-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  submissionId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional().default(""),
});

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await context.params;
    const body = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    try {
      await assertAccountRole(user.id, "lead");
    } catch (caught) {
      return apiError(caught instanceof Error ? caught.message : "Lead account required.", 403);
    }

    const admin = createSupabaseAdminClient();
    const { data: task, error: taskError } = await admin
      .from("tasks")
      .select("id, team_id, reward_minor")
      .eq("id", taskId)
      .maybeSingle();

    if (taskError) {
      return apiError(taskError.message, 400);
    }

    if (!task) {
      return apiError("Task not found.", 404);
    }

    if (body.decision === "approve" && Number(task.reward_minor) === 0) {
      const approvedTaskId = await approveZeroRewardTaskSubmission({
        actorUserId: user.id,
        taskId,
        submissionId: body.submissionId,
      });

      return apiSuccess({
        taskId: approvedTaskId,
        payout: {
          started: false,
          payoutId: null,
          reason: "Submission approved. No payout was needed for this 0 NGN task.",
        },
      });
    }

    const { data, error } = await supabase.rpc("review_task_submission", {
      p_task_id: taskId,
      p_submission_id: body.submissionId,
      p_decision: body.decision,
      p_rejection_reason: body.decision === "reject" ? body.rejectionReason : null,
    });

    if (error) {
      return apiError(error.message, 400);
    }

    let payoutResult: { started: boolean; payoutId: string | null; reason: string | null } | null = null;
    if (body.decision === "approve") {
      const [{ data: team }, { data: earning }] = await Promise.all([
        admin.from("teams").select("*").eq("id", task.team_id).single(),
        admin.from("worker_earnings").select("*").eq("task_id", taskId).maybeSingle(),
      ]);

      if (team?.payout_mode === "instant" && earning) {
        payoutResult = await attemptPayoutForEarning({
          earningId: earning.id,
          initiatedByUserId: user.id,
        });
      }
    }

    return apiSuccess({
      taskId: data,
      payout: payoutResult,
    });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid review payload.", 400, caught.flatten());
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to review submission.", 500);
  }
}
