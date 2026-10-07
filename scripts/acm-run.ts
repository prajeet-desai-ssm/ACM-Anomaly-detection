import { runPipeline } from "../src/lib/acm/pipeline.ts";

const t0 = Date.now();
const result = await runPipeline((step, pct) => {
  console.log(`${String(pct).padStart(3, " ")}%  ${step}`);
});
const ms = Date.now() - t0;
console.log("elapsed_ms", ms);
console.log("Feature matrix shape:", `(${result.features.n}, ${result.features.d})`);
console.log("GMM best k =", result.gmmBestK, "BIC =", result.gmmBic.toFixed(1));
console.log("fault onset feat", result.faultOnsetFeat);
console.log("weights", result.weights);
for (const row of result.detectorTable) {
  console.log(
    row.detector,
    "healthy",
    row.meanHealthy.toFixed(2),
    "fault",
    row.meanFault.toFixed(2),
    "sep",
    row.separation.toFixed(2),
    "auc",
    row.auc.toFixed(3),
  );
}
console.log("fused auc", result.fusedAuc.toFixed(3));
console.log("best", result.bestDetector);
console.log("first alarm", result.firstAlarm);
for (const m of result.alarmMetrics) {
  console.log(m.rule, "P", m.precision.toFixed(3), "R", m.recall.toFixed(3), "F1", m.f1.toFixed(3), "FP", m.fp, "TP", m.tp);
}
