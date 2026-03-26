"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function TeamBulkPayoutButton({
  teamId,
}: {
  teamId: string;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  return (
    <Button
      size="sm"
      disabled={running}
      onClick={async () => {
        setRunning(true);

        const response = await fetch(`/api/teams/${teamId}/bulk-payout`, {
          method: "POST",
        });

        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          data?: { startedCount: number; skippedCount: number; failedCount: number };
        };

        if (!response.ok || !payload.ok || !payload.data) {
          toast.error(payload.error ?? "Unable to start team payout.");
          setRunning(false);
          return;
        }

        toast.success(
          `Payout run complete. Started ${payload.data.startedCount}, skipped ${payload.data.skippedCount}, failed ${payload.data.failedCount}.`,
        );
        setRunning(false);
        router.refresh();
      }}
    >
      {running ? "Paying..." : "Pay everybody"}
    </Button>
  );
}
