"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Team } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function FundWalletForm({ teams }: { teams: Team[] }) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [amount, setAmount] = useState("5000");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const response = await fetch("/api/collections/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            amountMinor: Math.round(Number(amount) * 100),
          }),
        });

        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          data?: {
            checkoutPayload: Record<string, string | number>;
            checkoutFormUrl: string;
          };
        };

        if (!response.ok || !payload.ok || !payload.data) {
          setError(payload.error ?? "Unable to initiate funding.");
          setSubmitting(false);
          return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = payload.data.checkoutFormUrl;
        Object.entries(payload.data.checkoutPayload).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }}
    >
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
        <label className="text-sm font-semibold text-slate-700">Amount (NGN)</label>
        <Input type="number" min={100} value={amount} onChange={(event) => setAmount(event.target.value)} />
      </div>

      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Redirecting..." : "Fund wallet"}
      </Button>
    </form>
  );
}
