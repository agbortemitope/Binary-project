import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";

import { EditProfileForm } from "@/components/forms/edit-profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function WorkerProfilePage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayoutMethod: true });

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-950">{profile.full_name}</p>
            <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
          </div>
          <Badge tone={profile.payout_ready ? "success" : "warning"}>
            {profile.payout_ready ? "Payout ready" : "Payout pending"}
          </Badge>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="font-semibold text-slate-950">Edit details</p>
        <p className="mt-0.5 mb-4 text-sm text-slate-500">Update your name or phone number.</p>
        <EditProfileForm initialFullName={profile.full_name} initialPhone={profile.phone} />
      </SectionCard>

      <SectionCard>
        <p className="font-semibold text-slate-950">Payout account</p>
        <p className="mt-0.5 text-sm text-slate-500">Registered at signup. Contact support to change.</p>
        {snapshot.payoutMethod ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Bank</p>
              <p className="font-semibold text-slate-950">{snapshot.payoutMethod.bank_name}</p>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Account</p>
              <p className="font-semibold text-slate-950">{snapshot.payoutMethod.account_number}</p>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-semibold text-slate-950">{snapshot.payoutMethod.account_name}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
            No payout account on file.
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-950">Sign out</p>
            <p className="mt-0.5 text-sm text-slate-500">Worker account</p>
          </div>
          <SignOutButton variant="secondary" size="md" />
        </div>
      </SectionCard>
    </div>
  );
}
