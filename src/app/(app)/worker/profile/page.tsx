import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function WorkerProfilePage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayoutMethod: true });

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Profile</p>
            <p className="text-sm text-slate-600">This account is configured for worker access. Use a separate lead account to create teams or tasks.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full name</div>
            <div className="mt-2 text-lg font-bold text-slate-950">{profile.full_name}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</div>
            <div className="mt-2 text-lg font-bold text-slate-950">{profile.email}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</div>
            <div className="mt-2 text-lg font-bold text-slate-950">{profile.phone ?? "N/A"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payout ready</div>
            <div className="mt-2">
              <Badge tone={profile.payout_ready ? "success" : "warning"}>{profile.payout_ready ? "Ready" : "Pending verification"}</Badge>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Payout method</p>
          <p className="text-sm text-slate-600">Bank details stored during signup.</p>
        </div>
        {snapshot.payoutMethod ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bank</div>
              <div className="mt-2 text-lg font-bold text-slate-950">{snapshot.payoutMethod.bank_name}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account number</div>
              <div className="mt-2 text-lg font-bold text-slate-950">{snapshot.payoutMethod.account_number}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account name</div>
              <div className="mt-2 text-lg font-bold text-slate-950">{snapshot.payoutMethod.account_name}</div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            No payout method stored yet.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
