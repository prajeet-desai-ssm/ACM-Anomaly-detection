import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useAcm, a as FAULT_START, f as formatNumber, g as sensorsToCsv, i as DETECTOR_LABELS, r as DETECTOR_IDS } from "./store-CFvxSWJQ.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as tooltipBox, n as HeatCells, r as Panel, u as rollingZHeatmap } from "./viz-DJnxTaif.mjs";
import { S as Legend, b as ResponsiveContainer, c as Scatter, d as Line, f as CartesianGrid, l as ZAxis, o as YAxis, s as XAxis, t as ComposedChart, x as Tooltip } from "../_libs/recharts+[...].mjs";
import { n as Button } from "./router-C2w1hfoT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report-DR1lSG7k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function download(filename, text, type = "text/plain") {
	const blob = new Blob([text], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function ReportView() {
	const result = useAcm((s) => s.result);
	const heat = (0, import_react.useMemo)(() => result ? rollingZHeatmap(result, 50) : null, [result]);
	const healthy = (0, import_react.useMemo)(() => result ? result.pca.scores.filter((p) => !p.fault) : [], [result]);
	const fault = (0, import_react.useMemo)(() => result ? result.pca.scores.filter((p) => p.fault) : [], [result]);
	if (!result || !heat) return null;
	const v1 = ((result.pca.varExplained[0] ?? 0) * 100).toFixed(1);
	const v2 = ((result.pca.varExplained[1] ?? 0) * 100).toFixed(1);
	const binLabels = heat.bins[0].map((_, i) => i % 4 === 0 ? String(i) : "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Evaluation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-medium tracking-tight",
						children: "Report"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted-foreground",
						children: "Separation of healthy vs fault on calibrated z, plus the PCA score plane and a rolling detector heatmap."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => download("sensor_data.csv", sensorsToCsv(result.sensors), "text/csv"),
						children: "Download CSV"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => download("acm_results.json", JSON.stringify(summarize(result), null, 2), "application/json"),
						children: "Download results"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				kicker: "Section 9",
				title: "Detector scorecard",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-96 text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
								"Detector",
								"Mean z healthy",
								"Mean z fault",
								"Separation",
								"AUC-ROC"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: h
							}, h)) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "font-mono tabular",
							children: result.detectorTable.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-sans",
										children: DETECTOR_LABELS[row.detector]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatNumber(row.meanHealthy, 2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatNumber(row.meanFault, 2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatNumber(row.separation, 2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.auc.toFixed(3) })
								]
							}, row.detector))
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-1 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Best detector by AUC-ROC:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: result.bestDetector.detector
							}),
							" (AUC =",
							" ",
							result.bestDetector.auc.toFixed(3),
							")"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Fused score AUC-ROC:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: result.fusedAuc.toFixed(3)
							})
						] }),
						result.firstAlarm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"First alarm fired at row ",
							result.firstAlarm.rawRow,
							", timestamp",
							" ",
							result.firstAlarm.timestamp,
							". Fault injected at row ",
							FAULT_START,
							". Detection latency = ",
							result.firstAlarm.latencyRows,
							" rows =",
							" ",
							result.firstAlarm.latencyHours.toFixed(1),
							" hours."
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No true-positive alarm after fault onset." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 07",
				title: "PCA score plane",
				description: `PC1 (${v1}% variance) vs PC2 (${v2}%). Ellipse is the 99% T² contour.`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
							margin: {
								top: 12,
								right: 12,
								left: 8,
								bottom: 28
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, { stroke: "var(--color-border)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									dataKey: "pc1",
									name: "PC1",
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									},
									label: {
										value: `PC1 (${v1}% variance)`,
										position: "bottom",
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "number",
									dataKey: "pc2",
									name: "PC2",
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZAxis, { range: [20, 20] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipBox }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scatter, {
									name: "Normal",
									data: healthy,
									fill: "var(--color-chart-1)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scatter, {
									name: "Fault",
									data: fault,
									fill: "var(--color-alarm)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									name: "99% T² limit",
									data: result.pca.ellipse.map((p) => ({
										pc1: p.x,
										pc2: p.y
									})),
									dataKey: "pc2",
									stroke: "var(--color-foreground)",
									dot: false,
									type: "linear",
									legendType: "line"
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 12",
				title: "Rolling mean z-score heatmap (50-row windows)",
				description: "Each cell is the mean calibrated z in a 50-row bin.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeatCells, {
					matrix: heat.bins,
					rowLabels: [...DETECTOR_IDS],
					colLabels: binLabels,
					diverging: false
				})
			})
		]
	});
}
function summarize(result) {
	return {
		featureShape: [result.features.n, result.features.d],
		gmmBestK: result.gmmBestK,
		gmmBic: result.gmmBic,
		weights: result.weights,
		detectorTable: result.detectorTable,
		fusedAuc: result.fusedAuc,
		bestDetector: result.bestDetector,
		firstAlarm: result.firstAlarm,
		alarmMetrics: result.alarmMetrics
	};
}
var SplitComponent = ReportView;
//#endregion
export { SplitComponent as component };
