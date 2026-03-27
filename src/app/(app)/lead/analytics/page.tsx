import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { SignOutButton } from "@/components/sign-out-button";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function LeadSettingsPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayouts: true });
  const leadTeamIds = snapshot.memberships
    .filter((m) => m.role !== "member")
    .map((m) => m.team_id);
  const payouts = snapshot.payouts.filter((p) => leadTeamIds.includes(p.team_id));
  const tasks = snapshot.tasks.filter((t) => leadTeamIds.includes(t.team_id));

  const totalPayoutsSuccessful = payouts
    .filter((p) => p.status === "successful")
    .reduce((s, p) => s + Number(p.amount_minor), 0);
  const active = tasks.filter((t) => ["open", "assigned"].includes(t.status)).length;
  const inReview = tasks.filter((t) => t.status === "submitted").length;
  const completed = tasks.filter((t) => ["approved", "paid"].includes(t.status)).length;

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-950">{profile.full_name}</p>
            <p className="mt-0.5 text-sm text-slate-500">{profile.email} · Team lead</p>
          </div>
          <SignOutButton variant="secondary" size="md" />
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Workspace stats</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[18px] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total tasks</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{tasks.length}</p>
          </div>
          <div className="rounded-[18px] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{active}</p>
          </div>
          <div className="rounded-[18px] border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">In review</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{inReview}</p>
          </div>
          <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Completed</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{completed}</p>
          </div>
        </div>
        <div className="mt-3 rounded-[18px] border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Total paid out</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(totalPayoutsSuccessful)}</p>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="font-semibold text-slate-950">Recent payouts</p>
        <div className="mt-3 space-y-2">
          {payouts.length > 0 ? (
            payouts.slice(0, 8).map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">
                    {payout.recipient_account_name || "Crew member"}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatCurrency(Number(payout.amount_minor))} · {payout.recipient_bank_name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatRelative(payout.created_at)}</p>
                </div>
                <Badge
                  tone={
                    payout.status === "successful"
                      ? "success"
                      : payout.status === "processing"
                        ? "info"
                        : payout.status === "failed"
                          ? "danger"
                          : "neutral"
                  }
                >
                  {payout.status === "successful" ? "Sent" : payout.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              No payouts yet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
