"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
          const supabase = createSupabaseBrowserClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            throw signInError;
          }

          toast.success("Welcome back.");
          window.location.replace("/dashboard");
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "Unable to sign in.";
          setError(message);
          toast.error(message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="sign-in-email">
          Email address
        </label>
        <Input
          id="sign-in-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="sign-in-password">
          Password
        </label>
        <PasswordInput
          id="sign-in-password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error ? <FormMessage>{error}</FormMessage> : null}

      <Button className="w-full" type="submit" size="lg" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-sm text-slate-600">
        New to CrewPay?{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/sign-up">
          Create an account
        </Link>
      </p>
    </form>
  );
}
