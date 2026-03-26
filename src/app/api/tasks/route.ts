import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { createZeroRewardTask } from "@/lib/task-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  teamId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(5),
  assignmentMode: z.enum(["assigned", "open_claim"]),
  rewardMinor: z.coerce.number().int().min(0),
  deadlineAt: z.string().nullable(),
  assigneeUserId: z.string().uuid().nullable(),
});

export async function POST(request: NextRequest) {
  try {
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

    if (body.rewardMinor === 0) {
      const taskId = await createZeroRewardTask({
        actorUserId: user.id,
        teamId: body.teamId,
        title: body.title,
        description: body.description,
        assignmentMode: body.assignmentMode,
        deadlineAt: body.deadlineAt,
        assigneeUserId: body.assignmentMode === "assigned" ? body.assigneeUserId : null,
      });

      return apiSuccess({ taskId }, 201);
    }

    const { data, error } = await supabase.rpc("create_task", {
      p_team_id: body.teamId,
      p_title: body.title,
      p_description: body.description,
      p_assignment_mode: body.assignmentMode,
      p_reward_minor: body.rewardMinor,
      p_deadline_at: body.deadlineAt,
      p_assignee_user_id: body.assignmentMode === "assigned" ? body.assigneeUserId : null,
    });

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ taskId: data }, 201);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Please complete the task form.", 400, caught.flatten());
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to create task.", 500);
  }
}
