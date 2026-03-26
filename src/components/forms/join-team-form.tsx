"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { extractInviteCodeFromInput } from "@/lib/team-invites";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";

export function JoinTeamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCodeOrLink, setInviteCodeOrLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const queryInvite = searchParams.get("invite") ?? searchParams.get("inviteCode") ?? "";

    if (queryInvite) {
      setInviteCodeOrLink((current) => current || queryInvite);
    }
  }, [searchParams]);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const normalizedInviteCode = extractInviteCodeFromInput(inviteCodeOrLink);

        if (!normalizedInviteCode) {
          setError("Paste a valid invite code or workspace link.");
          setSubmitting(false);
          return;
        }

        const response = await fetch("/api/teams/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: normalizedInviteCode }),
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
        <label className="text-sm font-semibold text-slate-700">Invite code or workspace link</label>
        <Input
          value={inviteCodeOrLink}
          onChange={(event) => setInviteCodeOrLink(event.target.value)}
          placeholder="CREW-1234ABCD or https://crewpay.../worker/teams?invite=CREW-1234ABCD"
          required
        />
        <p className="text-xs text-slate-500">Paste the raw invite code or the shareable workspace link from the lead.</p>
      </div>
      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Joining..." : "Join team"}
      </Button>
    </form>
  );
}
