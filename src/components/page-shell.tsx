import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className={cn("glass-card min-h-[calc(100vh-3rem)] rounded-[32px] p-4 sm:p-6", className)}>
        {children}
      </div>
    </main>
  );
}
