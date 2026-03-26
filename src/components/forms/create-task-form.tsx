"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TeamOption = {
  id: string;
  name: string;
};

type MemberOption = {
  teamId: string;
  userId: string;
  label: string;
};

export function CreateTaskForm({
  teams,
  members,
  initialTeamId,
}: {
  teams: TeamOption[];
  members: MemberOption[];
  initialTeamId?: string;
}) {
  const router = useRouter();
  const defaultTeamId = initialTeamId && teams.some((team) => team.id === initialTeamId) ? initialTeamId : teams[0]?.id ?? "";
  const [teamId, setTeamId] = useState(defaultTeamId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentMode, setAssignmentMode] = useState<"assigned" | "open_claim">("assigned");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [reward, setReward] = useState("5000");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const teamMembers = useMemo(
    () => members.filter((member) => member.teamId === teamId),
    [members, teamId],
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            title,
            description,
            assignmentMode,
            rewardMinor: Math.round(Number(reward) * 100),
            deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
            assigneeUserId: assignmentMode === "assigned" ? assigneeUserId : null,
          }),
        });

        const payload = (await response.json()) as { ok: boolean; error?: string; data?: { taskId: string } };
        if (!response.ok || !payload.ok || !payload.data) {
          setError(payload.error ?? "Unable to create task.");
          setSubmitting(false);
          return;
        }

        toast.success("Task created.");
        router.push(`/lead/tasks/${payload.data.taskId}`);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Team</label>
          <Select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Assignment mode</label>
          <Select value={assignmentMode} onChange={(event) => setAssignmentMode(event.target.value as "assigned" | "open_claim")}>
            <option value="assigned">Assigned</option>
            <option value="open_claim">Open claim</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Task title</label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Take out the trash for apartment 3B" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Description</label>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the deliverables, proof, and timing expectations." required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Reward (NGN)</label>
          <Input type="number" value={reward} onChange={(event) => setReward(event.target.value)} min={0} required />
          <p className="text-xs text-slate-500">Set this to 0 if you want to test task flow before funding the team wallet.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Deadline</label>
          <Input type="datetime-local" value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} />
        </div>
      </div>

      {assignmentMode === "assigned" ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Assign member</label>
          <Select value={assigneeUserId} onChange={(event) => setAssigneeUserId(event.target.value)} required>
            <option value="">Select a member</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.label}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create task"}
      </Button>
    </form>
  );
}
