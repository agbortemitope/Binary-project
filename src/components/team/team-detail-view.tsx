import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelative, formatShortDate } from "@/lib/utils";
import type { ChatRoom, RoleView, Task, Team, TeamMember, TeamWallet } from "@/lib/types";

function getTaskTone(status: Task["status"]) {
  if (status === "paid") return "success";
  if (status === "submitted") return "warning";
  if (status === "approved") return "info";
  if (status === "cancelled") return "danger";
  return "neutral";
}

export function TeamDetailView({
  roleView,
  currentUserId,
  team,
  membershipRole,
  wallet,
  members,
  tasks,
  teamRoom,
}: {
  roleView: RoleView;
  currentUserId: string;
  team: Team;
  membershipRole: TeamMember["role"];
  wallet: TeamWallet | null;
  members: TeamMember[];
  tasks: Task[];
  teamRoom: ChatRoom | null;
}) {
  const taskBasePath = roleView === "lead" ? "/lead/tasks" : "/worker/tasks";
  const teamBasePath = roleView === "lead" ? "/lead/teams" : "/worker/teams";
  const openTasks = tasks.filter((task) => task.status === "open");
  const submittedTasks = tasks.filter((task) => task.status === "submitted");
  const myTasks = tasks.filter(
    (task) => task.assignee_user_id === currentUserId || task.claimed_by_user_id === currentUserId || task.created_by_user_id === currentUserId,
  );

  return (
    <div className="space-y-5">
      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Team workspace</p>
              <Badge tone={team.payout_mode === "instant" ? "info" : "success"}>{team.payout_mode}</Badge>
              <Badge tone={membershipRole === "member" ? "neutral" : "warning"}>{membershipRole}</Badge>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{team.name}</h2>
            <p className="mt-2 text-sm text-slate-600">Invite code: {team.invite_code}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {teamRoom ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/chat/${teamRoom.id}`}>Open team chat</Link>
              </Button>
            ) : null}
            {roleView === "lead" ? (
              <Button asChild size="sm">
                <Link href={`/lead/tasks/new?teamId=${team.id}`}>Create task</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/worker/tasks">Open task board</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Members</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{members.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {roleView === "lead" ? "Needs review" : "My tasks"}
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-950">
              {roleView === "lead" ? submittedTasks.length : myTasks.length}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Open tasks</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{openTasks.length}</div>
          </div>
        </div>

        {roleView === "lead" && wallet ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">Available</div>
              <div className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(Number(wallet.available_balance_minor))}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">Reserved</div>
              <div className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(Number(wallet.reserved_balance_minor))}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Pending payout</div>
              <div className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(Number(wallet.pending_payout_balance_minor))}</div>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-950">Members</p>
              <p className="text-sm text-slate-600">Everyone currently active in this team.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={teamBasePath}>Back to teams</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {members.map((member) => {
              const profile = member.profile as TeamMember["profile"];

              return (
                <div key={member.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 p-4">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">
                      {profile?.full_name || profile?.email || member.user_id}
                      {member.user_id === currentUserId ? " (you)" : ""}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{profile?.email || "CrewPay member"}</div>
                  </div>
                  <Badge tone={member.role === "member" ? "neutral" : "warning"}>{member.role}</Badge>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-950">Tasks</p>
              <p className="text-sm text-slate-600">
                {roleView === "lead"
                  ? "Manage tasks, approvals, and team delivery from here."
                  : "Open a task to claim it, submit work, or follow the chat."}
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={taskBasePath}>View all</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`${taskBasePath}/${task.id}`}
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatCurrency(Number(task.reward_minor))} · {formatShortDate(task.deadline_at)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Updated {formatRelative(task.updated_at)}
                    </div>
                  </div>
                  <Badge tone={getTaskTone(task.status)}>{task.status}</Badge>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No tasks have been created in this team yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
