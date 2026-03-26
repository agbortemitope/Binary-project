import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_14px_30px_rgba(31,100,255,0.22)]",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-[0_14px_30px_rgba(225,29,72,0.18)]",
};

const sizes = {
  sm: "h-9 px-3 text-[13px] md:h-10 md:px-4 md:text-sm",
  md: "h-10 px-3.5 text-[13px] md:h-11 md:px-4 md:text-sm",
  lg: "h-11 px-4 text-sm md:h-12 md:px-5",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant,
  size,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  return (
    <Button asChild className={className} variant={variant} size={size}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
