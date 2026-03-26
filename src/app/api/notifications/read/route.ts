import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("mark_notifications_read");

  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess({ updated: true });
}
