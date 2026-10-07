import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-CFvxSWJQ.js
function cn(...inputs) {
	const classes = [];
	for (const input of inputs) {
		if (!input) continue;
		if (typeof input === "string") classes.push(input);
		else for (const [key, on] of Object.entries(input)) if (on) classes.push(key);
	}
	return twMerge(classes.join(" "));
}
function formatNumber(n, digits = 2) {
	if (!Number.isFinite(n)) return "—";
	return n.toLocaleString("en-US", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	});
}
var N_ROWS = 2e3;
var FAULT_START = 1500;
var HOLDOUT_END = 1200;
var SENSOR_KEYS = [
	"temp_bearing",
	"temp_motor",
	"vibration_x",
	"vibration_y",
	"pressure_inlet",
	"pressure_outlet",
	"current_draw",
	"speed_rpm",
	"flow_rate"
];
var SENSOR_LABELS = {
	temp_bearing: "Bearing temp",
	temp_motor: "Motor temp",
	vibration_x: "Vibration X",
	vibration_y: "Vibration Y",
	pressure_inlet: "Inlet pressure",
	pressure_outlet: "Outlet pressure",
	current_draw: "Current draw",
	speed_rpm: "Speed",
	flow_rate: "Flow rate"
};
var SENSOR_UNITS = {
	temp_bearing: "°C",
	temp_motor: "°C",
	vibration_x: "g",
	vibration_y: "g",
	pressure_inlet: "bar",
	pressure_outlet: "bar",
	current_draw: "A",
	speed_rpm: "rpm",
	flow_rate: "L/min"
};
var SENSOR_MEANS = {
	temp_bearing: 65,
	temp_motor: 72,
	vibration_x: .8,
	vibration_y: .75,
	pressure_inlet: 4.2,
	pressure_outlet: 3.9,
	current_draw: 18,
	speed_rpm: 1480,
	flow_rate: 120
};
var SENSOR_STDS = {
	temp_bearing: 1.5,
	temp_motor: 1.8,
	vibration_x: .08,
	vibration_y: .07,
	pressure_inlet: .12,
	pressure_outlet: .1,
	current_draw: .6,
	speed_rpm: 15,
	flow_rate: 4
};
var FEATURE_STATS = [
	"mean",
	"std",
	"median",
	"mad",
	"slope",
	"skew",
	"kurtosis"
];
var DETECTOR_IDS = [
	"AR1",
	"PCA-SPE",
	"PCA-T2",
	"IForest",
	"GMM",
	"OMR"
];
var DETECTOR_LABELS = {
	AR1: "AR(1) residual",
	"PCA-SPE": "PCA-SPE (Q)",
	"PCA-T2": "PCA-T²",
	IForest: "Isolation Forest",
	GMM: "Gaussian mixture",
	OMR: "Overall model residual"
};
var BASE_WEIGHTS = {
	"PCA-SPE": .3,
	AR1: .2,
	"PCA-T2": .2,
	IForest: .15,
	OMR: .1,
	GMM: .05
};
var DETECTOR_COLORS = {
	AR1: "var(--color-chart-1)",
	"PCA-SPE": "var(--color-chart-2)",
	"PCA-T2": "var(--color-chart-5)",
	IForest: "var(--color-chart-3)",
	GMM: "var(--color-chart-6)",
	OMR: "var(--color-chart-4)"
};
var PLOT1_KEYS = [
	"temp_bearing",
	"temp_motor",
	"vibration_x",
	"pressure_inlet",
	"current_draw",
	"speed_rpm"
];
var ASSET = {
	site: "North Dock Compressor Station",
	unit: "Train A",
	tag: "K-1204",
	component: "Journal bearing BRG-04",
	scenario: "Inner-race bearing degradation",
	sampling: "10-minute historian",
	window: "10-hour rolling window"
};
var Rng = class {
	s;
	constructor(seed) {
		this.s = seed >>> 0;
	}
	next() {
		this.s = this.s + 1831565813 >>> 0;
		let t = this.s;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
	uniform(a = 0, b = 1) {
		return a + (b - a) * this.next();
	}
	int(n) {
		return Math.floor(this.next() * n);
	}
	normal(mu = 0, sigma = 1) {
		let u = 0;
		while (u === 0) u = this.next();
		const v = this.next();
		return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}
};
function cholesky(A) {
	const n = A.length;
	const L = Array.from({ length: n }, () => Array(n).fill(0));
	for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
		let sum = 0;
		for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
		if (i === j) {
			const v = A[i][i] - sum;
			L[i][j] = Math.sqrt(Math.max(v, 1e-12));
		} else L[i][j] = (A[i][j] - sum) / L[j][j];
	}
	return L;
}
function mean(a, lo = 0, hi = a.length) {
	const n = hi - lo;
	if (n <= 0) return 0;
	let s = 0;
	for (let i = lo; i < hi; i++) s += a[i];
	return s / n;
}
function variance(a, lo = 0, hi = a.length) {
	const n = hi - lo;
	if (n <= 1) return 0;
	const m = mean(a, lo, hi);
	let s = 0;
	for (let i = lo; i < hi; i++) {
		const d = a[i] - m;
		s += d * d;
	}
	return s / (n - 1);
}
function std(a, lo = 0, hi = a.length) {
	return Math.sqrt(variance(a, lo, hi));
}
function quantileSorted(sorted, q) {
	const n = sorted.length;
	if (n === 0) return 0;
	const pos = (n - 1) * q;
	const lo = Math.floor(pos);
	const hi = Math.ceil(pos);
	if (lo === hi) return sorted[lo];
	return sorted[lo] * (hi - pos) + sorted[hi] * (pos - lo);
}
function quantile(a, q) {
	const n = a.length;
	const copy = new Float64Array(n);
	for (let i = 0; i < n; i++) copy[i] = a[i];
	copy.sort();
	return quantileSorted(copy, q);
}
function medianRange(a, lo, hi) {
	const n = hi - lo;
	if (n <= 0) return 0;
	const tmp = new Float64Array(n);
	for (let i = 0; i < n; i++) tmp[i] = a[lo + i];
	tmp.sort();
	if (n % 2 === 1) return tmp[n - 1 >> 1];
	return .5 * (tmp[n / 2 - 1] + tmp[n / 2]);
}
function madRange(a, lo, hi, med) {
	const n = hi - lo;
	const tmp = new Float64Array(n);
	for (let i = 0; i < n; i++) tmp[i] = Math.abs(a[lo + i] - med);
	tmp.sort();
	if (n % 2 === 1) return tmp[n - 1 >> 1];
	return .5 * (tmp[n / 2 - 1] + tmp[n / 2]);
}
function slopeRange(a, lo, hi) {
	const n = hi - lo;
	if (n < 2) return 0;
	const xMean = (n - 1) / 2;
	const yMean = mean(a, lo, hi);
	let num = 0;
	let den = 0;
	for (let i = 0; i < n; i++) {
		const dx = i - xMean;
		num += dx * (a[lo + i] - yMean);
		den += dx * dx;
	}
	return den === 0 ? 0 : num / den;
}
function skewKurtRange(a, lo, hi) {
	const n = hi - lo;
	if (n < 4) return {
		skew: 0,
		kurtosis: 0
	};
	const m = mean(a, lo, hi);
	let m2 = 0;
	let m3 = 0;
	let m4 = 0;
	for (let i = lo; i < hi; i++) {
		const d = a[i] - m;
		const d2 = d * d;
		m2 += d2;
		m3 += d2 * d;
		m4 += d2 * d2;
	}
	m2 /= n;
	m3 /= n;
	m4 /= n;
	if (m2 < 1e-18) return {
		skew: 0,
		kurtosis: 0
	};
	const s = Math.sqrt(m2);
	return {
		skew: m3 / (s * s * s),
		kurtosis: m4 / (m2 * m2) - 3
	};
}
function dot(a, b) {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i] * b[i];
	return s;
}
function hypot(a) {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i] * a[i];
	return Math.sqrt(s);
}
function matVec(A, v) {
	const n = A.length;
	const out = new Array(n);
	for (let i = 0; i < n; i++) {
		let s = 0;
		const row = A[i];
		for (let j = 0; j < row.length; j++) s += row[j] * v[j];
		out[i] = s;
	}
	return out;
}
function solveLinear(Ain, bin) {
	const n = bin.length;
	const A = Ain.map((row) => row.slice());
	const b = bin.slice();
	for (let k = 0; k < n; k++) {
		let piv = k;
		let best = Math.abs(A[k][k]);
		for (let i = k + 1; i < n; i++) {
			const v = Math.abs(A[i][k]);
			if (v > best) {
				best = v;
				piv = i;
			}
		}
		if (best < 1e-14) A[k][k] = 1e-14;
		else if (piv !== k) {
			const tmp = A[k];
			A[k] = A[piv];
			A[piv] = tmp;
			const tb = b[k];
			b[k] = b[piv];
			b[piv] = tb;
		}
		const akk = A[k][k];
		for (let i = k + 1; i < n; i++) {
			const f = A[i][k] / akk;
			b[i] -= f * b[k];
			for (let j = k; j < n; j++) A[i][j] -= f * A[k][j];
		}
	}
	const x = new Array(n);
	for (let i = n - 1; i >= 0; i--) {
		let s = b[i];
		for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
		x[i] = s / A[i][i];
	}
	return x;
}
function ridgeFit(X, y, n, d, alpha, skipCol) {
	const cols = [];
	for (let j = 0; j < d; j++) if (j !== skipCol) cols.push(j);
	const p = cols.length;
	const meanX = new Float64Array(p);
	let meanY = 0;
	for (let i = 0; i < n; i++) {
		meanY += y[i];
		const row = i * d;
		for (let k = 0; k < p; k++) meanX[k] += X[row + cols[k]];
	}
	meanY /= n;
	for (let k = 0; k < p; k++) meanX[k] /= n;
	const XtX = Array.from({ length: p }, () => Array(p).fill(0));
	const Xty = new Array(p).fill(0);
	for (let i = 0; i < n; i++) {
		const row = i * d;
		const yc = y[i] - meanY;
		const xc = new Float64Array(p);
		for (let k = 0; k < p; k++) xc[k] = X[row + cols[k]] - meanX[k];
		for (let a = 0; a < p; a++) {
			Xty[a] += xc[a] * yc;
			const rowA = XtX[a];
			for (let b = a; b < p; b++) rowA[b] += xc[a] * xc[b];
		}
	}
	for (let a = 0; a < p; a++) {
		XtX[a][a] += alpha;
		for (let b = 0; b < a; b++) XtX[a][b] = XtX[b][a];
	}
	const coefArr = solveLinear(XtX, Xty);
	const coef = Float64Array.from(coefArr);
	let intercept = meanY;
	for (let k = 0; k < p; k++) intercept -= coef[k] * meanX[k];
	return {
		intercept,
		coef,
		cols
	};
}
function ridgePredict(X, row, d, model) {
	let y = model.intercept;
	const base = row * d;
	for (let k = 0; k < model.cols.length; k++) y += model.coef[k] * X[base + model.cols[k]];
	return y;
}
function topKEigen(C, k, rng) {
	const n = C.length;
	const values = [];
	const vectors = [];
	for (let comp = 0; comp < k; comp++) {
		const v = new Array(n);
		for (let i = 0; i < n; i++) v[i] = rng.normal();
		let nv = hypot(v) || 1;
		for (let i = 0; i < n; i++) v[i] /= nv;
		for (let it = 0; it < 80; it++) {
			const w = matVec(C, v);
			for (let p = 0; p < comp; p++) {
				const proj = dot(vectors[p], w);
				for (let i = 0; i < n; i++) w[i] -= proj * vectors[p][i];
			}
			nv = hypot(w) || 1;
			let diff = 0;
			for (let i = 0; i < n; i++) {
				w[i] /= nv;
				diff += (w[i] - v[i]) * (w[i] - v[i]);
				v[i] = w[i];
			}
			if (diff < 1e-16) break;
		}
		const Cv = matVec(C, v);
		values.push(dot(v, Cv));
		vectors.push(v.slice());
	}
	return {
		values,
		vectors
	};
}
function pearson(a, b) {
	const n = a.length;
	if (n === 0) return 0;
	let ma = 0;
	let mb = 0;
	for (let i = 0; i < n; i++) {
		ma += a[i];
		mb += b[i];
	}
	ma /= n;
	mb /= n;
	let num = 0;
	let da = 0;
	let db = 0;
	for (let i = 0; i < n; i++) {
		const xa = a[i] - ma;
		const xb = b[i] - mb;
		num += xa * xb;
		da += xa * xa;
		db += xb * xb;
	}
	const den = Math.sqrt(da * db);
	return den < 1e-18 ? 0 : num / den;
}
function rocAuc(y, s) {
	const n = y.length;
	const pairs = new Array(n);
	let npos = 0;
	let nneg = 0;
	for (let i = 0; i < n; i++) {
		pairs[i] = {
			y: y[i],
			s: s[i]
		};
		if (y[i] >= 1) npos++;
		else nneg++;
	}
	if (npos === 0 || nneg === 0) return .5;
	pairs.sort((a, b) => a.s - b.s);
	let rankSum = 0;
	let i = 0;
	while (i < n) {
		let j = i;
		while (j < n && pairs[j].s === pairs[i].s) j++;
		const avgRank = (i + 1 + j) / 2;
		for (let k = i; k < j; k++) if (pairs[k].y >= 1) rankSum += avgRank;
		i = j;
	}
	return (rankSum - npos * (npos + 1) / 2) / (npos * nneg);
}
function logSumExp(a) {
	let m = -Infinity;
	for (const v of a) if (v > m) m = v;
	let s = 0;
	for (const v of a) s += Math.exp(v - m);
	return m + Math.log(s);
}
function sampleWithoutReplacement(rng, n, k) {
	const take = Math.min(k, n);
	const idx = new Int32Array(n);
	for (let i = 0; i < n; i++) idx[i] = i;
	for (let i = 0; i < take; i++) {
		const j = i + rng.int(n - i);
		const tmp = idx[i];
		idx[i] = idx[j];
		idx[j] = tmp;
	}
	return idx.subarray(0, take);
}
function kde(values, grid) {
	const n = values.length;
	if (n === 0) return grid.map(() => 0);
	const h = 1.06 * (std(values) || 1) * Math.pow(n, -.2);
	const inv = 1 / (h * Math.sqrt(2 * Math.PI));
	return grid.map((x) => {
		let d = 0;
		for (let i = 0; i < n; i++) {
			const z = (x - values[i]) / h;
			d += Math.exp(-.5 * z * z);
		}
		return d * inv / n;
	});
}
function downsampleIndices(n, maxPoints) {
	if (n <= maxPoints) return Array.from({ length: n }, (_, i) => i);
	const out = [];
	const step = (n - 1) / (maxPoints - 1);
	for (let i = 0; i < maxPoints; i++) out.push(Math.round(i * step));
	return out;
}
function buildFeatures(data, window = 60) {
	const offset = window - 1;
	const n = data.n - offset;
	const d = SENSOR_KEYS.length * FEATURE_STATS.length;
	const X = new Float64Array(n * d);
	const names = [];
	for (const s of SENSOR_KEYS) for (const st of FEATURE_STATS) names.push(`${s}__${st}`);
	const rollingMean = {
		temp_bearing: new Float64Array(n),
		vibration_x: new Float64Array(n)
	};
	for (let col = 0; col < SENSOR_KEYS.length; col++) {
		const series = data.values[SENSOR_KEYS[col]];
		for (let r = 0; r < n; r++) {
			const lo = r;
			const hi = r + window;
			const m = medianRange(series, lo, hi);
			const sd = std(series, lo, hi);
			let sum = 0;
			for (let i = lo; i < hi; i++) sum += series[i];
			const mu = sum / window;
			const mad = madRange(series, lo, hi, m);
			const slope = slopeRange(series, lo, hi);
			const { skew, kurtosis } = skewKurtRange(series, lo, hi);
			const base = r * d + col * FEATURE_STATS.length;
			X[base + 0] = mu;
			X[base + 1] = sd;
			X[base + 2] = m;
			X[base + 3] = mad;
			X[base + 4] = slope;
			X[base + 5] = skew;
			X[base + 6] = kurtosis;
			if (SENSOR_KEYS[col] === "temp_bearing") rollingMean.temp_bearing[r] = mu;
			if (SENSOR_KEYS[col] === "vibration_x") rollingMean.vibration_x[r] = mu;
		}
	}
	return {
		n,
		d,
		offset,
		names,
		X,
		rollingMean
	};
}
function standardizeBaseline(feat, nB) {
	const { X, n, d } = feat;
	const mean = new Float64Array(d);
	const sd = new Float64Array(d);
	for (let i = 0; i < nB; i++) {
		const row = i * d;
		for (let j = 0; j < d; j++) mean[j] += X[row + j];
	}
	for (let j = 0; j < d; j++) mean[j] /= nB;
	for (let i = 0; i < nB; i++) {
		const row = i * d;
		for (let j = 0; j < d; j++) {
			const z = X[row + j] - mean[j];
			sd[j] += z * z;
		}
	}
	for (let j = 0; j < d; j++) sd[j] = Math.sqrt(sd[j] / Math.max(nB - 1, 1)) || 1;
	for (let i = 0; i < n; i++) {
		const row = i * d;
		for (let j = 0; j < d; j++) X[row + j] = (X[row + j] - mean[j]) / sd[j];
	}
}
function colVariance(X, n, d, col, nUse) {
	let m = 0;
	for (let i = 0; i < nUse; i++) m += X[i * d + col];
	m /= nUse;
	let s = 0;
	for (let i = 0; i < nUse; i++) {
		const v = X[i * d + col] - m;
		s += v * v;
	}
	return s / Math.max(nUse - 1, 1);
}
function harmonic(n) {
	return n <= 0 ? 0 : Math.log(n) + .5772156649;
}
function cFactor(n) {
	if (n <= 1) return 0;
	if (n === 2) return 1;
	return 2 * harmonic(n - 1) - 2 * (n - 1) / n;
}
function fitAr1(feat, nB = 900) {
	const { X, n, d } = feat;
	const vars = new Array(d);
	for (let j = 0; j < d; j++) vars[j] = colVariance(X, n, d, j, nB);
	const cols = vars.map((v, j) => ({
		v,
		j
	})).sort((a, b) => b.v - a.v).slice(0, 5).map((x) => x.j);
	const models = cols.map((col) => {
		let sxx = 0;
		let sxy = 0;
		let mx = 0;
		let my = 0;
		const m = nB - 1;
		for (let i = 0; i < m; i++) {
			mx += X[i * d + col];
			my += X[(i + 1) * d + col];
		}
		mx /= m;
		my /= m;
		for (let i = 0; i < m; i++) {
			const x = X[i * d + col] - mx;
			const y = X[(i + 1) * d + col] - my;
			sxx += x * x;
			sxy += x * y;
		}
		const phi = sxx < 1e-18 ? 0 : sxy / sxx;
		return {
			phi,
			c: my - phi * mx
		};
	});
	const score = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		if (i === 0) {
			score[i] = 0;
			continue;
		}
		let acc = 0;
		for (let k = 0; k < cols.length; k++) {
			const col = cols[k];
			const pred = models[k].c + models[k].phi * X[(i - 1) * d + col];
			acc += Math.abs(X[i * d + col] - pred);
		}
		score[i] = acc / cols.length;
	}
	return {
		score,
		cols
	};
}
function fitPca(feat, nB = 900, k = 5) {
	const { X, d } = feat;
	const mean = new Float64Array(d);
	for (let i = 0; i < nB; i++) {
		const row = i * d;
		for (let j = 0; j < d; j++) mean[j] += X[row + j];
	}
	for (let j = 0; j < d; j++) mean[j] /= nB;
	const C = Array.from({ length: d }, () => Array(d).fill(0));
	for (let i = 0; i < nB; i++) {
		const row = i * d;
		for (let a = 0; a < d; a++) {
			const da = X[row + a] - mean[a];
			const Crow = C[a];
			for (let b = a; b < d; b++) Crow[b] += da * (X[row + b] - mean[b]);
		}
	}
	const denom = Math.max(nB - 1, 1);
	let trace = 0;
	for (let a = 0; a < d; a++) {
		C[a][a] /= denom;
		trace += C[a][a];
		for (let b = 0; b < a; b++) C[a][b] = C[b][a] = C[b][a] / denom;
	}
	const { values, vectors } = topKEigen(C, k, new Rng(42));
	return {
		mean,
		values,
		vectors,
		varExplained: values.map((v) => trace > 0 ? v / trace : 0)
	};
}
function scorePca(feat, pca) {
	const { X, n, d } = feat;
	const k = pca.vectors.length;
	const spe = new Float64Array(n);
	const t2 = new Float64Array(n);
	const scores2 = new Float64Array(n * 2);
	for (let i = 0; i < n; i++) {
		const row = i * d;
		const z = new Float64Array(d);
		for (let j = 0; j < d; j++) z[j] = X[row + j] - pca.mean[j];
		const sc = new Array(k);
		const recon = new Float64Array(d);
		for (let c = 0; c < k; c++) {
			let s = 0;
			const v = pca.vectors[c];
			for (let j = 0; j < d; j++) s += z[j] * v[j];
			sc[c] = s;
			for (let j = 0; j < d; j++) recon[j] += s * v[j];
		}
		let q = 0;
		for (let j = 0; j < d; j++) {
			const r = z[j] - recon[j];
			q += r * r;
		}
		spe[i] = q;
		let t = 0;
		for (let c = 0; c < k; c++) {
			const lam = Math.max(pca.values[c], 1e-12);
			t += sc[c] * sc[c] / lam;
		}
		t2[i] = t;
		scores2[i * 2] = sc[0] ?? 0;
		scores2[i * 2 + 1] = sc[1] ?? 0;
	}
	return {
		spe,
		t2,
		scores2
	};
}
function buildIsoTree(X, idx, n, d, depth, maxDepth, rng) {
	if (n <= 1 || depth >= maxDepth) return {
		leaf: true,
		size: n
	};
	const feat = rng.int(d);
	let min = Infinity;
	let max = -Infinity;
	for (let i = 0; i < n; i++) {
		const v = X[idx[i] * d + feat];
		if (v < min) min = v;
		if (v > max) max = v;
	}
	if (!(max > min)) return {
		leaf: true,
		size: n
	};
	const thr = rng.uniform(min, max);
	const leftIdx = new Int32Array(n);
	const rightIdx = new Int32Array(n);
	let nl = 0;
	let nr = 0;
	for (let i = 0; i < n; i++) {
		const row = idx[i];
		if (X[row * d + feat] < thr) leftIdx[nl++] = row;
		else rightIdx[nr++] = row;
	}
	if (nl === 0 || nr === 0) return {
		leaf: true,
		size: n
	};
	return {
		leaf: false,
		feat,
		thr,
		left: buildIsoTree(X, leftIdx.subarray(0, nl), nl, d, depth + 1, maxDepth, rng),
		right: buildIsoTree(X, rightIdx.subarray(0, nr), nr, d, depth + 1, maxDepth, rng)
	};
}
function pathLength(node, xRow, X, d, depth) {
	if (node.leaf) return depth + cFactor(node.size);
	if (X[xRow * d + node.feat] < node.thr) return pathLength(node.left, xRow, X, d, depth + 1);
	return pathLength(node.right, xRow, X, d, depth + 1);
}
function fitIForest(feat, nB = 900, nEstimators = 100, maxSamples = 2048, seed = 17) {
	const { X, n, d } = feat;
	const rng = new Rng(seed);
	const sampleSize = Math.min(maxSamples, nB);
	const maxDepth = Math.ceil(Math.log2(Math.max(sampleSize, 2)));
	const trees = [];
	for (let t = 0; t < nEstimators; t++) {
		const idx = sampleWithoutReplacement(rng, nB, sampleSize);
		trees.push({
			root: buildIsoTree(X, idx, sampleSize, d, 0, maxDepth, rng),
			maxDepth
		});
	}
	const c = cFactor(sampleSize);
	const depths = new Float64Array(n);
	const score = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		let s = 0;
		for (const tree of trees) s += pathLength(tree.root, i, X, d, 0);
		const avg = s / trees.length;
		depths[i] = avg;
		const anom = Math.pow(2, -avg / Math.max(c, 1e-9));
		score[i] = anom;
	}
	return {
		score,
		depths
	};
}
function gmmLogPdf(xRow, X, d, mean, v) {
	let q = 0;
	let logDet = 0;
	for (let j = 0; j < d; j++) {
		const vv = Math.max(v[j], 1e-6);
		const z = X[xRow * d + j] - mean[j];
		q += z * z / vv;
		logDet += Math.log(vv);
	}
	return -.5 * (d * Math.log(2 * Math.PI) + logDet + q);
}
function kmeansPlusPlus(X, n, d, k, rng) {
	const means = [];
	const first = rng.int(n);
	means.push(Float64Array.from({ length: d }, (_, j) => X[first * d + j]));
	const dist = new Float64Array(n);
	for (let c = 1; c < k; c++) {
		let sum = 0;
		for (let i = 0; i < n; i++) {
			let best = Infinity;
			for (const m of means) {
				let q = 0;
				const row = i * d;
				for (let j = 0; j < d; j++) {
					const z = X[row + j] - m[j];
					q += z * z;
				}
				if (q < best) best = q;
			}
			dist[i] = best;
			sum += best;
		}
		let r = rng.next() * (sum || 1);
		let chosen = n - 1;
		for (let i = 0; i < n; i++) {
			r -= dist[i];
			if (r <= 0) {
				chosen = i;
				break;
			}
		}
		means.push(Float64Array.from({ length: d }, (_, j) => X[chosen * d + j]));
	}
	return means;
}
function fitOneGmm(X, n, d, k, rng) {
	let means = kmeansPlusPlus(X, n, d, k, rng);
	const vars = Array.from({ length: k }, () => new Float64Array(d));
	const colStd = new Float64Array(d);
	for (let j = 0; j < d; j++) {
		const col = [];
		for (let i = 0; i < n; i++) col.push(X[i * d + j]);
		colStd[j] = Math.max(std(col), .001);
	}
	for (let c = 0; c < k; c++) for (let j = 0; j < d; j++) vars[c][j] = colStd[j] * colStd[j];
	const weights = new Float64Array(k).fill(1 / k);
	const resp = Array.from({ length: n }, () => new Float64Array(k));
	let ll = -Infinity;
	for (let iter = 0; iter < 40; iter++) {
		let totalLl = 0;
		for (let i = 0; i < n; i++) {
			const logp = new Array(k);
			for (let c = 0; c < k; c++) logp[c] = Math.log(Math.max(weights[c], 1e-12)) + gmmLogPdf(i, X, d, means[c], vars[c]);
			const lse = logSumExp(logp);
			totalLl += lse;
			for (let c = 0; c < k; c++) resp[i][c] = Math.exp(logp[c] - lse);
		}
		ll = totalLl;
		const nk = new Float64Array(k);
		for (let i = 0; i < n; i++) for (let c = 0; c < k; c++) nk[c] += resp[i][c];
		const newMeans = Array.from({ length: k }, () => new Float64Array(d));
		const newVars = Array.from({ length: k }, () => new Float64Array(d));
		for (let i = 0; i < n; i++) {
			const row = i * d;
			for (let c = 0; c < k; c++) {
				const r = resp[i][c];
				for (let j = 0; j < d; j++) newMeans[c][j] += r * X[row + j];
			}
		}
		for (let c = 0; c < k; c++) {
			const den = Math.max(nk[c], 1e-8);
			for (let j = 0; j < d; j++) newMeans[c][j] /= den;
			weights[c] = nk[c] / n;
		}
		for (let i = 0; i < n; i++) {
			const row = i * d;
			for (let c = 0; c < k; c++) {
				const r = resp[i][c];
				for (let j = 0; j < d; j++) {
					const z = X[row + j] - newMeans[c][j];
					newVars[c][j] += r * z * z;
				}
			}
		}
		for (let c = 0; c < k; c++) {
			const den = Math.max(nk[c], 1e-8);
			for (let j = 0; j < d; j++) newVars[c][j] = Math.max(newVars[c][j] / den, 1e-6);
		}
		means = newMeans;
		for (let c = 0; c < k; c++) vars[c] = newVars[c];
	}
	const nParams = k - 1 + 2 * k * d;
	const bic = -2 * ll + nParams * Math.log(n);
	return {
		k,
		weights,
		means,
		vars,
		bic,
		ll
	};
}
function fitGmm(feat, nB = 900) {
	const { X, n, d } = feat;
	const byK = [];
	for (const k of [2, 3]) {
		let local = null;
		for (let init = 0; init < 3; init++) {
			const model = fitOneGmm(X, nB, d, k, new Rng(42 + k * 17 + init * 101));
			if (!local || model.ll > local.ll) local = model;
		}
		if (local) byK.push(local);
	}
	byK.sort((a, b) => a.bic - b.bic);
	const chosen = byK[0];
	const score = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		const logp = new Array(chosen.k);
		for (let c = 0; c < chosen.k; c++) logp[c] = Math.log(Math.max(chosen.weights[c], 1e-12)) + gmmLogPdf(i, X, d, chosen.means[c], chosen.vars[c]);
		score[i] = -logSumExp(logp);
	}
	return {
		score,
		bestK: chosen.k,
		bic: chosen.bic
	};
}
function fitOmr(feat, nB = 900) {
	const { X, n, d } = feat;
	const stdResid = Array.from({ length: d }, () => new Float64Array(n));
	for (let col = 0; col < d; col++) {
		const yB = new Float64Array(nB);
		for (let i = 0; i < nB; i++) yB[i] = X[i * d + col];
		const model = ridgeFit(X, yB, nB, d, 1, col);
		const residB = new Float64Array(nB);
		for (let i = 0; i < nB; i++) residB[i] = X[i * d + col] - ridgePredict(X, i, d, model);
		const sd = Math.max(std(residB), 1e-8);
		for (let i = 0; i < n; i++) {
			const pred = ridgePredict(X, i, d, model);
			stdResid[col][i] = (X[i * d + col] - pred) / sd;
		}
	}
	const score = new Float64Array(n);
	const tmp = new Float64Array(d);
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < d; j++) tmp[j] = Math.abs(stdResid[j][i]);
		tmp.sort();
		const a = tmp[d - 1];
		const b = tmp[d - 2];
		const c = tmp[d - 3];
		score[i] = (a + b + c) / 3;
	}
	return score;
}
function pcaEllipse(pca, nPoints = 80) {
	const chi = 9.21034037197618;
	const rx = Math.sqrt(chi * Math.max(pca.values[0], 1e-12));
	const ry = Math.sqrt(chi * Math.max(pca.values[1], 1e-12));
	const pts = [];
	for (let i = 0; i <= nPoints; i++) {
		const t = 2 * Math.PI * i / nPoints;
		pts.push({
			x: rx * Math.cos(t),
			y: ry * Math.sin(t)
		});
	}
	return pts;
}
var CORR = [
	[
		1,
		.72,
		.45,
		.38,
		.22,
		.18,
		.48,
		.3,
		.2
	],
	[
		.72,
		1,
		.28,
		.25,
		.2,
		.16,
		.58,
		.35,
		.22
	],
	[
		.45,
		.28,
		1,
		.82,
		.15,
		.12,
		.32,
		.25,
		.18
	],
	[
		.38,
		.25,
		.82,
		1,
		.14,
		.11,
		.28,
		.22,
		.16
	],
	[
		.22,
		.2,
		.15,
		.14,
		1,
		.78,
		.25,
		.4,
		.62
	],
	[
		.18,
		.16,
		.12,
		.11,
		.78,
		1,
		.22,
		.38,
		.58
	],
	[
		.48,
		.58,
		.32,
		.28,
		.25,
		.22,
		1,
		.65,
		.3
	],
	[
		.3,
		.35,
		.25,
		.22,
		.4,
		.38,
		.65,
		1,
		.45
	],
	[
		.2,
		.22,
		.18,
		.16,
		.62,
		.58,
		.3,
		.45,
		1
	]
];
function pad2(n) {
	return n < 10 ? `0${n}` : String(n);
}
function timestampAt(i) {
	const minutes = i * 10;
	const d = new Date(Date.UTC(2024, 0, 1, 0, minutes));
	return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}
function covariance() {
	const d = SENSOR_KEYS.length;
	const stds = SENSOR_KEYS.map((k) => SENSOR_STDS[k]);
	const S = Array.from({ length: d }, () => Array(d).fill(0));
	for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) S[i][j] = CORR[i][j] * stds[i] * stds[j];
	return S;
}
function generateSensorData(seed = 42) {
	const rng = new Rng(seed);
	const d = SENSOR_KEYS.length;
	const L = cholesky(covariance());
	const values = {};
	for (const k of SENSOR_KEYS) values[k] = new Float64Array(N_ROWS);
	const fault = new Uint8Array(N_ROWS);
	const timestamps = new Array(N_ROWS);
	const means = SENSOR_KEYS.map((k) => SENSOR_MEANS[k]);
	const stds = SENSOR_KEYS.map((k) => SENSOR_STDS[k]);
	const noiseScale = stds.map((s) => s / 10);
	for (let t = 0; t < N_ROWS; t++) {
		timestamps[t] = timestampAt(t);
		const z = new Array(d);
		for (let i = 0; i < d; i++) z[i] = rng.normal();
		const x = new Array(d).fill(0);
		for (let i = 0; i < d; i++) {
			let s = 0;
			for (let j = 0; j <= i; j++) s += L[i][j] * z[j];
			x[i] = means[i] + s;
		}
		if (t >= 1500) {
			fault[t] = 1;
			const step = t - FAULT_START;
			const frac = step / Math.max(N_ROWS - FAULT_START - 1, 1);
			x[0] += .04 * stds[0] * step;
			x[2] += .04 * stds[2] * step;
			x[5] -= .3 * frac;
			for (let i = 0; i < d; i++) {
				x[i] += rng.normal(0, .35 * stds[i]);
				if (i !== 0 && i !== 2 && i !== 5) x[i] += .002 * stds[i] * step;
			}
		}
		for (let i = 0; i < d; i++) {
			x[i] += rng.normal(0, noiseScale[i]);
			values[SENSOR_KEYS[i]][t] = x[i];
		}
	}
	return {
		n: N_ROWS,
		timestamps,
		values,
		fault
	};
}
function sensorsToCsv(data) {
	const lines = [[
		"timestamp",
		...SENSOR_KEYS,
		"fault_injected"
	].join(",")];
	for (let i = 0; i < data.n; i++) {
		const row = [
			data.timestamps[i],
			...SENSOR_KEYS.map((k) => data.values[k][i].toFixed(6)),
			String(data.fault[i])
		];
		lines.push(row.join(","));
	}
	return lines.join("\n");
}
function slice(arr, lo, hi) {
	return arr.subarray(lo, hi);
}
function calibrateOne(raw, lo = 900, hi = HOLDOUT_END) {
	const hold = Array.from(slice(raw, lo, hi));
	let clean = hold.slice();
	const guard = Math.floor(hold.length * .7);
	let prevMed = Infinity;
	for (let it = 0; it < 10; it++) {
		const median = quantile(clean.slice().sort((a, b) => a - b), .5);
		const devs = clean.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
		const mad = Math.max(quantile(devs, .5), 1e-12);
		const next = clean.filter((v) => Math.abs(v - median) / (1.4826 * mad) <= 4);
		if (next.length < guard) break;
		if (Math.abs(median - prevMed) < .001 && it > 0) {
			clean = next.length ? next : clean;
			prevMed = median;
			break;
		}
		prevMed = median;
		if (next.length === clean.length) {
			clean = next;
			break;
		}
		clean = next;
	}
	const median = quantile(clean.slice().sort((a, b) => a - b), .5);
	const devs = clean.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
	const mad = Math.max(quantile(devs, .5), 1e-12);
	const scale = 1.4826 * mad;
	const z = new Float64Array(raw.length);
	for (let i = 0; i < raw.length; i++) z[i] = (raw[i] - median) / scale;
	return {
		z,
		threshold: quantile(clean.map((v) => (v - median) / scale), .999),
		median,
		mad
	};
}
function calibrateAll(raw) {
	const z = {};
	const thresholds = {};
	for (const id of DETECTOR_IDS) {
		const c = calibrateOne(raw[id]);
		z[id] = c.z;
		thresholds[id] = c.threshold;
	}
	return {
		z,
		thresholds
	};
}
function fuseScores(z, n) {
	const weights = { ...BASE_WEIGHTS };
	const corrPairs = [];
	for (let i = 0; i < DETECTOR_IDS.length; i++) for (let j = i + 1; j < DETECTOR_IDS.length; j++) {
		const a = DETECTOR_IDS[i];
		const b = DETECTOR_IDS[j];
		const r = pearson(z[a].subarray(900, HOLDOUT_END), z[b].subarray(900, HOLDOUT_END));
		const discounted = Math.abs(r) > .85;
		if (discounted) {
			const lo = BASE_WEIGHTS[a] <= BASE_WEIGHTS[b] ? a : b;
			weights[lo] *= .5;
		}
		corrPairs.push({
			a,
			b,
			r,
			discounted
		});
	}
	let sum = 0;
	for (const id of DETECTOR_IDS) sum += weights[id];
	for (const id of DETECTOR_IDS) weights[id] /= sum;
	const fused = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		let s = 0;
		for (const id of DETECTOR_IDS) s += weights[id] * z[id][i];
		fused[i] = s;
	}
	return {
		fused,
		weights,
		corrPairs
	};
}
function markConsecutive(flags, k) {
	const n = flags.length;
	const out = new Uint8Array(n);
	let run = 0;
	for (let i = 0; i <= n; i++) if (i < n && flags[i]) run++;
	else {
		if (run >= k) for (let j = i - run; j < i; j++) out[j] = 1;
		run = 0;
	}
	return out;
}
function applyAlarms(fused, z, fusedThreshold = 3) {
	const n = fused.length;
	const exceed = new Uint8Array(n);
	for (let i = 0; i < n; i++) if (fused[i] > fusedThreshold) exceed[i] = 1;
	const r1 = markConsecutive(exceed, 3);
	const r2 = new Uint8Array(n);
	for (let i = 0; i <= n - 15; i++) {
		let c = 0;
		for (let j = 0; j < 15; j++) if (exceed[i + j]) c++;
		if (c >= 4) for (let j = 0; j < 15; j++) r2[i + j] = 1;
	}
	const r3 = new Uint8Array(n);
	for (const id of DETECTOR_IDS) {
		const flags = new Uint8Array(n);
		for (let i = 0; i < n; i++) if (z[id][i] > 4) flags[i] = 1;
		const marked = markConsecutive(flags, 5);
		for (let i = 0; i < n; i++) if (marked[i]) r3[i] = 1;
	}
	const r4 = new Uint8Array(n);
	for (let i = 0; i <= n - 10; i++) {
		let mn = Infinity;
		let mx = -Infinity;
		for (let j = 0; j < 10; j++) {
			const v = fused[i + j];
			if (v < mn) mn = v;
			if (v > mx) mx = v;
		}
		if (mx - mn > 1.5) for (let j = 0; j < 10; j++) r4[i + j] = 1;
	}
	return {
		R1: r1,
		R2: r2,
		R3: r3,
		R4: r4
	};
}
function metrics(rule, name, alarm, y) {
	let tp = 0, fp = 0, fn = 0, tn = 0;
	for (let i = 0; i < alarm.length; i++) {
		const a = alarm[i] === 1;
		const p = y[i] >= 1;
		if (a && p) tp++;
		else if (a && !p) fp++;
		else if (!a && p) fn++;
		else tn++;
	}
	const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
	const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
	const f1 = precision + recall === 0 ? 0 : 2 * precision * recall / (precision + recall);
	return {
		rule,
		name,
		tp,
		fp,
		fn,
		tn,
		precision,
		recall,
		f1
	};
}
function evaluateAlarms(alarms, y) {
	return [
		metrics("R1", "Sustained (3 consecutive)", alarms.R1, y),
		metrics("R2", "Repeated (4 of 15)", alarms.R2, y),
		metrics("R3", "Per-detector (z>4 × 5)", alarms.R3, y),
		metrics("R4", "Rapid rise (Δ>1.5 / 10)", alarms.R4, y)
	];
}
function firstTruePositive(anyAlarm, faultOnsetFeat, offset, timestamps) {
	for (let i = faultOnsetFeat; i < anyAlarm.length; i++) if (anyAlarm[i]) {
		const rawRow = i + offset;
		return {
			featRow: i,
			rawRow,
			timestamp: timestamps[rawRow] ?? "",
			latencyRows: rawRow - FAULT_START,
			latencyHours: (rawRow - FAULT_START) * 10 / 60
		};
	}
	return null;
}
function detectorReports(z, y, faultOnsetFeat) {
	const n = y.length;
	const out = [];
	for (const id of DETECTOR_IDS) {
		let sh = 0, nh = 0, sf = 0, nf = 0;
		for (let i = 0; i < n; i++) if (i < faultOnsetFeat) {
			sh += z[id][i];
			nh++;
		} else {
			sf += z[id][i];
			nf++;
		}
		const meanHealthy = nh ? sh / nh : 0;
		const meanFault = nf ? sf / nf : 0;
		const separation = Math.abs(meanHealthy) < 1e-9 ? meanFault : meanFault / Math.max(Math.abs(meanHealthy), 1e-6);
		out.push({
			detector: id,
			label: DETECTOR_LABELS[id],
			meanHealthy,
			meanFault,
			separation,
			auc: rocAuc(y, z[id])
		});
	}
	return out;
}
function toArr(a) {
	return Array.from(a);
}
function tick() {
	return new Promise((r) => setTimeout(r, 0));
}
async function runPipeline(onProgress) {
	const p = (step, pct) => onProgress?.(step, pct);
	p("Sampling correlated industrial sensors", 6);
	await tick();
	const sensors = generateSensorData(42);
	p("Rolling 10-hour feature window (mean, MAD, slope, kurtosis)", 16);
	await tick();
	const feat = buildFeatures(sensors);
	standardizeBaseline(feat, 900);
	const { n, offset } = feat;
	const faultOnsetFeat = FAULT_START - offset;
	const faultFeat = new Array(n);
	for (let i = 0; i < n; i++) faultFeat[i] = sensors.fault[i + offset];
	const timestampsFeat = sensors.timestamps.slice(offset);
	p("Detector A · AR(1) lag-1 residual", 28);
	await tick();
	const ar1 = fitAr1(feat);
	p("Detectors B/C · PCA SPE and Hotelling T²", 40);
	await tick();
	const pca = fitPca(feat);
	const pcaScores = scorePca(feat, pca);
	p("Detector D · Isolation Forest (100 trees)", 54);
	await tick();
	const iso = fitIForest(feat);
	p("Detector E · Gaussian mixture (k = 2, 3 · BIC)", 68);
	await tick();
	const gmm = fitGmm(feat);
	p("Detector F · Overall model residual (ridge, top-3)", 82);
	await tick();
	const omr = fitOmr(feat);
	const raw = {
		AR1: ar1.score,
		"PCA-SPE": pcaScores.spe,
		"PCA-T2": pcaScores.t2,
		IForest: iso.score,
		GMM: gmm.score,
		OMR: omr
	};
	p("MAD/median calibration · weighted fusion · alarm rules", 92);
	await tick();
	const calib = calibrateAll(raw);
	const fusedPack = fuseScores(calib.z, n);
	const alarms = applyAlarms(fusedPack.fused, calib.z);
	const anyAlarm = new Uint8Array(n);
	for (let i = 0; i < n; i++) if (alarms.R1[i] || alarms.R2[i] || alarms.R3[i] || alarms.R4[i]) anyAlarm[i] = 1;
	const alarmMetrics = evaluateAlarms(alarms, faultFeat);
	const firstAlarm = firstTruePositive(anyAlarm, faultOnsetFeat, offset, sensors.timestamps);
	const detectorTable = detectorReports(calib.z, faultFeat, faultOnsetFeat);
	const fusedAuc = rocAuc(faultFeat, fusedPack.fused);
	const bestDetector = detectorTable.reduce((a, b) => b.auc > a.auc ? b : a, detectorTable[0]);
	const pcaScatter = [];
	const stride = Math.max(1, Math.floor(n / 700));
	for (let i = 0; i < n; i += stride) pcaScatter.push({
		pc1: pcaScores.scores2[i * 2],
		pc2: pcaScores.scores2[i * 2 + 1],
		fault: faultFeat[i] === 1
	});
	const zScores = {};
	const rawScores = {};
	const thresholds = {};
	for (const id of DETECTOR_IDS) {
		zScores[id] = toArr(calib.z[id]);
		rawScores[id] = toArr(raw[id]);
		thresholds[id] = calib.thresholds[id];
	}
	p("Pipeline ready", 100);
	return {
		sensors,
		features: {
			n,
			d: feat.d,
			offset,
			names: feat.names,
			rollingMean: {
				temp_bearing: toArr(feat.rollingMean.temp_bearing),
				vibration_x: toArr(feat.rollingMean.vibration_x)
			}
		},
		faultOnsetFeat,
		rawScores,
		zScores,
		thresholds,
		fused: toArr(fusedPack.fused),
		fusedThreshold: 3,
		weights: fusedPack.weights,
		weightBase: { ...BASE_WEIGHTS },
		corrPairs: fusedPack.corrPairs,
		gmmBestK: gmm.bestK,
		gmmBic: gmm.bic,
		pca: {
			varExplained: pca.varExplained,
			scores: pcaScatter,
			ellipse: pcaEllipse(pca)
		},
		iforestDepth: toArr(iso.depths),
		alarms: {
			R1: Array.from(alarms.R1),
			R2: Array.from(alarms.R2),
			R3: Array.from(alarms.R3),
			R4: Array.from(alarms.R4)
		},
		anyAlarm: Array.from(anyAlarm),
		alarmMetrics,
		firstAlarm,
		detectorTable,
		fusedAuc,
		bestDetector: {
			detector: bestDetector.detector,
			auc: bestDetector.auc
		},
		timestampsFeat,
		faultFeat
	};
}
var started = false;
var useAcm = create((set) => ({
	status: "idle",
	step: "Standby",
	pct: 0,
	error: null,
	result: null,
	playIndex: 0,
	playing: false,
	speed: 8,
	setPlayIndex: (i) => set({ playIndex: i }),
	setPlaying: (v) => set({ playing: v }),
	setSpeed: (v) => set({ speed: v }),
	ensure: () => {
		if (started) return;
		started = true;
		set({
			status: "running",
			step: "Initializing historian",
			pct: 2
		});
		runPipeline((step, pct) => set({
			step,
			pct
		})).then((result) => {
			set({
				status: "ready",
				result,
				playIndex: Math.max(0, result.faultOnsetFeat - 40),
				pct: 100,
				step: "Pipeline ready"
			});
		}).catch((err) => {
			started = false;
			set({
				status: "error",
				error: err instanceof Error ? err.message : String(err)
			});
		});
	}
}));
//#endregion
export { useAcm as _, FAULT_START as a, SENSOR_LABELS as c, downsampleIndices as d, formatNumber as f, sensorsToCsv as g, quantile as h, DETECTOR_LABELS as i, SENSOR_UNITS as l, pearson as m, DETECTOR_COLORS as n, PLOT1_KEYS as o, kde as p, DETECTOR_IDS as r, SENSOR_KEYS as s, ASSET as t, cn as u };
