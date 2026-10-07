import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, tooltipBox, ViolinGroup } from "@/components/acm/primitives";
import { DETECTOR_IDS, FUSED_THRESHOLD } from "@/lib/acm/constants";
import { useAcm } from "@/lib/acm/store";
import { kdeCurve, sampledSeries } from "@/lib/acm/viz";
import { formatNumber } from "@/lib/utils";

export function FusionView() {
  const result = useAcm((s) => s.result);
  const playIndex = useAcm((s) => s.playIndex);

  const fusedChart = useMemo(() => {
    if (!result) return [];
    const idx = sampledSeries(result.features.n, 360, [result.faultOnsetFeat, playIndex]);
    return idx.map((i) => ({
      i,
      fused: result.fused[i],
      alarm: result.anyAlarm[i] ? result.fused[i] : null,
    }));
  }, [result, playIndex]);

  const bars = useMemo(
    () =>
      result
        ? result.alarmMetrics.map((m) => ({
            rule: m.rule,
            Precision: Number(m.precision.toFixed(2)),
            Recall: Number(m.recall.toFixed(2)),
          }))
        : [],
    [result],
  );

  const violins = useMemo(() => {
    if (!result) return [];
    const healthy = result.fused.slice(0, 900);
    const early = result.fused.slice(result.faultOnsetFeat, result.faultOnsetFeat + 125);
    const late = result.fused.slice(result.faultOnsetFeat + 125);
    const take = (arr: number[], n = 120) => arr.filter((_, i) => i % Math.max(1, Math.floor(arr.length / n)) === 0);
    return [
      { label: "Healthy (0–900)", curve: kdeCurve(healthy), values: take(healthy) },
      { label: "Early fault", curve: kdeCurve(early), values: take(early) },
      { label: "Late fault", curve: kdeCurve(late), values: take(late) },
    ];
  }, [result]);

  if (!result) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Score fusion
        </p>
        <h1 className="text-2xl font-medium tracking-tight">Alarms & weights</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Pairwise Pearson on the holdout window discounts any detector with |r| exceeding 0.85 against a
          heavier partner. Threshold is fixed at {FUSED_THRESHOLD}.
        </p>
      </header>

      <Panel kicker="Weights" title="Final fusion weights" description="Renormalised after correlation discounting.">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DETECTOR_IDS.map((id) => (
            <li key={id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <span>{id}</span>
              <span className="font-mono tabular">
                {formatNumber(result.weightBase[id], 2)} → {formatNumber(result.weights[id], 2)}
              </span>
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1 font-mono text-xs text-muted-foreground">
          {result.corrPairs
            .filter((p) => p.discounted)
            .map((p) => (
              <li key={`${p.a}-${p.b}`}>
                {p.a} × {p.b}  r = {p.r.toFixed(2)} · lower weight halved
              </li>
            ))}
          {result.corrPairs.every((p) => !p.discounted) ? (
            <li>No pair exceeded |r| = 0.85 on holdout.</li>
          ) : null}
        </ul>
      </Panel>

      <Panel
        kicker="Plot 06"
        title="Fused anomaly score with alarm events"
        description="Grey = baseline, orange wash after fault onset. Markers fire when any of R1–R4 is true."
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fusedChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="i" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <RTooltip {...tooltipBox} />
              <ReferenceLine y={FUSED_THRESHOLD} stroke="var(--color-alarm)" strokeDasharray="4 4" />
              <ReferenceLine x={900} stroke="var(--color-border)" />
              <ReferenceLine x={result.faultOnsetFeat} stroke="var(--color-alarm)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="fused" stroke="var(--color-chart-1)" dot={false} strokeWidth={1.6} />
              <Line
                type="linear"
                dataKey="alarm"
                stroke="transparent"
                dot={{ r: 4, fill: "var(--color-alarm)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        kicker="Plot 10"
        title="Alarm rule performance — precision vs recall"
        description="R1 sustained · R2 repeated · R3 per-detector · R4 rapid rise. Evaluated on feature rows vs fault_injected."
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="rule" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
              <YAxis domain={[0, 1]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <RTooltip {...tooltipBox} />
              <Bar dataKey="Precision" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="Precision" position="top" fill="var(--color-muted-foreground)" fontSize={11} />
              </Bar>
              <Bar dataKey="Recall" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="Recall" position="top" fill="var(--color-muted-foreground)" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-96 text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                {["Rule", "TP", "FP", "FN", "TN", "P", "R", "F1"].map((h) => (
                  <th key={h} className="pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono tabular">
              {result.alarmMetrics.map((m) => (
                <tr key={m.rule} className="border-t border-border">
                  <td className="py-2 font-sans">{m.rule}</td>
                  <td>{m.tp}</td>
                  <td>{m.fp}</td>
                  <td>{m.fn}</td>
                  <td>{m.tn}</td>
                  <td>{m.precision.toFixed(2)}</td>
                  <td>{m.recall.toFixed(2)}</td>
                  <td>{m.f1.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        kicker="Plot 11"
        title="Fused score distribution by regime"
        description="Healthy baseline, the first 125 fault rows, then late degradation."
      >
        <ViolinGroup groups={violins} />
      </Panel>
    </div>
  );
}
