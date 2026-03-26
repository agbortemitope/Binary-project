import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { attemptDirectTeamMemberPayout } from "@/lib/payouts";
import { getTeamMembersWithPayouts } from "@/lib/team-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  amountMinor: z.coerce.number().int().min(0).optional(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ teamId: string; memberUserId: string }> }) {
  try {
    const { teamId, memberUserId } = await context.params;
    const body = schema.parse(await request.json().catch(() => ({})));
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

    const members = await getTeamMembersWithPayouts(teamId);
    const member = members.find((item) => item.user_id === memberUserId);

    if (!member) {
      return apiError("Team member not found.", 404);
    }

    const amountMinor = body.amountMinor ?? member.assignedPayoutMinor;
    if (amountMinor <= 0) {
      return apiError("Assign a payout amount before paying this member.", 400);
    }

    const result = await attemptDirectTeamMemberPayout({
      teamId,
      memberUserId,
      initiatedByUserId: user.id,
      amountMinor,
      narration: "CrewPay team payout",
    });

    return apiSuccess(result);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid payout payload.", 400, caught.flatten());
    }

    return apiError(caught instanceof Error ? caught.message : "Unable to pay team member.", 500);
  }
}
