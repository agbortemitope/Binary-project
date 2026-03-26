import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1),
  attachments: z
    .array(
      z.object({
        path: z.string(),
        name: z.string(),
        mimeType: z.string(),
        size: z.number(),
      }),
    )
    .default([]),
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

    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: body.roomId,
        sender_user_id: user.id,
        content: body.content,
        attachments: body.attachments,
      })
      .select("*")
      .single();

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ message: data }, 201);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid message payload.", 400);
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to send message.", 500);
  }
}
