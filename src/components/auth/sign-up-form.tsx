"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NIGERIAN_BANKS } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";

export function SignUpForm() {
  const [form, setForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    password: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    defaultRoleView: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    bankCode: NIGERIAN_BANKS[0]?.code ?? "",
    accountNumber: "",
    accountName: "",
    defaultRoleView: "worker",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedBankName = useMemo(
    () => NIGERIAN_BANKS.find((bank) => bank.code === form.bankCode)?.name ?? "",
    [form.bankCode],
  );

  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
          const response = await fetch("/api/auth/sign-up", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...form,
              bankName: selectedBankName,
            }),
          });

          const payload = (await response.json()) as {
            ok: boolean;
            error?: string;
            data?: { payoutReady: boolean; verificationMessage: string | null };
          };

          if (!response.ok || !payload.ok) {
            throw new Error(payload.error ?? "Unable to create account.");
          }

          const supabase = createSupabaseBrowserClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });

          if (signInError) {
            throw signInError;
          }

          if (payload.data?.verificationMessage) {
            toast.message(payload.data.verificationMessage);
          }

          toast.success("Account created successfully.");
          window.location.replace("/dashboard");
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "Unable to create account.";
          setError(message);
          toast.error(message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="full-name">
            Full name
          </label>
          <Input
            id="full-name"
            placeholder="John Doe"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
            Phone number
          </label>
          <Input
            id="phone"
            placeholder="+234 800 000 0000"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="password">
            Password
          </label>
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Payout onboarding</p>
          <p className="mt-1 text-sm text-slate-600">
            CrewPay collects bank details at signup so task payouts can be released without extra setup later.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="bank-code">
              Bank
            </label>
            <Select
              id="bank-code"
              value={form.bankCode}
              onChange={(event) => setForm((current) => ({ ...current, bankCode: event.target.value }))}
            >
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="account-number">
              Account number
            </label>
            <Input
              id="account-number"
              placeholder="0123456789"
              value={form.accountNumber}
              onChange={(event) => setForm((current) => ({ ...current, accountNumber: event.target.value }))}
              required
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="account-name">
              Account name
            </label>
            <Input
              id="account-name"
              placeholder="Full name on bank account"
              value={form.accountName}
              onChange={(event) => setForm((current) => ({ ...current, accountName: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="default-role">
              Account type
            </label>
            <Select
              id="default-role"
              value={form.defaultRoleView}
              onChange={(event) => setForm((current) => ({ ...current, defaultRoleView: event.target.value }))}
            >
              <option value="worker">Worker</option>
              <option value="lead">Team owner</option>
            </Select>
            <p className="text-xs text-slate-500">Choose carefully. Worker and lead actions now require separate accounts and cannot be switched later.</p>
          </div>
        </div>
      </div>

      {error ? <FormMessage>{error}</FormMessage> : null}

      <Button className="w-full" type="submit" size="lg" disabled={submitting}>
        {submitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/sign-in">
          Sign in
        </Link>
      </p>
    </form>
  );
}
