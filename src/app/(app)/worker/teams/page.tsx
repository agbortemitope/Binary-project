import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";

import { JoinTeamForm } from "@/components/forms/join-team-form";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function WorkerTeamsPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Joined teams</p>
            <p className="text-sm text-slate-600">All active teams tied to your worker account.</p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {snapshot.teams.length > 0 ? (
            snapshot.teams.map((team) => (
              <Link key={team.id} href={`/worker/teams/${team.id}`} className="block rounded-[24px] border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Invite code: {team.invite_code}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={team.payout_mode === "instant" ? "info" : "success"}>{team.payout_mode}</Badge>
                    <span className="text-sm font-semibold text-blue-600">Open</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              You have not joined any teams yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-lg font-bold text-slate-950">Join a team</p>
          <p className="text-sm text-slate-600">Paste the invite code or the shareable team link sent by the lead.</p>
        </div>
        <div className="mt-4">
          <JoinTeamForm />
        </div>
      </SectionCard>
    </div>
  );
}
