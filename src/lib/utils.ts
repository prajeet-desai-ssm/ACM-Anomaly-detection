import { twMerge } from "tailwind-merge";

export function cn(
  ...inputs: Array<string | undefined | null | false | Record<string, boolean>>
): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      classes.push(input);
    } else {
      for (const [key, on] of Object.entries(input)) {
        if (on) classes.push(key);
      }
    }
  }
  return twMerge(classes.join(" "));
}

export function formatNumber(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}
