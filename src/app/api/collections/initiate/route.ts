import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { assertAccountRole } from "@/lib/auth";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildCheckoutPayload } from "@/lib/interswitch";
import { createSupabaseServerClient } from "@/lib/supabase/server";
const schema = z.object({
  teamId: z.string().uuid(),
  amountMinor: z.coerce.number().int().positive(),
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

    const { data, error } = await supabase.rpc("create_collection", {
      p_team_id: body.teamId,
      p_amount_minor: body.amountMinor,
    });

    if (error || !data?.[0]) {
      return apiError(error?.message ?? "Unable to create funding record.", 400);
    }

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from("profiles").select("*").eq("user_id", user.id).single();
    const { data: team } = await admin.from("teams").select("*").eq("id", body.teamId).single();
    const origin = request.nextUrl.origin;

    const checkoutPayload = buildCheckoutPayload({
      amountMinor: body.amountMinor,
      txnRef: data[0].txn_ref,
      customerName: profile?.full_name ?? "CrewPay User",
      customerEmail: profile?.email ?? user.email ?? "",
      customerId: user.id,
      redirectUrl: `${origin}/api/collections/callback?verification=${data[0].id}`,
      payItemName: `${team?.name ?? "CrewPay Team"} wallet funding`,
    });

    return apiSuccess({
      collectionId: data[0].id,
      checkoutPayload,
      checkoutFormUrl: env.interswitch.checkoutFormUrl,
      checkoutScriptUrl: env.interswitch.checkoutScriptUrl,
    }, 201);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid funding payload.", 400, caught.flatten());
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to initiate funding.", 500);
  }
}
