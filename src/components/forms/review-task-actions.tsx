"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewTaskActions({
  taskId,
  submissionId,
}: {
  taskId: string;
  submissionId: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function submit(decision: "approve" | "reject") {
    setLoading(decision);
    const response = await fetch(`/api/tasks/${taskId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId,
        decision,
        rejectionReason: decision === "reject" ? reason : "",
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string; data?: { payout?: { reason?: string | null } } };
    if (!response.ok || !payload.ok) {
      toast.error(payload.error ?? "Unable to review submission.");
      setLoading(null);
      return;
    }

    if (decision === "approve") {
      toast.success(payload.data?.payout?.reason ?? "Submission approved.");
    } else {
      toast.success("Submission rejected and task reopened.");
    }

    setReason("");
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Optional rejection reason"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="danger" onClick={() => submit("reject")} disabled={loading !== null}>
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </Button>
        <Button onClick={() => submit("approve")} disabled={loading !== null}>
          {loading === "approve" ? "Approving..." : "Approve"}
        </Button>
      </div>
    </div>
  );
}
