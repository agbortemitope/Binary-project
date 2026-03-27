import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { updateTeamSettings } from "@/lib/team-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  payoutMode: z.enum(["instant", "scheduled"]),
  payoutFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).nullable().optional(),
  scheduledPayoutAt: z.string().datetime().nullable().optional(),
  thresholdMinor: z.coerce.number().int().min(0),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await context.params;
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

    const team = await updateTeamSettings({
      actorUserId: user.id,
      teamId,
      payoutMode: body.payoutMode,
      payoutFrequency: body.payoutMode === "scheduled" ? (body.payoutFrequency ?? null) : null,
      scheduledPayoutAt: body.payoutMode === "scheduled" ? (body.scheduledPayoutAt ?? null) : null,
      thresholdMinor: body.thresholdMinor,
    });

    return apiSuccess({ team });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid team settings payload.", 400, caught.flatten());
    }

    return apiError(caught instanceof Error ? caught.message : "Unable to update team settings.", 500);
  }
}
