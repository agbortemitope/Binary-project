import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, RoleView } from "@/lib/types";

export async function getCurrentSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { supabase, user };
  } catch {
    return { supabase: null, user: null };
  }
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
  const data = await getProfileRecord(user.id);

  if (!data) {
    redirect("/sign-up");
  }

  return { user, profile: data };
}

export async function getProfileRecord(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single<Profile>();

  if (error) {
    return null;
  }

  return data;
}

async function requireAccountRole(role: RoleView) {
  const context = await requireProfile();

  if (context.profile.default_role_view !== role) {
    redirect(role === "lead" ? "/worker" : "/lead");
  }

  return context;
}

export async function requireLeadProfile() {
  return requireAccountRole("lead");
}

export async function requireWorkerProfile() {
  return requireAccountRole("worker");
}

export async function assertAccountRole(userId: string, role: RoleView) {
  const profile = await getProfileRecord(userId);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  if (profile.default_role_view !== role) {
    throw new Error(
      role === "lead"
        ? "This action requires a lead account. Use a separate worker account for crewmate access."
        : "This action requires a worker account. Use a separate lead account for owner actions.",
    );
  }

  return profile;
}
