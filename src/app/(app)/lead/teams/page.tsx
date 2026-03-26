import Link from "next/link";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { CreateTeamDialog } from "@/components/forms/create-team-dialog";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function LeadTeamsPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id);
  const leadMemberships = snapshot.memberships.filter((membership) => membership.role !== "member");
  const leadTeamIds = leadMemberships.map((membership) => membership.team_id);
  const teams = snapshot.teams.filter((team) => leadTeamIds.includes(team.id));
  const admin = createSupabaseAdminClient();
  const { data: teamMembers } = leadTeamIds.length
    ? await admin.from("team_members").select("team_id").in("team_id", leadTeamIds)
    : { data: [] as Array<{ team_id: string }> };

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-950">Managed teams</p>
          <p className="text-sm text-slate-600">Invite members with the code below and fund each team separately.</p>
        </div>
        <CreateTeamDialog />
      </div>
      <div className="mt-4 space-y-4">
        {teams.length > 0 ? (
          teams.map((team) => {
            const wallet = snapshot.wallets.find((item) => item.team_id === team.id);
            const membersCount = (teamMembers ?? []).filter((row) => row.team_id === team.id).length;
            return (
              <Link key={team.id} href={`/lead/teams/${team.id}`} className="block rounded-[24px] border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold text-slate-950">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Invite code: {team.invite_code}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={team.payout_mode === "instant" ? "info" : "success"}>{team.payout_mode}</Badge>
                    <span className="text-sm font-semibold text-blue-600">Open</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]">Members</div>
                    <div className="mt-2 text-lg font-bold text-slate-950">{membersCount}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]">Available</div>
                    <div className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(Number(wallet?.available_balance_minor ?? 0))}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]">Reserved</div>
                    <div className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(Number(wallet?.reserved_balance_minor ?? 0))}</div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            No teams yet. Create your first one to start assigning and funding work.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
