import { cn } from "@/lib/utils";

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-b border-slate-200/70 px-0 py-4 shadow-none last:border-b-0",
        "md:rounded-[28px] md:border md:border-slate-200/80 md:bg-white md:p-5 md:shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}
