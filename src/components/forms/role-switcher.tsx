"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function RoleSwitcher({ currentRole }: { currentRole: "lead" | "worker" }) {
  const router = useRouter();

  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {(["worker", "lead"] as const).map((role) => (
        <Button
          key={role}
          size="sm"
          variant={role === currentRole ? "primary" : "ghost"}
          className="capitalize"
          onClick={async () => {
            const response = await fetch("/api/profile/default-role", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role }),
            });

            if (!response.ok) {
              toast.error("Unable to switch default workspace.");
              return;
            }

            toast.success(`Default workspace updated to ${role}.`);
            router.refresh();
          }}
        >
          {role}
        </Button>
      ))}
    </div>
  );
}
