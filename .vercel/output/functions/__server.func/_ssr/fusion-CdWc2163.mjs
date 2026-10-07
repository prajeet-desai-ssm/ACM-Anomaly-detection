import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useAcm, f as formatNumber, r as DETECTOR_IDS } from "./store-CFvxSWJQ.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as kdeCurve, d as sampledSeries, f as tooltipBox, i as ViolinGroup, r as Panel } from "./viz-DJnxTaif.mjs";
import { a as LineChart, b as ResponsiveContainer, d as Line, f as CartesianGrid, i as BarChart, m as Bar, o as YAxis, p as ReferenceLine, s as XAxis, x as Tooltip, y as LabelList } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fusion-CdWc2163.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FusionView() {
	const result = useAcm((s) => s.result);
	const playIndex = useAcm((s) => s.playIndex);
	const fusedChart = (0, import_react.useMemo)(() => {
		if (!result) return [];
		return sampledSeries(result.features.n, 360, [result.faultOnsetFeat, playIndex]).map((i) => ({
			i,
			fused: result.fused[i],
			alarm: result.anyAlarm[i] ? result.fused[i] : null
		}));
	}, [result, playIndex]);
	const bars = (0, import_react.useMemo)(() => result ? result.alarmMetrics.map((m) => ({
		rule: m.rule,
		Precision: Number(m.precision.toFixed(2)),
		Recall: Number(m.recall.toFixed(2))
	})) : [], [result]);
	const violins = (0, import_react.useMemo)(() => {
		if (!result) return [];
		const healthy = result.fused.slice(0, 900);
		const early = result.fused.slice(result.faultOnsetFeat, result.faultOnsetFeat + 125);
		const late = result.fused.slice(result.faultOnsetFeat + 125);
		const take = (arr, n = 120) => arr.filter((_, i) => i % Math.max(1, Math.floor(arr.length / n)) === 0);
		return [
			{
				label: "Healthy (0–900)",
				curve: kdeCurve(healthy),
				values: take(healthy)
			},
			{
				label: "Early fault",
				curve: kdeCurve(early),
				values: take(early)
			},
			{
				label: "Late fault",
				curve: kdeCurve(late),
				values: take(late)
			}
		];
	}, [result]);
	if (!result) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
					children: "Score fusion"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "Alarms & weights"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted-foreground",
					children: [
						"Pairwise Pearson on the holdout window discounts any detector with |r| exceeding 0.85 against a heavier partner. Threshold is fixed at ",
						3,
						"."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				kicker: "Weights",
				title: "Final fusion weights",
				description: "Renormalised after correlation discounting.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
					children: DETECTOR_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: id }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular",
							children: [
								formatNumber(result.weightBase[id], 2),
								" → ",
								formatNumber(result.weights[id], 2)
							]
						})]
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-1 font-mono text-xs text-muted-foreground",
					children: [result.corrPairs.filter((p) => p.discounted).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						p.a,
						" × ",
						p.b,
						"  r = ",
						p.r.toFixed(2),
						" · lower weight halved"
					] }, `${p.a}-${p.b}`)), result.corrPairs.every((p) => !p.discounted) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No pair exceeded |r| = 0.85 on holdout." }) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 06",
				title: "Fused anomaly score with alarm events",
				description: "Grey = baseline, orange wash after fault onset. Markers fire when any of R1–R4 is true.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: fusedChart,
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
									y: 3,
									stroke: "var(--color-alarm)",
									strokeDasharray: "4 4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									x: 900,
									stroke: "var(--color-border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									x: result.faultOnsetFeat,
									stroke: "var(--color-alarm)",
									strokeDasharray: "4 4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "fused",
									stroke: "var(--color-chart-1)",
									dot: false,
									strokeWidth: 1.6
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "linear",
									dataKey: "alarm",
									stroke: "transparent",
									dot: {
										r: 4,
										fill: "var(--color-alarm)",
										strokeWidth: 0
									}
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				kicker: "Plot 10",
				title: "Alarm rule performance — precision vs recall",
				description: "R1 sustained · R2 repeated · R3 per-detector · R4 rapid rise. Evaluated on feature rows vs fault_injected.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: bars,
							margin: {
								top: 16,
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
									dataKey: "rule",
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 12
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									domain: [0, 1],
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipBox }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "Precision",
									fill: "var(--color-chart-1)",
									radius: [
										4,
										4,
										0,
										0
									],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabelList, {
										dataKey: "Precision",
										position: "top",
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "Recall",
									fill: "var(--color-chart-3)",
									radius: [
										4,
										4,
										0,
										0
									],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabelList, {
										dataKey: "Recall",
										position: "top",
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									})
								})
							]
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-96 text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
								"Rule",
								"TP",
								"FP",
								"FN",
								"TN",
								"P",
								"R",
								"F1"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: h
							}, h)) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "font-mono tabular",
							children: result.alarmMetrics.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-sans",
										children: m.rule
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.tp }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.fp }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.fn }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.tn }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.precision.toFixed(2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.recall.toFixed(2) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m.f1.toFixed(2) })
								]
							}, m.rule))
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 11",
				title: "Fused score distribution by regime",
				description: "Healthy baseline, the first 125 fault rows, then late degradation.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViolinGroup, { groups: violins })
			})
		]
	});
}
var SplitComponent = FusionView;
//#endregion
export { SplitComponent as component };
