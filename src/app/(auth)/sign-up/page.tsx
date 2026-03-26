import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your CrewPay account"
      description="Set up one account for work, teams, approvals, and payouts."
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Create account</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Get started</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign up once, then switch between owner and worker views based on your team memberships.
          </p>
        </div>
        <SignUpForm />
      </div>
    </AuthShell>
  );
}
