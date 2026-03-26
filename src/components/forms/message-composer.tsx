"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MessageComposer({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="flex gap-3">
      <Input
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a message..."
      />
      <Button
        disabled={sending || !content.trim()}
        onClick={async () => {
          setSending(true);
          const response = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              content,
              attachments: [],
            }),
          });
          const payload = (await response.json()) as { ok: boolean; error?: string };
          if (!response.ok || !payload.ok) {
            toast.error(payload.error ?? "Unable to send message.");
            setSending(false);
            return;
          }
          setContent("");
          setSending(false);
          router.refresh();
        }}
      >
        Send
      </Button>
    </div>
  );
}
