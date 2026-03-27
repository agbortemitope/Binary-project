import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const updates: Record<string, string> = {};
    if (body.fullName !== undefined) updates.full_name = body.fullName;
    if (body.phone !== undefined) updates.phone = body.phone;

    if (Object.keys(updates).length === 0) {
      return apiError("No fields to update.", 400);
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      return apiError("Unable to update profile.", 500);
    }

    return apiSuccess({ updated: true });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid input.", 400);
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to update profile.", 500);
  }
}
