import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractInviteCodeFromInput } from "@/lib/team-invites";

const schema = z.object({
  inviteCode: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const inviteCode = extractInviteCodeFromInput(body.inviteCode);

    if (!inviteCode) {
      return apiError("Enter a valid invite code or workspace link.", 400);
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("join_team_by_code", {
      p_invite_code: inviteCode,
    });

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ teamId: data });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Enter a valid invite code or workspace link.", 400);
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to join team.", 500);
  }
}
