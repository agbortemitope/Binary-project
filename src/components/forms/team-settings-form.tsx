"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { PayoutFrequency, PayoutMode } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function TeamSettingsForm({
  teamId,
  payoutMode: initialPayoutMode,
  payoutFrequency: initialPayoutFrequency,
  scheduledPayoutAt: initialScheduledPayoutAt,
  thresholdMinor,
}: {
  teamId: string;
  payoutMode: PayoutMode;
  payoutFrequency: PayoutFrequency | null;
  scheduledPayoutAt: string | null;
  thresholdMinor: number;
}) {
  const router = useRouter();
  const [payoutMode, setPayoutMode] = useState<PayoutMode>(initialPayoutMode);
  const [scheduledPayoutAt, setScheduledPayoutAt] = useState(toDateTimeLocalValue(initialScheduledPayoutAt));
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
            payoutFrequency: payoutMode === "scheduled" ? (initialPayoutFrequency ?? null) : null,
            scheduledPayoutAt:
              payoutMode === "scheduled" && scheduledPayoutAt
                ? new Date(scheduledPayoutAt).toISOString()
                : null,
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
          <label className="text-sm font-semibold text-slate-700">Scheduled payout date & time</label>
          <Input
            type="datetime-local"
            value={scheduledPayoutAt}
            onChange={(event) => setScheduledPayoutAt(event.target.value)}
          />
          <p className="text-xs text-slate-500">Pick the exact date and time you want CrewPay to run the next payout.</p>
        </div>
      ) : null}

      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
