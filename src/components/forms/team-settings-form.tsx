"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { PayoutFrequency, PayoutMode } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TeamSettingsForm({
  teamId,
  payoutMode: initialPayoutMode,
  payoutFrequency: initialPayoutFrequency,
  thresholdMinor,
}: {
  teamId: string;
  payoutMode: PayoutMode;
  payoutFrequency: PayoutFrequency | null;
  thresholdMinor: number;
}) {
  const router = useRouter();
  const [payoutMode, setPayoutMode] = useState<PayoutMode>(initialPayoutMode);
  const [frequency, setFrequency] = useState<PayoutFrequency>(initialPayoutFrequency ?? "weekly");
  const [threshold, setThreshold] = useState(String(Math.round(thresholdMinor / 100)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        const response = await fetch(`/api/teams/${teamId}/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payoutMode,
            payoutFrequency: payoutMode === "scheduled" ? frequency : null,
            thresholdMinor: Math.max(0, Math.round(Number(threshold || 0) * 100)),
          }),
        });

        const payload = (await response.json()) as { ok: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          setError(payload.error ?? "Unable to update team settings.");
          setSaving(false);
          return;
        }

        toast.success("Team settings updated.");
        setSaving(false);
        router.refresh();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Payout mode</label>
          <Select value={payoutMode} onChange={(event) => setPayoutMode(event.target.value as PayoutMode)}>
            <option value="instant">Instant</option>
            <option value="scheduled">Scheduled</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Minimum threshold (NGN)</label>
          <Input type="number" min={0} value={threshold} onChange={(event) => setThreshold(event.target.value)} />
        </div>
      </div>

      {payoutMode === "scheduled" ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Scheduled payout frequency</label>
          <Select value={frequency} onChange={(event) => setFrequency(event.target.value as PayoutFrequency)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>
      ) : null}

      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
