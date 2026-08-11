import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

export function formatPercent(n: number | null | undefined) {
  if (n == null) return "—";
  return `${Math.round(n)}`;
}
