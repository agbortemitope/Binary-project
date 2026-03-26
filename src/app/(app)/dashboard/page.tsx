import { redirect } from "next/navigation";

import { requireProfile } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const { profile } = await requireProfile();
  redirect(profile.default_role_view === "lead" ? "/lead" : "/worker");
}
