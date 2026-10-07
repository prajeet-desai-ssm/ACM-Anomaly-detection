import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useAcm, a as FAULT_START, c as SENSOR_LABELS, o as PLOT1_KEYS, s as SENSOR_KEYS } from "./store-CFvxSWJQ.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as boxStats, d as sampledSeries, f as tooltipBox, n as HeatCells, o as corrMatrix, r as Panel, t as BoxRow } from "./viz-DJnxTaif.mjs";
import { a as LineChart, b as ResponsiveContainer, d as Line, f as CartesianGrid, o as YAxis, p as ReferenceLine, s as XAxis, x as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/telemetry-B60JgrJ5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TelemetryView() {
	const result = useAcm((s) => s.result);
	const playIndex = useAcm((s) => s.playIndex);
	const series = (0, import_react.useMemo)(() => {
		if (!result) return [];
		return sampledSeries(result.sensors.n, 360, [FAULT_START, playIndex + result.features.offset]).map((i) => {
			const row = { i };
			for (const k of PLOT1_KEYS) row[k] = result.sensors.values[k][i];
			return row;
		});
	}, [result, playIndex]);
	const corrs = (0, import_react.useMemo)(() => {
		if (!result) return {
			normal: [],
			fault: []
		};
		return {
			normal: corrMatrix(result.sensors, 0, FAULT_START),
			fault: corrMatrix(result.sensors, FAULT_START, result.sensors.n)
		};
	}, [result]);
	const boxes = (0, import_react.useMemo)(() => {
		if (!result) return [];
		const split = (key) => {
			const arr = result.features.rollingMean[key];
			return {
				n: arr.filter((_, i) => i < result.faultOnsetFeat),
				f: arr.filter((_, i) => i >= result.faultOnsetFeat)
			};
		};
		const tb = split("temp_bearing");
		const vx = split("vibration_x");
		return [
			{
				label: "Bearing temp · normal",
				...boxStats(tb.n)
			},
			{
				label: "Bearing temp · fault",
				...boxStats(tb.f)
			},
			{
				label: "Vibration X · normal",
				...boxStats(vx.n)
			},
			{
				label: "Vibration X · fault",
				...boxStats(vx.f)
			}
		];
	}, [result]);
	if (!result) return null;
	const short = SENSOR_KEYS.map((k) => SENSOR_LABELS[k].replace(" pressure", "").replace(" temp", ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
					children: "Historian"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "Telemetry"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted-foreground",
					children: "Nine-channel suite at 10-minute cadence. Red dashed line is fault injection at row 1500."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 01",
				title: "Raw sensor readings — bearing fault scenario",
				description: "Shared time index. Playhead follows the scrubber.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: PLOT1_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-44",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-xs text-muted-foreground",
							children: SENSOR_LABELS[k]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: series,
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
										width: 40,
										tick: {
											fill: "var(--color-muted-foreground)",
											fontSize: 10
										},
										domain: ["auto", "auto"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipBox }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
										x: FAULT_START,
										stroke: "var(--color-alarm)",
										strokeDasharray: "4 4"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: k,
										stroke: "var(--color-chart-1)",
										dot: false,
										strokeWidth: 1.25
									})
								]
							})
						})]
					}, k))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 02",
				title: "Correlation heatmap: normal vs fault",
				description: "Pearson r across the nine sensors. Structure loosens in the fault regime as uncorrelated noise is injected.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-8 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs uppercase tracking-widest text-muted-foreground",
						children: "Normal regime"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeatCells, {
						matrix: corrs.normal,
						rowLabels: short,
						colLabels: short
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs uppercase tracking-widest text-muted-foreground",
						children: "Fault regime"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeatCells, {
						matrix: corrs.fault,
						rowLabels: short,
						colLabels: short
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				kicker: "Plot 03",
				title: "Rolling mean distribution: normal vs fault",
				description: "10-hour rolling mean of bearing temperature and axial vibration, split on the true fault onset.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoxRow, { items: boxes })
			})
		]
	});
}
var SplitComponent = TelemetryView;
//#endregion
export { SplitComponent as component };
