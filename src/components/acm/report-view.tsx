import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { HeatCells, Panel, tooltipBox } from "@/components/acm/primitives";
import { DETECTOR_IDS, DETECTOR_LABELS, FAULT_START } from "@/lib/acm/constants";
import { sensorsToCsv } from "@/lib/acm/generate";
import { useAcm } from "@/lib/acm/store";
import { rollingZHeatmap } from "@/lib/acm/viz";
import { formatNumber } from "@/lib/utils";

function download(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportView() {
  const result = useAcm((s) => s.result);

  const heat = useMemo(() => (result ? rollingZHeatmap(result, 50) : null), [result]);
  const healthy = useMemo(
    () => (result ? result.pca.scores.filter((p) => !p.fault) : []),
    [result],
  );
  const fault = useMemo(
    () => (result ? result.pca.scores.filter((p) => p.fault) : []),
    [result],
  );

  if (!result || !heat) return null;
  const v1 = ((result.pca.varExplained[0] ?? 0) * 100).toFixed(1);
  const v2 = ((result.pca.varExplained[1] ?? 0) * 100).toFixed(1);
  const binLabels = heat.bins[0].map((_, i) => (i % 4 === 0 ? String(i) : ""));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Evaluation
          </p>
          <h1 className="text-2xl font-medium tracking-tight">Report</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Separation of healthy vs fault on calibrated z, plus the PCA score plane and a
            rolling detector heatmap.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => download("sensor_data.csv", sensorsToCsv(result.sensors), "text/csv")}
          >
            Download CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => download("acm_results.json", JSON.stringify(summarize(result), null, 2), "application/json")}
          >
            Download results
          </Button>
        </div>
      </header>

      <Panel kicker="Section 9" title="Detector scorecard">
        <div className="overflow-x-auto">
          <table className="w-full min-w-96 text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                {["Detector", "Mean z healthy", "Mean z fault", "Separation", "AUC-ROC"].map((h) => (
                  <th key={h} className="pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono tabular">
              {result.detectorTable.map((row) => (
                <tr key={row.detector} className="border-t border-border">
                  <td className="py-2 font-sans">{DETECTOR_LABELS[row.detector]}</td>
                  <td>{formatNumber(row.meanHealthy, 2)}</td>
                  <td>{formatNumber(row.meanFault, 2)}</td>
                  <td>{formatNumber(row.separation, 2)}</td>
                  <td>{row.auc.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p>
            Best detector by AUC-ROC:{" "}
            <span className="text-foreground">{result.bestDetector.detector}</span> (AUC ={" "}
            {result.bestDetector.auc.toFixed(3)})
          </p>
          <p>
            Fused score AUC-ROC:{" "}
            <span className="text-foreground">{result.fusedAuc.toFixed(3)}</span>
          </p>
          {result.firstAlarm ? (
            <p>
              First alarm fired at row {result.firstAlarm.rawRow}, timestamp{" "}
              {result.firstAlarm.timestamp}. Fault injected at row {FAULT_START}. Detection
              latency = {result.firstAlarm.latencyRows} rows ={" "}
              {result.firstAlarm.latencyHours.toFixed(1)} hours.
            </p>
          ) : (
            <p>No true-positive alarm after fault onset.</p>
          )}
        </div>
      </Panel>

      <Panel
        kicker="Plot 07"
        title="PCA score plane"
        description={`PC1 (${v1}% variance) vs PC2 (${v2}%). Ellipse is the 99% T² contour.`}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 12, right: 12, left: 8, bottom: 28 }}>
              <CartesianGrid stroke="var(--color-border)" />
              <XAxis
                type="number"
                dataKey="pc1"
                name="PC1"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                label={{
                  value: `PC1 (${v1}% variance)`,
                  position: "bottom",
                  fill: "var(--color-muted-foreground)",
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="pc2"
                name="PC2"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <ZAxis range={[20, 20]} />
              <RTooltip {...tooltipBox} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Scatter name="Normal" data={healthy} fill="var(--color-chart-1)" />
              <Scatter name="Fault" data={fault} fill="var(--color-alarm)" />
              <Line
                name="99% T² limit"
                data={result.pca.ellipse.map((p) => ({ pc1: p.x, pc2: p.y }))}
                dataKey="pc2"
                stroke="var(--color-foreground)"
                dot={false}
                type="linear"
                legendType="line"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        kicker="Plot 12"
        title="Rolling mean z-score heatmap (50-row windows)"
        description="Each cell is the mean calibrated z in a 50-row bin."
      >
        <HeatCells
          matrix={heat.bins}
          rowLabels={[...DETECTOR_IDS]}
          colLabels={binLabels}
          diverging={false}
        />
      </Panel>
    </div>
  );
}

function summarize(result: NonNullable<ReturnType<typeof useAcm.getState>["result"]>) {
  return {
    featureShape: [result.features.n, result.features.d],
    gmmBestK: result.gmmBestK,
    gmmBic: result.gmmBic,
    weights: result.weights,
    detectorTable: result.detectorTable,
    fusedAuc: result.fusedAuc,
    bestDetector: result.bestDetector,
    firstAlarm: result.firstAlarm,
    alarmMetrics: result.alarmMetrics,
  };
}

