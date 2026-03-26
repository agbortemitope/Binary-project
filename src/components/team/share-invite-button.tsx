"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareInviteButton({
  inviteLink,
}: {
  inviteLink: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    let copiedToClipboard = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
        copiedToClipboard = true;
        setCopied(true);
        toast.success("Invite link copied.");
        window.setTimeout(() => setCopied(false), 1800);
      }

      if (navigator.share) {
        await navigator.share({
          title: "Join my CrewPay workspace",
          text: "Join my CrewPay workspace",
          url: inviteLink,
        });
        return;
      }

      if (!copiedToClipboard) {
        throw new Error("Clipboard unavailable");
      }
    } catch {
      if (!copiedToClipboard) {
        toast.error("Unable to copy invite link.");
      }
    }
  }

  return (
    <Button className="gap-2" variant="secondary" size="sm" onClick={handleShare}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied" : "Share invite"}
    </Button>
  );
}
