import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { attemptPayoutForEarning } from "@/lib/payouts";
import { getTeamScheduledPayoutAtFromMetadata, setTeamScheduledPayoutAt } from "@/lib/team-management";

function isDueForFrequency(frequency: string, now: Date) {
  const hour = now.getHours();
  if (hour !== 18) return false;

  if (frequency === "daily") return true;
  if (frequency === "weekly") return now.getDay() === 5;
  if (frequency === "biweekly") return now.getDay() === 5 && Math.ceil(now.getDate() / 7) % 2 === 1;
  if (frequency === "monthly") {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow.getMonth() !== now.getMonth();
  }

  return false;
}

function isDueForScheduledAt(scheduledAt: string, now: Date) {
  const parsed = new Date(scheduledAt);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.getTime() <= now.getTime();
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${env.cronSecret}`) {
    return apiError("Unauthorized.", 401);
  }

  try {
    const admin = createSupabaseAdminClient();
    const now = new Date();

    const [{ data: teams }, { data: earnings }] = await Promise.all([
      admin.from("teams").select("*").eq("payout_mode", "scheduled"),
      admin.from("worker_earnings").select("*").in("status", ["pending", "failed"]),
    ]);

    const ownerIds = [...new Set((teams ?? []).map((team) => team.owner_user_id))];
    const { data: ownerPayoutMethods } = ownerIds.length
      ? await admin.from("payout_methods").select("user_id, provider_metadata").in("user_id", ownerIds)
      : { data: [] as Array<{ user_id: string; provider_metadata: Record<string, unknown> | null }> };

    const ownerPayoutMethodByUserId = new Map(
      (ownerPayoutMethods ?? []).map((item) => [item.user_id, item.provider_metadata as Record<string, unknown> | null]),
    );

    const eligibleTeams = (teams ?? [])
      .map((team) => {
        const scheduledPayoutAt = getTeamScheduledPayoutAtFromMetadata(ownerPayoutMethodByUserId.get(team.owner_user_id), team.id);
        const due = scheduledPayoutAt
          ? isDueForScheduledAt(scheduledPayoutAt, now)
          : isDueForFrequency(String(team.payout_frequency), now);

        return {
          team,
          scheduledPayoutAt,
          due,
        };
      })
      .filter((item) => item.due);

    const eligibleTeamIds = eligibleTeams.map((item) => item.team.id);

    if (eligibleTeamIds.length === 0) {
      return apiSuccess({ processed: 0, message: "No scheduled teams are due right now." });
    }

    const teamMap = new Map(eligibleTeams.map((item) => [item.team.id, item.team]));
    let processed = 0;
    let skipped = 0;
    const attemptedGroups = new Set<string>();

    for (const earning of (earnings ?? []).filter((row) => eligibleTeamIds.includes(row.team_id))) {
      const team = teamMap.get(earning.team_id);
      if (!team) continue;

      const groupKey = `${earning.team_id}:${earning.worker_user_id}`;
      if (attemptedGroups.has(groupKey)) {
        continue;
      }
      attemptedGroups.add(groupKey);

      const relatedTeamEarnings = (earnings ?? []).filter(
        (row) => row.team_id === earning.team_id && row.worker_user_id === earning.worker_user_id && ["pending", "failed"].includes(row.status),
      );
      const totalPending = relatedTeamEarnings.reduce((sum, row) => sum + Number(row.amount_minor), 0);
      if (totalPending < Number(team.threshold_minor)) {
        skipped += relatedTeamEarnings.length;
        continue;
      }

      for (const pendingEarning of relatedTeamEarnings) {
        const result = await attemptPayoutForEarning({
          earningId: pendingEarning.id,
          initiatedByUserId: team.owner_user_id,
        });

        if (result.started) {
          processed += 1;
        } else {
          skipped += 1;
        }
      }
    }

    const teamsWithCustomSchedule = eligibleTeams.filter((item) => item.scheduledPayoutAt);
    await Promise.allSettled(
      teamsWithCustomSchedule.map((item) =>
        setTeamScheduledPayoutAt({
          actorUserId: item.team.owner_user_id,
          teamId: item.team.id,
          scheduledPayoutAt: null,
        }),
      ),
    );

    return apiSuccess({ processed, skipped, clearedSchedules: teamsWithCustomSchedule.length });
  } catch (caught) {
    return apiError(caught instanceof Error ? caught.message : "Unable to run scheduled payouts.", 500);
  }
}
