import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { attemptPayoutForEarning } from "@/lib/payouts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  earningId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const body = schema.parse(await request.json());
    const result = await attemptPayoutForEarning({
      earningId: body.earningId,
      initiatedByUserId: user.id,
    });

    return apiSuccess(result);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid payout retry payload.", 400);
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to retry payout.", 500);
  }
}
