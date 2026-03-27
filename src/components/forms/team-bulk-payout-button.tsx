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
          data?: {
            startedCount: number;
            skippedCount: number;
            failedCount: number;
            results?: Array<{
              memberName: string;
              status: "processing" | "successful" | "failed" | "skipped";
              reason: string | null;
            }>;
          };
        };

        if (!response.ok || !payload.ok || !payload.data) {
          toast.error(payload.error ?? "Unable to start team payout.");
          setRunning(false);
          return;
        }

        const failures = (payload.data.results ?? []).filter(
          (result) => result.status === "failed" || result.status === "skipped",
        );
        const failureSummary = failures
          .slice(0, 2)
          .map((result) => `${result.memberName}: ${result.reason ?? "Unable to pay this member."}`)
          .join(" ");

        if (payload.data.startedCount === 0) {
          toast.error(
            failureSummary || `No payouts were sent. ${payload.data.failedCount || payload.data.skippedCount} member payouts failed.`,
          );
        } else if (failures.length > 0) {
          toast.success(
            `Payout started for ${payload.data.startedCount} member${payload.data.startedCount === 1 ? "" : "s"}. ${failures.length} could not be paid.${failureSummary ? ` ${failureSummary}` : ""}`,
          );
        } else {
          toast.success(
            `Payout started for ${payload.data.startedCount} member${payload.data.startedCount === 1 ? "" : "s"}.`,
          );
        }

        setRunning(false);
        router.refresh();
      }}
    >
      {running ? "Paying..." : "Payout"}
    </Button>
  );
}
