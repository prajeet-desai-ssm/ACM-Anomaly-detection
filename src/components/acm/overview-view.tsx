import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, tooltipBox } from "@/components/acm/primitives";
import {
  ASSET,
  DETECTOR_COLORS,
  DETECTOR_IDS,
  DETECTOR_LABELS,
  FAULT_START,
  FUSED_THRESHOLD,
  SENSOR_KEYS,
  SENSOR_LABELS,
  SENSOR_UNITS,
} from "@/lib/acm/constants";
import { useAcm } from "@/lib/acm/store";
import { sampledSeries } from "@/lib/acm/viz";
import { formatNumber } from "@/lib/utils";

export function OverviewView() {
  const result = useAcm((s) => s.result);
  const playIndex = useAcm((s) => s.playIndex);

  const chartData = useMemo(() => {
    if (!result) return [];
    const idx = sampledSeries(result.features.n, 360, [
      result.faultOnsetFeat,
      playIndex,
    ]);
    return idx.map((i) => ({
      i,
      fused: result.fused[i],
      alarm: result.anyAlarm[i] ? result.fused[i] : null,
    }));
  }, [result, playIndex]);

  if (!result) return null;

  const fusedNow = result.fused[playIndex] ?? 0;
  const rawIdx = playIndex + result.features.offset;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {ASSET.site}
          </p>
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {ASSET.tag} · {ASSET.component}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Synthetic 14-day historian. Healthy envelope for 1500 samples, then an
            inner-race bearing ramp on temperature and axial vibration.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {result.features.n} × {result.features.d} feature matrix
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Fused z" value={formatNumber(fusedNow, 2)} hint="alert at 3.0" />
        <Kpi
          label="Best detector"
          value={result.bestDetector.detector}
          hint={`AUC ${result.bestDetector.auc.toFixed(3)}`}
        />
        <Kpi
          label="Fused AUC"
          value={result.fusedAuc.toFixed(3)}
          hint="vs fault_injected"
        />
        <Kpi
          label="Detection latency"
          value={
            result.firstAlarm
              ? `${result.firstAlarm.latencyHours.toFixed(1)} h`
              : "—"
          }
          hint={
            result.firstAlarm
              ? `row ${result.firstAlarm.rawRow} · ${result.firstAlarm.timestamp}`
              : "no true-positive alarm"
          }
        />
      </section>

      <Panel
        kicker="Plot 06"
        title="Fused anomaly score"
        description="Weighted sum of six MAD-calibrated z-scores. Stars mark rows where any alarm rule fires."
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="i" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <RTooltip {...tooltipBox} />
              <ReferenceLine
                x={result.faultOnsetFeat}
                stroke="var(--color-alarm)"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                y={FUSED_THRESHOLD}
                stroke="var(--color-alarm)"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                x={playIndex}
                stroke="var(--color-primary)"
              />
              <Line
                type="monotone"
                dataKey="fused"
                stroke="var(--color-chart-1)"
                dot={false}
                strokeWidth={1.5}
              />
              <Line
                type="linear"
                dataKey="alarm"
                stroke="var(--color-alarm)"
                dot={{ r: 3, fill: "var(--color-alarm)" }}
                strokeWidth={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel kicker="Live snapshot" title="Sensor suite" description={`Raw row ${rawIdx} of ${FAULT_START + 500}.`}>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SENSOR_KEYS.map((k) => (
              <li
                key={k}
                className="flex items-baseline justify-between rounded-lg bg-secondary px-3 py-2"
              >
                <span className="text-xs text-muted-foreground">{SENSOR_LABELS[k]}</span>
                <span className="font-mono text-sm tabular">
                  {formatNumber(result.sensors.values[k][rawIdx], 2)}
                  <span className="ml-1 text-xs text-muted-foreground">{SENSOR_UNITS[k]}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          kicker="Ensemble"
          title="Calibrated z at playhead"
          description="Self-tuned MAD z-scores. Fusion weights after correlation discounting."
        >
          <ul className="space-y-3">
            {DETECTOR_IDS.map((id) => {
              const z = result.zScores[id][playIndex] ?? 0;
              const w = result.weights[id];
              const width = Math.min(100, Math.abs(z) * 12);
              return (
                <li key={id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{DETECTOR_LABELS[id]}</span>
                    <span className="font-mono tabular text-muted-foreground">
                      z {formatNumber(z, 2)} · w {formatNumber(w, 2)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${width}%`, background: DETECTOR_COLORS[id] }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl tabular tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
