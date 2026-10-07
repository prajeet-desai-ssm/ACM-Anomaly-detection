import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useAcm, a as FAULT_START, c as SENSOR_LABELS, f as formatNumber, i as DETECTOR_LABELS, l as SENSOR_UNITS, n as DETECTOR_COLORS, r as DETECTOR_IDS, s as SENSOR_KEYS, t as ASSET } from "./store-CFvxSWJQ.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as sampledSeries, f as tooltipBox, r as Panel } from "./viz-DJnxTaif.mjs";
import { a as LineChart, b as ResponsiveContainer, d as Line, f as CartesianGrid, o as YAxis, p as ReferenceLine, s as XAxis, x as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CzbcHbPn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OverviewView() {
	const result = useAcm((s) => s.result);
	const playIndex = useAcm((s) => s.playIndex);
	const chartData = (0, import_react.useMemo)(() => {
		if (!result) return [];
		return sampledSeries(result.features.n, 360, [result.faultOnsetFeat, playIndex]).map((i) => ({
			i,
			fused: result.fused[i],
			alarm: result.anyAlarm[i] ? result.fused[i] : null
		}));
	}, [result, playIndex]);
	if (!result) return null;
	const fusedNow = result.fused[playIndex] ?? 0;
	const rawIdx = playIndex + result.features.offset;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: ASSET.site
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-2xl font-medium tracking-tight md:text-3xl",
						children: [
							ASSET.tag,
							" · ",
							ASSET.component
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted-foreground",
						children: "Synthetic 14-day historian. Healthy envelope for 1500 samples, then an inner-race bearing ramp on temperature and axial vibration."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs text-muted-foreground",
					children: [
						result.features.n,
						" × ",
						result.features.d,
						" feature matrix"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fused z",
						value: formatNumber(fusedNow, 2),
						hint: "alert at 3.0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Best detector",
						value: result.bestDetector.detector,
						hint: `AUC ${result.bestDetector.auc.toFixed(3)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fused AUC",
						value: result.fusedAuc.toFixed(3),
						hint: "vs fault_injected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Detection latency",
						value: result.firstAlarm ? `${result.firstAlarm.latencyHours.toFixed(1)} h` : "—",
						hint: result.firstAlarm ? `row ${result.firstAlarm.rawRow} · ${result.firstAlarm.timestamp}` : "no true-positive alarm"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 06",
				title: "Fused anomaly score",
				description: "Weighted sum of six MAD-calibrated z-scores. Stars mark rows where any alarm rule fires.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: chartData,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "i",
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipBox }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									x: result.faultOnsetFeat,
									stroke: "var(--color-alarm)",
									strokeDasharray: "4 4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									y: 3,
									stroke: "var(--color-alarm)",
									strokeDasharray: "4 4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									x: playIndex,
									stroke: "var(--color-primary)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "fused",
									stroke: "var(--color-chart-1)",
									dot: false,
									strokeWidth: 1.5
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "linear",
									dataKey: "alarm",
									stroke: "var(--color-alarm)",
									dot: {
										r: 3,
										fill: "var(--color-alarm)"
									},
									strokeWidth: 0
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					kicker: "Live snapshot",
					title: "Sensor suite",
					description: `Raw row ${rawIdx} of ${FAULT_START + 500}.`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
						children: SENSOR_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between rounded-lg bg-secondary px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: SENSOR_LABELS[k]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-sm tabular",
								children: [formatNumber(result.sensors.values[k][rawIdx], 2), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-xs text-muted-foreground",
									children: SENSOR_UNITS[k]
								})]
							})]
						}, k))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					kicker: "Ensemble",
					title: "Calibrated z at playhead",
					description: "Self-tuned MAD z-scores. Fusion weights after correlation discounting.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: DETECTOR_IDS.map((id) => {
							const z = result.zScores[id][playIndex] ?? 0;
							const w = result.weights[id];
							const width = Math.min(100, Math.abs(z) * 12);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: DETECTOR_LABELS[id] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono tabular text-muted-foreground",
									children: [
										"z ",
										formatNumber(z, 2),
										" · w ",
										formatNumber(w, 2)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 overflow-hidden rounded-full bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full",
									style: {
										width: `${width}%`,
										background: DETECTOR_COLORS[id]
									}
								})
							})] }, id);
						})
					})
				})]
			})
		]
	});
}
function Kpi({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card px-4 py-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-2xl tabular tracking-tight",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
var SplitComponent = OverviewView;
//#endregion
export { SplitComponent as component };
