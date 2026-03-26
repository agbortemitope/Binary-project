"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { LEAD_NAV, WORKER_NAV, type RoleView } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isActivePath(currentPath: string, href: string) {
  if (currentPath === href) {
    return true;
  }

  if (href === "/lead" || href === "/worker") {
    return false;
  }

  return currentPath.startsWith(`${href}/`);
}

export function AppShell({
  children,
  roleView,
  title,
  eyebrow,
  unreadCount,
}: {
  children: React.ReactNode;
  roleView: RoleView;
  title: string;
  eyebrow: string;
  unreadCount: number;
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const navItems = roleView === "lead" ? LEAD_NAV : WORKER_NAV;
  const [liveUnreadCount, setLiveUnreadCount] = useState(unreadCount);

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
    router.prefetch("/notifications");
  }, [navItems, router]);

  useEffect(() => {
    let active = true;

    const controller = new AbortController();

    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json()) as { ok?: boolean; data?: { count?: number } };
        if (!active || !response.ok || !payload.ok) {
          return;
        }

        setLiveUnreadCount(payload.data?.count ?? 0);
      } catch {
        if (active) {
          setLiveUnreadCount(0);
        }
      }
    }

    void loadUnreadCount();

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentPath]);

  return (
    <div className="grid min-h-[100svh] gap-4 lg:min-h-screen lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
      <aside className="glass-card hidden rounded-[32px] p-5 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-extrabold tracking-[0.2em] text-blue-700">
              CP
            </div>
            <div>
              <div className="text-lg font-bold text-slate-950">CrewPay</div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Team Ops + Payouts</div>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(currentPath, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-blue-600 text-white shadow-[0_16px_40px_rgba(31,100,255,0.25)]"
                      : "text-slate-600 hover:bg-white hover:text-slate-950",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
          <p className="mt-2 text-lg font-bold text-slate-950">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Realtime chat, task approvals, and payout controls live inside this workspace.
          </p>
          <div className="mt-4 flex justify-end">
            <Link
              href="/notifications"
              prefetch
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {liveUnreadCount > 0 ? (
                <span className="absolute right-2 top-2 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {liveUnreadCount > 9 ? "9+" : liveUnreadCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </aside>

      <div className="relative min-w-0">
        <div className="mobile-safe-top mb-3 px-1 lg:hidden">
          <div className="rounded-[26px] border border-white/70 bg-white/86 px-4 py-3 shadow-[0_16px_40px_rgba(20,33,61,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-extrabold tracking-[0.22em] text-blue-700">
                  CP
                </div>
              <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {roleView === "lead" ? "Lead view" : "Worker view"}
                  </p>
                  <h1 className="truncate text-lg font-bold text-slate-950">{title}</h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center">
                <Link
                  href="/notifications"
                  prefetch
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {liveUnreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex min-w-[1.05rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                      {liveUnreadCount > 9 ? "9+" : liveUnreadCount}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="px-1 lg:px-0">
          <div className="rounded-[28px] p-0 sm:p-2 lg:glass-card lg:rounded-[32px] lg:border lg:border-white/70 lg:p-6 lg:shadow-[0_24px_64px_rgba(20,33,61,0.12)]">
          <header className="hidden flex-col gap-4 rounded-[28px] bg-white/90 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/notifications"
                prefetch
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {liveUnreadCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 inline-flex min-w-[1.05rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                    {liveUnreadCount > 9 ? "9+" : liveUnreadCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </header>

          <div className="pb-[calc(env(safe-area-inset-bottom)+5.5rem)] lg:mt-5 lg:pb-0">{children}</div>
        </div>
        </div>

        <div className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 lg:hidden">
          <nav className="mx-auto flex max-w-xl items-center gap-1 rounded-[30px] border border-white/70 bg-white/88 p-2 shadow-[0_-8px_30px_rgba(20,33,61,0.08),0_20px_40px_rgba(20,33,61,0.18)] backdrop-blur-xl">
            {navItems.map((item) => {
              const active = isActivePath(currentPath, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-3 text-center transition",
                    active ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(31,100,255,0.28)]" : "text-slate-500",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-500")} />
                  <span className={cn("truncate text-[10px] font-semibold", active ? "text-white" : "text-slate-600")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
