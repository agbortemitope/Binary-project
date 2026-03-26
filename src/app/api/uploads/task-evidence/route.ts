import { randomUUID } from "crypto";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadPrivateFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const taskId = String(formData.get("taskId") ?? "draft");

    if (!(file instanceof File)) {
      return apiError("No file provided.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${user.id}/${taskId}/${randomUUID()}-${file.name}`;

    await uploadPrivateFile({
      bucket: "task-evidence",
      path,
      file: buffer,
      contentType: file.type || "application/octet-stream",
    });

    return apiSuccess({
      path,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    }, 201);
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to upload evidence.", 500);
  }
}
