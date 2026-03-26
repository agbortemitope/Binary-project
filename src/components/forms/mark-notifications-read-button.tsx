"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function MarkNotificationsReadButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        const response = await fetch("/api/notifications/read", { method: "POST" });
        if (!response.ok) {
          toast.error("Unable to mark notifications as read.");
          return;
        }
        toast.success("Notifications marked as read.");
        router.refresh();
      }}
    >
      Mark all as read
    </Button>
  );
}
