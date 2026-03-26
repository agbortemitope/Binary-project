"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function CreateTeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [payoutMode, setPayoutMode] = useState<"instant" | "scheduled">("instant");
  const [frequency, setFrequency] = useState("weekly");
  const [threshold, setThreshold] = useState("5000");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const response = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            payoutMode,
            payoutFrequency: payoutMode === "scheduled" ? frequency : null,
            thresholdMinor: Number(threshold) * 100,
          }),
        });

        const payload = (await response.json()) as { ok: boolean; error?: string; data?: { teamId: string } };
        if (!response.ok || !payload.ok || !payload.data) {
          setError(payload.error ?? "Unable to create team.");
          setSubmitting(false);
          return;
        }

        toast.success("Team created successfully.");
        router.push(`/lead/teams/${payload.data.teamId}`);
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Team name</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Marketing Crew" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Payout mode</label>
          <Select value={payoutMode} onChange={(event) => setPayoutMode(event.target.value as "instant" | "scheduled")}>
            <option value="instant">Instant</option>
            <option value="scheduled">Scheduled</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Minimum threshold (NGN)</label>
          <Input type="number" value={threshold} onChange={(event) => setThreshold(event.target.value)} min={0} required />
        </div>
      </div>

      {payoutMode === "scheduled" ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Payout frequency</label>
          <Select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>
      ) : null}

      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating team..." : "Create team"}
      </Button>
    </form>
  );
}
