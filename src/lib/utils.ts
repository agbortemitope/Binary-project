import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountMinor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "N/A";
  return format(new Date(value), "dd MMM yyyy, h:mm a");
}

export function formatShortDate(value: string | Date | null | undefined) {
  if (!value) return "N/A";
  return format(new Date(value), "dd MMM yyyy");
}

export function formatRelative(value: string | Date | null | undefined) {
  if (!value) return "N/A";
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
