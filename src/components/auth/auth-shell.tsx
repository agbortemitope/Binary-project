import { AppLogo } from "@/components/app-logo";
import { Card } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-start px-4 py-4 sm:px-6 sm:py-5 lg:justify-center lg:px-8 lg:py-8">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
        <Card className="order-1 p-5 sm:p-7 lg:order-2 lg:p-8">{children}</Card>

        <section className="order-2 rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,#153e98_0%,#1f64ff_55%,#60d6ff_100%)] p-5 text-white shadow-[0_36px_70px_rgba(22,66,150,0.24)] sm:p-7 lg:order-1 lg:p-8">
          <AppLogo inverted />
          <div className="mt-6 space-y-3 lg:mt-10 lg:space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">CrewPay account</p>
            <h1 className="max-w-lg text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{title}</h1>
            <p className="max-w-xl text-sm leading-6 text-white/80 lg:text-base lg:leading-7">{description}</p>
          </div>
          <div className="mt-6 hidden gap-4 sm:grid-cols-2 lg:grid">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
              <div className="text-2xl font-bold">Wallet</div>
              <div className="mt-2 text-sm text-white/80">Fund teams once and reserve money task by task.</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
              <div className="text-2xl font-bold">Payouts</div>
              <div className="mt-2 text-sm text-white/80">Release instantly or batch them on a predictable schedule.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
