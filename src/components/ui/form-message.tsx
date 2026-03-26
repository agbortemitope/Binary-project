import { cn } from "@/lib/utils";

export function FormMessage({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "info";
}) {
  return (
    <p
      className={cn(
        "text-sm",
        tone === "error" ? "text-rose-600" : "text-slate-500",
      )}
    >
      {children}
    </p>
  );
}
