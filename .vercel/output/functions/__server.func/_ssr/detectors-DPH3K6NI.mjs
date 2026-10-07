import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useAcm, i as DETECTOR_LABELS, n as DETECTOR_COLORS, r as DETECTOR_IDS } from "./store-CFvxSWJQ.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as sampledSeries, f as tooltipBox, l as radarQuarters, r as Panel, s as histBins } from "./viz-DJnxTaif.mjs";
import { S as Legend, _ as PolarRadiusAxis, a as LineChart, b as ResponsiveContainer, d as Line, f as CartesianGrid, g as PolarAngleAxis, h as Radar, n as AreaChart, o as YAxis, p as ReferenceLine, r as RadarChart, s as XAxis, u as Area, v as PolarGrid, x as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/detectors-DPH3K6NI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DetectorsView() {
	const result = useAcm((s) => s.result);
	const playIndex = useAcm((s) => s.playIndex);
	const rawPanels = (0, import_react.useMemo)(() => {
		if (!result) return [];
		const idx = sampledSeries(result.features.n, 280, [result.faultOnsetFeat, playIndex]);
		return DETECTOR_IDS.map((id) => ({
			id,
			data: idx.map((i) => ({
				i,
				v: result.rawScores[id][i]
			}))
		}));
	}, [result, playIndex]);
	const zData = (0, import_react.useMemo)(() => {
		if (!result) return [];
		return sampledSeries(result.features.n, 320, [result.faultOnsetFeat, playIndex]).map((i) => {
			const row = { i };
			for (const id of DETECTOR_IDS) row[id] = result.zScores[id][i];
			return row;
		});
	}, [result, playIndex]);
	const depthHist = (0, import_react.useMemo)(() => {
		if (!result) return {
			n: [],
			f: []
		};
		const nVals = [];
		const fVals = [];
		result.iforestDepth.forEach((d, i) => {
			if (i < result.faultOnsetFeat) nVals.push(d);
			else fVals.push(d);
		});
		return {
			n: histBins(nVals, 22),
			f: histBins(fVals, 22)
		};
	}, [result]);
	const radar = (0, import_react.useMemo)(() => result ? radarQuarters(result) : [], [result]);
	if (!result) return null;
	const depthPlot = depthHist.n.map((b, i) => ({
		x: b.x,
		healthy: b.y,
		fault: depthHist.f[i]?.y ?? 0
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
					children: "Unsupervised bank"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "Six detectors"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted-foreground",
					children: [
						"Healthy baseline is the first 900 feature rows. GMM selected k = ",
						result.gmmBestK,
						" by BIC (",
						result.gmmBic.toExponential(2),
						")."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 04",
				title: "Raw detector scores",
				description: "Higher is more anomalous. Fault onset is the dashed marker in feature-matrix index.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: rawPanels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: DETECTOR_LABELS[p.id]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: p.data,
								margin: {
									top: 4,
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
										hide: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										width: 36,
										tick: {
											fill: "var(--color-muted-foreground)",
											fontSize: 10
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipBox }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
										x: result.faultOnsetFeat,
										stroke: "var(--color-alarm)",
										strokeDasharray: "4 4"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "v",
										stroke: DETECTOR_COLORS[p.id],
										dot: false,
										strokeWidth: 1.25
									})
								]
							})
						})]
					}, p.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 05",
				title: "All detector z-scores — fault onset highlighted",
				description: "Holdout-calibrated MAD z. Horizontal line is the fused alert at 3.0.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: zData,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 8
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: {
									fontSize: 12,
									color: "var(--color-muted-foreground)"
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									y: 3,
									stroke: "var(--color-alarm)",
									strokeDasharray: "4 4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									x: result.faultOnsetFeat,
									stroke: "var(--color-alarm)",
									strokeDasharray: "4 4"
								}),
								DETECTOR_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: id,
									name: id,
									stroke: DETECTOR_COLORS[id],
									dot: false,
									strokeWidth: 1.25
								}, id))
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					kicker: "Plot 08",
					title: "Isolation path depth: normal vs fault",
					description: "Average path length across 100 trees. Fault rows isolate earlier.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: depthPlot,
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
										dataKey: "x",
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "healthy",
										stroke: "var(--color-chart-1)",
										fill: "var(--color-chart-1)",
										fillOpacity: .25
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "fault",
										stroke: "var(--color-alarm)",
										fill: "var(--color-alarm)",
										fillOpacity: .25
									})
								]
							})
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					kicker: "Plot 09",
					title: "Detector response by fault stage",
					description: "Mean calibrated z in four equal quarters of the fault window.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
								data: radar,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "var(--color-border)" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
										dataKey: "detector",
										tick: {
											fill: "var(--color-muted-foreground)",
											fontSize: 11
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, { tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 10
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
										name: "Q1 early",
										dataKey: "q1",
										stroke: "var(--color-chart-1)",
										fill: "var(--color-chart-1)",
										fillOpacity: .15
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
										name: "Q2",
										dataKey: "q2",
										stroke: "var(--color-chart-2)",
										fill: "var(--color-chart-2)",
										fillOpacity: .12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
										name: "Q3",
										dataKey: "q3",
										stroke: "var(--color-chart-3)",
										fill: "var(--color-chart-3)",
										fillOpacity: .1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
										name: "Q4 late",
										dataKey: "q4",
										stroke: "var(--color-alarm)",
										fill: "var(--color-alarm)",
										fillOpacity: .12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } })
								]
							})
						})
					})
				})]
			})
		]
	});
}
var SplitComponent = DetectorsView;
//#endregion
export { SplitComponent as component };
