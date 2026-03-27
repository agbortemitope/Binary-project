import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { EARNING_STATUS_LABELS, PAYOUT_STATUS_LABELS } from "@/lib/constants";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import type { EarningStatus, PayoutStatus } from "@/lib/types";

function earningTone(status: EarningStatus): "success" | "info" | "warning" | "danger" | "neutral" {
  if (status === "paid") return "success";
  if (status === "processing") return "info";
  if (status === "failed") return "danger";
  if (status === "cancelled") return "neutral";
  return "warning";
}

function payoutTone(status: PayoutStatus): "success" | "info" | "warning" | "danger" | "neutral" {
  if (status === "successful") return "success";
  if (status === "processing") return "info";
  if (status === "failed") return "danger";
  if (status === "cancelled") return "neutral";
  return "warning";
}

export default async function WorkerEarningsPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayouts: true });

  const earnings = snapshot.earnings.filter((e) => e.worker_user_id === profile.user_id);
  const payouts = snapshot.payouts.filter((p) => p.worker_user_id === profile.user_id);

  const totalPaid = earnings.filter((e) => e.status === "paid").reduce((s, e) => s + Number(e.amount_minor), 0);
  const totalPending = earnings
    .filter((e) => ["pending", "processing"].includes(e.status))
    .reduce((s, e) => s + Number(e.amount_minor), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Paid out</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-[22px] bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Pending</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      <SectionCard>
        <p className="font-semibold text-slate-950">Earnings</p>
        <p className="mt-0.5 text-sm text-slate-500">Task approvals generate an earning record. Payouts follow.</p>
        <div className="mt-4 space-y-2">
          {earnings.length > 0 ? (
            earnings.map((earning) => {
              const task = snapshot.tasks.find((t) => t.id === earning.task_id);
              return (
                <div
                  key={earning.id}
                  className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">
                      {task?.title ?? "Task earning"}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatCurrency(Number(earning.amount_minor))}
                      {earning.approved_at ? ` · ${formatRelative(earning.approved_at)}` : ""}
                    </p>
                  </div>
                  <Badge tone={earningTone(earning.status)}>
                    {EARNING_STATUS_LABELS[earning.status] ?? earning.status}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              No earnings yet. Complete and submit tasks to earn.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="font-semibold text-slate-950">Payout history</p>
        <p className="mt-0.5 text-sm text-slate-500">Bank transfers triggered for your approved earnings.</p>
        <div className="mt-4 space-y-2">
          {payouts.length > 0 ? (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{formatCurrency(Number(payout.amount_minor))}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {payout.recipient_bank_name} · {payout.recipient_account_number}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatRelative(payout.created_at)}</p>
                </div>
                <Badge tone={payoutTone(payout.status)}>
                  {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              No payout records yet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
