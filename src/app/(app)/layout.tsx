import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";

function getShellTitle(name: string | null | undefined) {
  return name?.trim() || "CrewPay";
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();

  return (
    <main className="mx-auto w-full max-w-7xl px-3 pb-3 pt-2 sm:px-6 sm:py-3 lg:px-8">
      <AppShell
        roleView={profile.default_role_view}
        title={getShellTitle(profile.full_name)}
        eyebrow={profile.default_role_view === "lead" ? "Lead view" : "Worker view"}
        unreadCount={0}
      >
        {children}
      </AppShell>
    </main>
  );
}
