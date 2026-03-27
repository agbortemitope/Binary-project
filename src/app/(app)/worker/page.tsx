import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatCurrency, formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function WorkerDashboardPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includePayouts: true });

  const myTasks = snapshot.tasks.filter(
    (task) => task.assignee_user_id === profile.user_id || task.claimed_by_user_id === profile.user_id,
  );
  const openTasks = snapshot.tasks.filter((task) => task.status === "open");
  const submittedTasks = myTasks.filter((task) => task.status === "submitted");
  const myEarnings = snapshot.earnings.filter((e) => e.worker_user_id === profile.user_id);
  const myPayouts = snapshot.payouts.filter((payout) => payout.worker_user_id === profile.user_id);
  const pendingEarnings = myEarnings.filter((e) => ["pending", "processing"].includes(e.status));
  const paidEarnings = myEarnings.filter((e) => e.status === "paid");
  const pendingTotal = pendingEarnings.reduce((s, e) => s + Number(e.amount_minor), 0);
  const paidTotal = paidEarnings.reduce((s, e) => s + Number(e.amount_minor), 0);
  const latestPayout = myPayouts[0] ?? null;

  let payoutHeadline = "Pending payout";
  let payoutAmount = pendingTotal;

  if (latestPayout?.status === "failed") {
    payoutHeadline = "Failed payout";
    payoutAmount = Number(latestPayout.amount_minor);
  } else if (latestPayout?.status === "successful") {
    payoutHeadline = "Successful payout";
    payoutAmount = Number(latestPayout.amount_minor);
  } else if (latestPayout?.status === "processing" || latestPayout?.status === "pending") {
    payoutHeadline = "Pending payout";
    payoutAmount = Number(latestPayout.amount_minor);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-slate-950 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{payoutHeadline}</p>
        <p className="mt-2 text-3xl font-bold">{formatCurrency(payoutAmount)}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-white/60">
            {formatCurrency(paidTotal)} paid total
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Link href="/worker/tasks">Find work</Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Link href="/worker/earnings">Payout history</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">My tasks</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{myTasks.length}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Claimable</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{openTasks.length}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">In review</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{submittedTasks.length}</p>
        </div>
      </div>

      {openTasks.length > 0 && (
        <SectionCard>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-950">Available to claim</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/worker/tasks">All tasks</Link>
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {openTasks.slice(0, 4).map((task) => (
              <Link
                key={task.id}
                href={`/worker/tasks/${task.id}`}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatCurrency(Number(task.reward_minor))}
                    {task.deadline_at ? ` · ${formatRelative(task.deadline_at)}` : ""}
                  </p>
                </div>
                <Badge tone="info">Claim</Badge>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {myTasks.length > 0 && (
        <SectionCard>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-950">My tasks</p>
          </div>
          <div className="mt-3 space-y-2">
            {myTasks.slice(0, 4).map((task) => (
              <Link
                key={task.id}
                href={`/worker/tasks/${task.id}`}
                className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{task.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{formatCurrency(Number(task.reward_minor))}</p>
                </div>
                <Badge
                  tone={
                    task.status === "submitted"
                      ? "warning"
                      : task.status === "paid"
                        ? "success"
                        : task.status === "approved"
                          ? "info"
                          : "neutral"
                  }
                >
                  {task.status}
                </Badge>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {myTasks.length === 0 && openTasks.length === 0 && (
        <SectionCard>
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="font-semibold text-slate-700">No tasks yet</p>
            <p className="mt-1 text-sm text-slate-500">Join a team to start seeing and claiming work.</p>
            <Button asChild className="mt-4">
              <Link href="/worker/teams">Join a team</Link>
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
