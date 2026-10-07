import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, tooltipBox } from "@/components/acm/primitives";
import {
  DETECTOR_COLORS,
  DETECTOR_IDS,
  DETECTOR_LABELS,
  FUSED_THRESHOLD,
} from "@/lib/acm/constants";
import { useAcm } from "@/lib/acm/store";
import { histBins, radarQuarters, sampledSeries } from "@/lib/acm/viz";

export function DetectorsView() {
  const result = useAcm((s) => s.result);
  const playIndex = useAcm((s) => s.playIndex);

  const rawPanels = useMemo(() => {
    if (!result) return [];
    const idx = sampledSeries(result.features.n, 280, [result.faultOnsetFeat, playIndex]);
    return DETECTOR_IDS.map((id) => ({
      id,
      data: idx.map((i) => ({ i, v: result.rawScores[id][i] })),
    }));
  }, [result, playIndex]);

  const zData = useMemo(() => {
    if (!result) return [];
    const idx = sampledSeries(result.features.n, 320, [result.faultOnsetFeat, playIndex]);
    return idx.map((i) => {
      const row: Record<string, number> = { i };
      for (const id of DETECTOR_IDS) row[id] = result.zScores[id][i];
      return row;
    });
  }, [result, playIndex]);

  const depthHist = useMemo(() => {
    if (!result) return { n: [] as Array<{ x: number; y: number }>, f: [] as Array<{ x: number; y: number }> };
    const nVals: number[] = [];
    const fVals: number[] = [];
    result.iforestDepth.forEach((d, i) => {
      if (i < result.faultOnsetFeat) nVals.push(d);
      else fVals.push(d);
    });
    return { n: histBins(nVals, 22), f: histBins(fVals, 22) };
  }, [result]);

  const radar = useMemo(() => (result ? radarQuarters(result) : []), [result]);

  if (!result) return null;

  const depthPlot = depthHist.n.map((b, i) => ({
    x: b.x,
    healthy: b.y,
    fault: depthHist.f[i]?.y ?? 0,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Unsupervised bank
        </p>
        <h1 className="text-2xl font-medium tracking-tight">Six detectors</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Healthy baseline is the first 900 feature rows. GMM selected k = {result.gmmBestK} by BIC (
          {result.gmmBic.toExponential(2)}).
        </p>
      </header>

      <Panel kicker="Plot 04" title="Raw detector scores" description="Higher is more anomalous. Fault onset is the dashed marker in feature-matrix index.">
        <div className="grid gap-4 md:grid-cols-2">
          {rawPanels.map((p) => (
            <div key={p.id} className="h-40">
              <p className="mb-1 text-xs text-muted-foreground">{DETECTOR_LABELS[p.id]}</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={p.data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="i" hide />
                  <YAxis width={36} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                  <RTooltip {...tooltipBox} />
                  <ReferenceLine x={result.faultOnsetFeat} stroke="var(--color-alarm)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="v" stroke={DETECTOR_COLORS[p.id]} dot={false} strokeWidth={1.25} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        kicker="Plot 05"
        title="All detector z-scores — fault onset highlighted"
        description="Holdout-calibrated MAD z. Horizontal line is the fused alert at 3.0."
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="i" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <RTooltip {...tooltipBox} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }} />
              <ReferenceLine y={FUSED_THRESHOLD} stroke="var(--color-alarm)" strokeDasharray="4 4" />
              <ReferenceLine x={result.faultOnsetFeat} stroke="var(--color-alarm)" strokeDasharray="4 4" />
              {DETECTOR_IDS.map((id) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  name={id}
                  stroke={DETECTOR_COLORS[id]}
                  dot={false}
                  strokeWidth={1.25}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          kicker="Plot 08"
          title="Isolation path depth: normal vs fault"
          description="Average path length across 100 trees. Fault rows isolate earlier."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depthPlot} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="x" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <RTooltip {...tooltipBox} />
                <Area type="monotone" dataKey="healthy" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.25} />
                <Area type="monotone" dataKey="fault" stroke="var(--color-alarm)" fill="var(--color-alarm)" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          kicker="Plot 09"
          title="Detector response by fault stage"
          description="Mean calibrated z in four equal quarters of the fault window."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="detector" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                <Radar name="Q1 early" dataKey="q1" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.15} />
                <Radar name="Q2" dataKey="q2" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.12} />
                <Radar name="Q3" dataKey="q3" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.1} />
                <Radar name="Q4 late" dataKey="q4" stroke="var(--color-alarm)" fill="var(--color-alarm)" fillOpacity={0.12} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
