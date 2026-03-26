import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  role: z.enum(["lead", "worker"]),
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

    const { error } = await supabase
      .from("profiles")
      .update({ default_role_view: body.role })
      .eq("user_id", user.id);

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ role: body.role });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid role selection.", 400);
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to update default role.", 500);
  }
}
