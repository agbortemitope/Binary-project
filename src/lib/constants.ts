import { BarChart3, Bell, BriefcaseBusiness, CreditCard, LayoutDashboard, ShieldCheck, Users2, Wallet } from "lucide-react";

export const APP_NAME = "CrewPay";
export const DEFAULT_CURRENCY = "NGN";

export const ROLE_VIEWS = ["lead", "worker"] as const;
export type RoleView = (typeof ROLE_VIEWS)[number];

export const LEAD_NAV = [
  { href: "/lead", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lead/teams", label: "Teams", icon: Users2 },
  { href: "/lead/tasks", label: "Tasks", icon: BriefcaseBusiness },
  { href: "/lead/wallet", label: "Wallet", icon: Wallet },
  { href: "/lead/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export const WORKER_NAV = [
  { href: "/worker", label: "Home", icon: LayoutDashboard },
  { href: "/worker/teams", label: "Teams", icon: Users2 },
  { href: "/worker/tasks", label: "Tasks", icon: BriefcaseBusiness },
  { href: "/worker/earnings", label: "Earnings", icon: CreditCard },
  { href: "/worker/profile", label: "Profile", icon: ShieldCheck },
] as const;

export const QUICK_ACTIONS = [
  "Create team",
  "Join team",
  "Fund wallet",
  "Create task",
  "Claim task",
  "Approve submission",
  "Retry payout",
] as const;

export const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
] as const;

export const NOTIFICATION_TONES: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  funding_success: "success",
  payout_failed: "danger",
  payout_success: "success",
  low_wallet_balance: "warning",
  new_submission: "info",
  new_message: "info",
};

export const APP_ROLES = ["owner", "manager", "member"] as const;

export const PREFERENCE_LABELS = {
  lead: "Lead view",
  worker: "Worker view",
};

export const SCHEDULED_PAYOUT_DEFAULTS = {
  daily: "Daily at 6:00 PM Africa/Lagos",
  weekly: "Every Friday at 6:00 PM Africa/Lagos",
  biweekly: "Every other Friday at 6:00 PM Africa/Lagos",
  monthly: "Last day of the month at 6:00 PM Africa/Lagos",
} as const;

export const TOPBAR_LINKS = [
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;
