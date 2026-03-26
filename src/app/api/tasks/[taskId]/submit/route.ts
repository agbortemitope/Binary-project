import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  note: z.string().optional().default(""),
  evidence: z.array(
    z.object({
      path: z.string(),
      name: z.string(),
      mimeType: z.string(),
      size: z.number(),
    }),
  ).default([]),
});

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await context.params;
    const body = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("submit_task", {
      p_task_id: taskId,
      p_note: body.note,
      p_evidence: body.evidence,
    });

    if (error) {
      return apiError(error.message, 400);
    }

    return apiSuccess({ submissionId: data });
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Invalid submission payload.", 400, caught.flatten());
    }
    return apiError(caught instanceof Error ? caught.message : "Unable to submit task.", 500);
  }
}
