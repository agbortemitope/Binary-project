import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2),
  payoutMode: z.enum(["instant", "scheduled"]),
  payoutFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).nullable(),
  thresholdMinor: z.coerce.number().int().min(0),
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

    const { data, error } = await supabase.rpc("create_team", {
      p_name: body.name,
      p_payout_mode: body.payoutMode,
      p_payout_frequency: body.payoutMode === "scheduled" ? body.payoutFrequency : null,
      p_threshold_minor: body.thresholdMinor,
      p_currency: "NGN",
    });

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ teamId: data }, 201);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Please complete the team form.", 400, caught.flatten());
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to create team.", 500);
  }
}
