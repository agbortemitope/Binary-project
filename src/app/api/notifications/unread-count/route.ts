import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return apiError(userError.message, 401);
    }

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ count: count ?? 0 });
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to load unread notifications.", 500);
  }
}
