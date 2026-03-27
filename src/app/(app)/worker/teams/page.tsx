import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";

import { SectionCard } from "@/components/section-card";
import { WorkerTeamJoinDialog } from "@/components/team/worker-team-join-dialog";
import { Badge } from "@/components/ui/badge";

export default async function WorkerTeamsPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-950">Your teams</p>
        <WorkerTeamJoinDialog />
      </div>

      <div className="mt-4 space-y-2">
        {snapshot.teams.length > 0 ? (
          snapshot.teams.map((team) => {
            const membership = snapshot.memberships.find((m) => m.team_id === team.id);
            return (
              <Link
                key={team.id}
                href={`/worker/teams/${team.id}`}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{team.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Code: {team.invite_code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={team.payout_mode === "instant" ? "info" : "success"}>{team.payout_mode}</Badge>
                  {membership && (
                    <Badge tone={membership.role === "member" ? "neutral" : "warning"}>{membership.role}</Badge>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No teams yet. Use an invite code to join.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
