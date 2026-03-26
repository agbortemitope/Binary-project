import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { removeTeamMember, updateTeamMember } from "@/lib/team-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  role: z.enum(["manager", "member"]).optional(),
  assignedPayoutMinor: z.coerce.number().int().min(0).optional(),
});

async function requireLeadUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: apiError("Authentication required.", 401) };
  }

  try {
    await assertAccountRole(user.id, "lead");
  } catch (caught) {
    return {
      user: null,
      error: apiError(caught instanceof Error ? caught.message : "Lead account required.", 403),
    };
  }

  return { user, error: null };
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ teamId: string; memberUserId: string }> }) {
  try {
    const { user, error } = await requireLeadUser();
    if (error || !user) {
      return error;
    }

    const { teamId, memberUserId } = await context.params;
    const body = schema.parse(await request.json());

    await updateTeamMember({
      actorUserId: user.id,
      teamId,
      memberUserId,
      role: body.role,
      assignedPayoutMinor: body.assignedPayoutMinor,
    });

    return apiSuccess({ saved: true });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid member update payload.", 400, caught.flatten());
    }

    return apiError(caught instanceof Error ? caught.message : "Unable to update team member.", 500);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ teamId: string; memberUserId: string }> }) {
  try {
    const { user, error } = await requireLeadUser();
    if (error || !user) {
      return error;
    }

    const { teamId, memberUserId } = await context.params;
    await removeTeamMember({
      actorUserId: user.id,
      teamId,
      memberUserId,
    });

    return apiSuccess({ removed: true });
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to remove team member.", 500);
  }
}
