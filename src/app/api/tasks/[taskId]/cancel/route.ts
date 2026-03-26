import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(_: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
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

  const { data, error } = await supabase.rpc("cancel_task", {
    p_task_id: taskId,
  });

  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess({ taskId: data });
}
