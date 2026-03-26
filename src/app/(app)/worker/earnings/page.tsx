import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function WorkerEarningsPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayouts: true });
  const earnings = snapshot.earnings.filter((earning) => earning.worker_user_id === profile.user_id);
  const payouts = snapshot.payouts.filter((payout) => payout.worker_user_id === profile.user_id);

  return (
    <div className="space-y-5">
      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Earnings</p>
          <p className="text-sm text-slate-600">Approved work becomes pending payout, then moves to paid once the transfer succeeds.</p>
        </div>
        <div className="mt-4 space-y-3">
          {earnings.length > 0 ? (
            earnings.map((earning) => (
              <div key={earning.id} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-950">Task earning</div>
                  <div className="mt-1 text-sm text-slate-500">{formatCurrency(Number(earning.amount_minor))}</div>
                </div>
                <Badge tone={earning.status === "paid" ? "success" : earning.status === "processing" ? "info" : earning.status === "failed" ? "danger" : "warning"}>
                  {earning.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No earnings yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Payout history</p>
          <p className="text-sm text-slate-600">Transfers triggered by instant approvals or scheduled payout windows.</p>
        </div>
        <div className="mt-4 space-y-3">
          {payouts.length > 0 ? (
            payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between rounded-[24px] border border-slate-200 p-4">
                <div>
                  <div className="font-semibold text-slate-950">{formatCurrency(Number(payout.amount_minor))}</div>
                  <div className="mt-1 text-sm text-slate-500">{payout.recipient_bank_name}</div>
                </div>
                <Badge tone={payout.status === "successful" ? "success" : payout.status === "processing" ? "info" : "danger"}>
                  {payout.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No payout records yet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
