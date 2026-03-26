import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in and continue where you stopped"
      description="Access your tasks, teams, approvals, and payouts from one CrewPay account."
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use the account you created during CrewPay onboarding.
          </p>
        </div>
        <SignInForm />
      </div>
    </AuthShell>
  );
}
