import { d as downsampleIndices, h as quantile, m as pearson, p as kde, r as DETECTOR_IDS, s as SENSOR_KEYS, u as cn } from "./store-CFvxSWJQ.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/viz-DJnxTaif.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl border border-border bg-card text-card-foreground shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 px-5 pt-5", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: cn("text-sm font-medium tracking-tight", className),
		...props
	});
}
function CardDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-xs text-muted-foreground", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("px-5 pb-5 pt-3", className),
		...props
	});
}
function Panel({ title, kicker, description, children, className, bodyClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn("overflow-hidden", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
				children: kicker
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: title }),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: description }) : null
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: bodyClassName,
			children
		})]
	});
}
function HeatCells({ matrix, rowLabels, colLabels, diverging = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-96 border-collapse text-center font-mono text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-1" }), colLabels.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "p-1 font-medium text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-block max-w-16 truncate",
					children: l
				})
			}, l))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: matrix.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "whitespace-nowrap pr-2 text-left font-medium text-muted-foreground",
				children: rowLabels[i]
			}), row.map((v, j) => {
				const a = Math.min(1, Math.abs(v) / (diverging ? 1 : 8));
				const mix = Math.round(a * 72);
				const color = diverging ? v >= 0 ? `color-mix(in oklab, var(--color-alarm) ${mix}%, var(--color-card))` : `color-mix(in oklab, var(--color-chart-1) ${mix}%, var(--color-card))` : `color-mix(in oklab, var(--color-alarm) ${mix}%, var(--color-card))`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "p-0.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-sm px-1 py-2 tabular",
						style: {
							background: color,
							color: a > .45 ? "var(--color-foreground)" : "var(--color-muted-foreground)"
						},
						children: v.toFixed(1)
					})
				}, `${i}-${j}`);
			})] }, rowLabels[i])) })]
		})
	});
}
function BoxRow({ items }) {
	const all = items.flatMap((b) => [b.min, b.max]);
	const lo = Math.min(...all);
	const span = Math.max(...all) - lo || 1;
	const x = (v) => (v - lo) / span * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: items.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-2 sm:grid-cols-[9rem_1fr] sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: b.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-8 rounded-md bg-secondary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-1/2 h-px -translate-y-1/2 bg-border",
						style: {
							left: `${x(b.min)}%`,
							width: `${x(b.max) - x(b.min)}%`
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-1 h-6 rounded-sm border border-primary/40 bg-primary/15",
						style: {
							left: `${x(b.q1)}%`,
							width: `${Math.max(x(b.q3) - x(b.q1), 1)}%`
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-1 h-6 w-px bg-primary",
						style: { left: `${x(b.med)}%` }
					})
				]
			})]
		}, b.label))
	});
}
function ViolinGroup({ groups }) {
	const xs = groups.flatMap((g) => g.curve.map((p) => p.x));
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const width = 280;
	const height = 160;
	const gx = (x) => (x - minX) / (maxX - minX || 1) * 256 + 12;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-3",
		children: groups.map((g) => {
			const maxY = Math.max(...g.curve.map((p) => p.y), 1e-9);
			const mid = height / 2;
			const top = g.curve.map((p) => `${gx(p.x)},${mid - p.y / maxY * 72}`).join(" ");
			const bot = [...g.curve].reverse().map((p) => `${gx(p.x)},${mid + p.y / maxY * 72}`).join(" ");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs text-muted-foreground",
				children: g.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: `0 0 ${width} ${height}`,
				className: "h-40 w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: `${top} ${bot}`,
					className: "fill-primary/20 stroke-primary/50"
				}), g.values.slice(0, 80).map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: gx(v),
					cy: mid + (i % 7 - 3) * 4,
					r: 1.4,
					className: "fill-foreground/40"
				}, i))]
			})] }, g.label);
		})
	});
}
var tooltipBox = {
	contentStyle: {
		background: "var(--color-card)",
		border: "1px solid var(--color-border)",
		borderRadius: 8,
		fontSize: 12,
		color: "var(--color-foreground)"
	},
	labelStyle: { color: "var(--color-muted-foreground)" }
};
function corrMatrix(data, lo, hi) {
	const slices = SENSOR_KEYS.map((k) => data.values[k].subarray(lo, hi));
	const d = slices.length;
	const R = Array.from({ length: d }, () => Array(d).fill(1));
	for (let i = 0; i < d; i++) for (let j = i + 1; j < d; j++) {
		const r = pearson(slices[i], slices[j]);
		R[i][j] = R[j][i] = r;
	}
	return R;
}
function boxStats(values) {
	const s = values.slice().sort((a, b) => a - b);
	return {
		min: s[0] ?? 0,
		q1: quantile(s, .25),
		med: quantile(s, .5),
		q3: quantile(s, .75),
		max: s[s.length - 1] ?? 0
	};
}
function histBins(values, bins = 24) {
	if (!values.length) return [];
	let min = Infinity;
	let max = -Infinity;
	for (const v of values) {
		if (v < min) min = v;
		if (v > max) max = v;
	}
	if (max === min) max = min + 1;
	const w = (max - min) / bins;
	const counts = new Array(bins).fill(0);
	for (const v of values) {
		let b = Math.floor((v - min) / w);
		if (b >= bins) b = bins - 1;
		if (b < 0) b = 0;
		counts[b]++;
	}
	const n = values.length;
	return counts.map((c, i) => ({
		x: min + (i + .5) * w,
		y: c / n
	}));
}
function radarQuarters(result) {
	const start = result.faultOnsetFeat;
	const end = result.features.n;
	const span = Math.max(end - start, 4);
	const q = Math.floor(span / 4);
	const rows = [];
	for (const id of DETECTOR_IDS) {
		const rec = { detector: id };
		for (let k = 0; k < 4; k++) {
			const lo = start + k * q;
			const hi = k === 3 ? end : start + (k + 1) * q;
			let s = 0;
			let c = 0;
			for (let i = lo; i < hi; i++) {
				s += result.zScores[id][i];
				c++;
			}
			rec[`q${k + 1}`] = c ? s / c : 0;
		}
		rows.push(rec);
	}
	return rows;
}
function rollingZHeatmap(result, win = 50) {
	const n = result.features.n;
	const nBins = Math.ceil(n / win);
	const labels = [...DETECTOR_IDS];
	return {
		bins: labels.map((id) => {
			const row = [];
			for (let b = 0; b < nBins; b++) {
				const lo = b * win;
				const hi = Math.min(n, lo + win);
				let s = 0;
				for (let i = lo; i < hi; i++) s += result.zScores[id][i];
				row.push(s / Math.max(hi - lo, 1));
			}
			return row;
		}),
		labels
	};
}
function sampledSeries(n, maxPoints, extras = []) {
	const idx = downsampleIndices(n, maxPoints);
	const set = new Set(idx);
	for (const e of extras) if (e >= 0 && e < n) set.add(e);
	return Array.from(set).sort((a, b) => a - b);
}
function kdeCurve(values, points = 48) {
	if (!values.length) return [];
	let min = Infinity;
	let max = -Infinity;
	for (const v of values) {
		if (v < min) min = v;
		if (v > max) max = v;
	}
	const pad = (max - min) * .08 || 1;
	const grid = [];
	const a = min - pad;
	const b = max + pad;
	for (let i = 0; i < points; i++) grid.push(a + (b - a) * i / (points - 1));
	const y = kde(values, grid);
	return grid.map((x, i) => ({
		x,
		y: y[i]
	}));
}
//#endregion
export { boxStats as a, kdeCurve as c, sampledSeries as d, tooltipBox as f, ViolinGroup as i, radarQuarters as l, HeatCells as n, corrMatrix as o, Panel as r, histBins as s, BoxRow as t, rollingZHeatmap as u };
