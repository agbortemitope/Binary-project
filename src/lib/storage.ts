import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function uploadPrivateFile({
  bucket,
  path,
  file,
  contentType,
}: {
  bucket: string;
  path: string;
  file: Buffer;
  contentType: string;
}) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function getSignedFileUrl(bucket: string, path: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 15);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}
