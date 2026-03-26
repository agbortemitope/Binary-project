import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
      <AppShell
        roleView={profile.default_role_view}
        title={profile.default_role_view === "lead" ? "Lead workspace" : "Worker workspace"}
        eyebrow={profile.default_role_view === "lead" ? "Owner + manager controls" : "Task execution + payouts"}
        unreadCount={0}
      >
        {children}
      </AppShell>
    </main>
  );
}
