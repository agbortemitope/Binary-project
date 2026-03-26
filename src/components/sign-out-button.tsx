"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  variant = "secondary",
  size = "sm",
}: {
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.replace("/sign-in");
      }}
    >
      Sign out
    </Button>
  );
}
