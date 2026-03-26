import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { attemptBulkTeamPayouts } from "@/lib/payouts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest, context: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await context.params;
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

    const result = await attemptBulkTeamPayouts({
      teamId,
      initiatedByUserId: user.id,
    });

    return apiSuccess(result);
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to run bulk payout.", 500);
  }
}
