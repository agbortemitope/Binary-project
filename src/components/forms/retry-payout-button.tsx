"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function RetryPayoutButton({ earningId }: { earningId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch("/api/payouts/retry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ earningId }),
        });
        const payload = (await response.json()) as { ok: boolean; error?: string; data?: { reason?: string | null } };
        if (!response.ok || !payload.ok) {
          toast.error(payload.error ?? "Unable to retry payout.");
          setLoading(false);
          return;
        }
        toast.success(payload.data?.reason ?? "Payout retry triggered.");
        setLoading(false);
        router.refresh();
      }}
    >
      {loading ? "Retrying..." : "Retry payout"}
    </Button>
  );
}
