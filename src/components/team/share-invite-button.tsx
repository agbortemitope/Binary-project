"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareInviteButton({
  inviteLink,
}: {
  inviteLink: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my CrewPay workspace",
          url: inviteLink,
        });
        return;
      }

      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore cancelled share sheets and clipboard failures.
    }
  }

  return (
    <Button className="gap-2" variant="secondary" size="sm" onClick={handleShare}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied" : "Share invite"}
    </Button>
  );
}
