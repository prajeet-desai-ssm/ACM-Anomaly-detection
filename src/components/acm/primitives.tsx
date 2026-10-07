import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  kicker,
  description,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  kicker?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        {kicker ? (
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {kicker}
          </p>
        ) : null}
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={bodyClassName}>{children}</CardContent>
    </Card>
  );
}

export function HeatCells({
  matrix,
  rowLabels,
  colLabels,
  diverging = true,
}: {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  diverging?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-96 border-collapse text-center font-mono text-xs">
        <thead>
          <tr>
            <th className="p-1" />
            {colLabels.map((l) => (
              <th key={l} className="p-1 font-medium text-muted-foreground">
                <span className="inline-block max-w-16 truncate">{l}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={rowLabels[i]}>
              <th className="whitespace-nowrap pr-2 text-left font-medium text-muted-foreground">
                {rowLabels[i]}
              </th>
              {row.map((v, j) => {
                const a = Math.min(1, Math.abs(v) / (diverging ? 1 : 8));
                const mix = Math.round(a * 72);
                const color = diverging
                  ? v >= 0
                    ? `color-mix(in oklab, var(--color-alarm) ${mix}%, var(--color-card))`
                    : `color-mix(in oklab, var(--color-chart-1) ${mix}%, var(--color-card))`
                  : `color-mix(in oklab, var(--color-alarm) ${mix}%, var(--color-card))`;
                const fg = a > 0.45 ? "var(--color-foreground)" : "var(--color-muted-foreground)";
                return (
                  <td key={`${i}-${j}`} className="p-0.5">
                    <div
                      className="rounded-sm px-1 py-2 tabular"
                      style={{ background: color, color: fg }}
                    >
                      {v.toFixed(1)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BoxRow({
  items,
}: {
  items: Array<{ label: string; min: number; q1: number; med: number; q3: number; max: number }>;
}) {
  const all = items.flatMap((b) => [b.min, b.max]);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const span = hi - lo || 1;
  const x = (v: number) => ((v - lo) / span) * 100;
  return (
    <div className="flex flex-col gap-4">
      {items.map((b) => (
        <div key={b.label} className="grid grid-cols-1 gap-2 sm:grid-cols-[9rem_1fr] sm:items-center">
          <div className="text-xs text-muted-foreground">{b.label}</div>
          <div className="relative h-8 rounded-md bg-secondary">
            <div
              className="absolute top-1/2 h-px -translate-y-1/2 bg-border"
              style={{ left: `${x(b.min)}%`, width: `${x(b.max) - x(b.min)}%` }}
            />
            <div
              className="absolute top-1 h-6 rounded-sm border border-primary/40 bg-primary/15"
              style={{ left: `${x(b.q1)}%`, width: `${Math.max(x(b.q3) - x(b.q1), 1)}%` }}
            />
            <div
              className="absolute top-1 h-6 w-px bg-primary"
              style={{ left: `${x(b.med)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ViolinGroup({
  groups,
}: {
  groups: Array<{ label: string; curve: Array<{ x: number; y: number }>; values: number[] }>;
}) {
  const xs = groups.flatMap((g) => g.curve.map((p) => p.x));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const width = 280;
  const height = 160;
  const gx = (x: number) => ((x - minX) / (maxX - minX || 1)) * (width - 24) + 12;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {groups.map((g) => {
        const maxY = Math.max(...g.curve.map((p) => p.y), 1e-9);
        const mid = height / 2;
        const top = g.curve.map((p) => `${gx(p.x)},${mid - (p.y / maxY) * (mid - 8)}`).join(" ");
        const bot = [...g.curve]
          .reverse()
          .map((p) => `${gx(p.x)},${mid + (p.y / maxY) * (mid - 8)}`)
          .join(" ");
        return (
          <div key={g.label}>
            <p className="mb-2 text-xs text-muted-foreground">{g.label}</p>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
              <polygon points={`${top} ${bot}`} className="fill-primary/20 stroke-primary/50" />
              {g.values.slice(0, 80).map((v, i) => (
                <circle
                  key={i}
                  cx={gx(v)}
                  cy={mid + ((i % 7) - 3) * 4}
                  r={1.4}
                  className="fill-foreground/40"
                />
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export const tooltipBox = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};
