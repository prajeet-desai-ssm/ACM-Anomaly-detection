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
import { BoxRow, HeatCells, Panel, tooltipBox } from "@/components/acm/primitives";
import {
  FAULT_START,
  PLOT1_KEYS,
  SENSOR_KEYS,
  SENSOR_LABELS,
} from "@/lib/acm/constants";
import { useAcm } from "@/lib/acm/store";
import { boxStats, corrMatrix, sampledSeries } from "@/lib/acm/viz";

export function TelemetryView() {
  const result = useAcm((s) => s.result);
  const playIndex = useAcm((s) => s.playIndex);

  const series = useMemo(() => {
    if (!result) return [] as Array<Record<string, number>>;
    const idx = sampledSeries(result.sensors.n, 360, [FAULT_START, playIndex + result.features.offset]);
    return idx.map((i) => {
      const row: Record<string, number> = { i };
      for (const k of PLOT1_KEYS) row[k] = result.sensors.values[k][i];
      return row;
    });
  }, [result, playIndex]);

  const corrs = useMemo(() => {
    if (!result) return { normal: [] as number[][], fault: [] as number[][] };
    return {
      normal: corrMatrix(result.sensors, 0, FAULT_START),
      fault: corrMatrix(result.sensors, FAULT_START, result.sensors.n),
    };
  }, [result]);

  const boxes = useMemo(() => {
    if (!result) return [];
    const split = (key: "temp_bearing" | "vibration_x") => {
      const arr = result.features.rollingMean[key];
      const n = arr.filter((_, i) => i < result.faultOnsetFeat);
      const f = arr.filter((_, i) => i >= result.faultOnsetFeat);
      return { n, f };
    };
    const tb = split("temp_bearing");
    const vx = split("vibration_x");
    return [
      { label: "Bearing temp · normal", ...boxStats(tb.n) },
      { label: "Bearing temp · fault", ...boxStats(tb.f) },
      { label: "Vibration X · normal", ...boxStats(vx.n) },
      { label: "Vibration X · fault", ...boxStats(vx.f) },
    ];
  }, [result]);

  if (!result) return null;
  const short = SENSOR_KEYS.map((k) => SENSOR_LABELS[k].replace(" pressure", "").replace(" temp", ""));

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Historian</p>
        <h1 className="text-2xl font-medium tracking-tight">Telemetry</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Nine-channel suite at 10-minute cadence. Red dashed line is fault injection at row 1500.
        </p>
      </header>

      <Panel
        kicker="Plot 01"
        title="Raw sensor readings — bearing fault scenario"
        description="Shared time index. Playhead follows the scrubber."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {PLOT1_KEYS.map((k) => (
            <div key={k} className="h-44">
              <p className="mb-1 text-xs text-muted-foreground">{SENSOR_LABELS[k]}</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="i" hide />
                  <YAxis
                    width={40}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                    domain={["auto", "auto"]}
                  />
                  <RTooltip {...tooltipBox} />
                  <ReferenceLine x={FAULT_START} stroke="var(--color-alarm)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey={k} stroke="var(--color-chart-1)" dot={false} strokeWidth={1.25} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        kicker="Plot 02"
        title="Correlation heatmap: normal vs fault"
        description="Pearson r across the nine sensors. Structure loosens in the fault regime as uncorrelated noise is injected."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Normal regime</p>
            <HeatCells matrix={corrs.normal} rowLabels={short} colLabels={short} />
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Fault regime</p>
            <HeatCells matrix={corrs.fault} rowLabels={short} colLabels={short} />
          </div>
        </div>
      </Panel>

      <Panel
        kicker="Plot 03"
        title="Rolling mean distribution: normal vs fault"
        description="10-hour rolling mean of bearing temperature and axial vibration, split on the true fault onset."
      >
        <BoxRow items={boxes} />
      </Panel>
    </div>
  );
}
