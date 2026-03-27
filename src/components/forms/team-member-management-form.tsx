"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { TeamMemberRole } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TeamMemberManagementForm({
  teamId,
  memberUserId,
  memberName,
  currentRole,
  assignedPayoutMinor,
  canManageRole,
  canRemove,
  canTriggerPayout,
  payoutReady,
}: {
  teamId: string;
  memberUserId: string;
  memberName: string;
  currentRole: TeamMemberRole;
  assignedPayoutMinor: number;
  canManageRole: boolean;
  canRemove: boolean;
  canTriggerPayout: boolean;
  payoutReady: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<TeamMemberRole>(currentRole);
  const [assignedPayout, setAssignedPayout] = useState(String(Math.round(assignedPayoutMinor / 100)));
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveChanges() {
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/teams/${teamId}/members/${memberUserId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: canManageRole ? role : undefined,
        assignedPayoutMinor: Math.max(0, Math.round(Number(assignedPayout || 0) * 100)),
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to update this team member.");
      setSaving(false);
      return;
    }

    toast.success("Member settings updated.");
    setSaving(false);
    router.refresh();
  }

  async function payAssignedAmount() {
    setPaying(true);
    setError(null);

    const response = await fetch(`/api/teams/${teamId}/members/${memberUserId}/payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amountMinor: Math.max(0, Math.round(Number(assignedPayout || 0) * 100)),
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
      data?: {
        reason?: string | null;
        started?: boolean;
        status?: "processing" | "successful" | "failed" | "skipped";
      };
    };
    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to pay this member.");
      setPaying(false);
      return;
    }

    if (payload.data?.status === "failed" || payload.data?.status === "skipped" || payload.data?.started === false) {
      const message = payload.data?.reason ?? `Unable to pay ${memberName} right now.`;
      setError(message);
      toast.error(message);
      setPaying(false);
      router.refresh();
      return;
    }

    toast.success(payload.data?.reason ?? `${memberName} payout started.`);
    setPaying(false);
    router.refresh();
  }

  async function removeMember() {
    if (!window.confirm(`Remove ${memberName} from this team?`)) {
      return;
    }

    setRemoving(true);
    setError(null);

    const response = await fetch(`/api/teams/${teamId}/members/${memberUserId}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to remove this member.");
      setRemoving(false);
      return;
    }

    toast.success(`${memberName} was removed from the team.`);
    router.push(`/lead/teams/${teamId}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Role</label>
          {canManageRole ? (
            <Select value={role} onChange={(event) => setRole(event.target.value as TeamMemberRole)}>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </Select>
          ) : (
            <Input value={currentRole} readOnly />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Assigned payout (NGN)</label>
          <Input
            type="number"
            min={0}
            value={assignedPayout}
            onChange={(event) => setAssignedPayout(event.target.value)}
          />
        </div>
      </div>

      {!payoutReady ? (
        <FormMessage tone="info">
          This member cannot receive payouts until their payout method is verified.
        </FormMessage>
      ) : null}
      {error ? <FormMessage>{error}</FormMessage> : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={saving} onClick={saveChanges}>
          {saving ? "Saving..." : "Save member settings"}
        </Button>
        <Button
          variant="secondary"
          disabled={paying || !canTriggerPayout || Math.round(Number(assignedPayout || 0) * 100) <= 0 || !payoutReady}
          onClick={payAssignedAmount}
        >
          {paying ? "Paying..." : "Pay assigned amount"}
        </Button>
        {canRemove ? (
          <Button variant="danger" disabled={removing} onClick={removeMember}>
            {removing ? "Removing..." : "Remove member"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
