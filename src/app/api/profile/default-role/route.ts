import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileRecord } from "@/lib/auth";

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

    const profile = await getProfileRecord(user.id);

    if (!profile) {
      return apiError("Profile not found.", 404);
    }

    if (body.role !== profile.default_role_view) {
      return apiError("Your account type is fixed after signup. Use a separate account for the other workspace.", 403);
    }

    return apiSuccess({ role: profile.default_role_view });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid role selection.", 400);
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to update default role.", 500);
  }
}
