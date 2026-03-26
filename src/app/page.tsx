import Link from "next/link";

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between gap-8 rounded-[32px] border border-white/60 bg-[linear-gradient(145deg,#103b9d_0%,#1f64ff_46%,#50d1ff_100%)] p-8 text-white shadow-[0_40px_90px_rgba(13,49,128,0.28)]">
          <div className="flex items-center justify-between">
            <AppLogo inverted />
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
              CrewPay V2
            </span>
          </div>
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
              Team tasks. Escrow-style controls. Verified releases.
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Build, assign, claim, verify, and pay from one operational wallet.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              CrewPay gives team owners a funded team wallet, task-by-task reserves, approval controls,
              and bank payouts for Nigerian crews.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/16 bg-white/12 p-4">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-white/75">Task modes: assigned and open-claim</div>
            </div>
            <div className="rounded-3xl border border-white/16 bg-white/12 p-4">
              <div className="text-2xl font-bold">NGN</div>
              <div className="text-sm text-white/75">Nigeria-first payout scope for launch</div>
            </div>
            <div className="rounded-3xl border border-white/16 bg-white/12 p-4">
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-white/75">Account can be both worker and team owner</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <Card className="space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Choose your flow</p>
              <h2 className="text-3xl font-bold text-slate-950">Start building with real workflows</h2>
              <p className="text-sm leading-6 text-slate-600">
                Sign in to your existing account or create a new one with bank payout details so the
                payment layer is ready from day one.
              </p>
            </div>
            <div className="grid gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">Create account</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Launch-ready core</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Team creation, invite codes, wallet funding records, approvals, payouts, realtime chat,
                  notifications, and analytics.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Production path
              </span>
            </div>
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">Owner + manager approvals with audit history</div>
              <div className="rounded-2xl bg-slate-50 p-4">Instant or scheduled payouts in Africa/Lagos time</div>
              <div className="rounded-2xl bg-slate-50 p-4">Internal team wallet ledger, separate from provider wallet</div>
              <div className="rounded-2xl bg-slate-50 p-4">Interswitch funding, verification, payout, and webhooks</div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
