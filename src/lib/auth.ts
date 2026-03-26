import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireUser() {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireProfile() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single<Profile>();

  if (error || !data) {
    redirect("/sign-up");
  }

  return { user, profile: data };
}
