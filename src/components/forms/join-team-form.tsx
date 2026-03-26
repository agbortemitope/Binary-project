"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";

export function JoinTeamForm() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const response = await fetch("/api/teams/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode }),
        });

        const payload = (await response.json()) as { ok: boolean; error?: string; data?: { teamId: string } };
        if (!response.ok || !payload.ok || !payload.data) {
          setError(payload.error ?? "Unable to join team.");
          setSubmitting(false);
          return;
        }

        toast.success("Team joined successfully.");
        router.push(`/worker/teams/${payload.data.teamId}`);
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Invite code</label>
        <Input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} placeholder="CREW-1234ABCD" required />
      </div>
      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Joining..." : "Join team"}
      </Button>
    </form>
  );
}
