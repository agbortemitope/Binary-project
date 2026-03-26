"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ClaimTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        const response = await fetch(`/api/tasks/${taskId}/claim`, { method: "POST" });
        const payload = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          toast.error(payload.error ?? "Unable to claim task.");
          return;
        }

        toast.success("Task claimed.");
        router.refresh();
      }}
    >
      Claim task
    </Button>
  );
}
