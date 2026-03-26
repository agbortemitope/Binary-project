import { cn } from "@/lib/utils";

export function AppLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-2xl border text-sm font-extrabold tracking-[0.2em]",
          inverted
            ? "border-white/20 bg-white/10 text-white"
            : "border-blue-100 bg-blue-50 text-blue-700",
        )}
      >
        CP
      </div>
      <div>
        <div className={cn("text-lg font-bold", inverted ? "text-white" : "text-slate-950")}>CrewPay</div>
        <div className={cn("text-xs font-medium uppercase tracking-[0.2em]", inverted ? "text-white/65" : "text-slate-500")}>
          Team Ops + Payouts
        </div>
      </div>
    </div>
  );
}
