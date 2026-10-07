export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  uniform(a = 0, b = 1): number {
    return a + (b - a) * this.next();
  }
  int(n: number): number {
    return Math.floor(this.next() * n);
  }
  normal(mu = 0, sigma = 1): number {
    let u = 0;
    while (u === 0) u = this.next();
    const v = this.next();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}

export function cholesky(A: number[][]): number[][] {
  const n = A.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0) as number[]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      if (i === j) {
        const v = A[i][i] - sum;
        L[i][j] = Math.sqrt(Math.max(v, 1e-12));
      } else {
        L[i][j] = (A[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}

export function mean(a: ArrayLike<number>, lo = 0, hi = a.length): number {
  const n = hi - lo;
  if (n <= 0) return 0;
  let s = 0;
  for (let i = lo; i < hi; i++) s += a[i];
  return s / n;
}

export function variance(a: ArrayLike<number>, lo = 0, hi = a.length): number {
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

export function std(a: ArrayLike<number>, lo = 0, hi = a.length): number {
  return Math.sqrt(variance(a, lo, hi));
}

export function quantileSorted(sorted: ArrayLike<number>, q: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const pos = (n - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - pos) + sorted[hi] * (pos - lo);
}

export function quantile(a: ArrayLike<number>, q: number): number {
  const n = a.length;
  const copy = new Float64Array(n);
  for (let i = 0; i < n; i++) copy[i] = a[i];
  copy.sort();
  return quantileSorted(copy, q);
}

export function medianRange(a: ArrayLike<number>, lo: number, hi: number): number {
  const n = hi - lo;
  if (n <= 0) return 0;
  const tmp = new Float64Array(n);
  for (let i = 0; i < n; i++) tmp[i] = a[lo + i];
  tmp.sort();
  if (n % 2 === 1) return tmp[(n - 1) >> 1];
  return 0.5 * (tmp[n / 2 - 1] + tmp[n / 2]);
}

export function madRange(a: ArrayLike<number>, lo: number, hi: number, med: number): number {
  const n = hi - lo;
  const tmp = new Float64Array(n);
  for (let i = 0; i < n; i++) tmp[i] = Math.abs(a[lo + i] - med);
  tmp.sort();
  if (n % 2 === 1) return tmp[(n - 1) >> 1];
  return 0.5 * (tmp[n / 2 - 1] + tmp[n / 2]);
}

export function slopeRange(a: ArrayLike<number>, lo: number, hi: number): number {
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

export function skewKurtRange(a: ArrayLike<number>, lo: number, hi: number): {
  skew: number;
  kurtosis: number;
} {
  const n = hi - lo;
  if (n < 4) return { skew: 0, kurtosis: 0 };
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
  if (m2 < 1e-18) return { skew: 0, kurtosis: 0 };
  const s = Math.sqrt(m2);
  return { skew: m3 / (s * s * s), kurtosis: m4 / (m2 * m2) - 3 };
}

export function dot(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function hypot(a: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

export function norm(a: ArrayLike<number>): number {
  return hypot(a);
}

export function matVec(A: number[][], v: ArrayLike<number>): number[] {
  const n = A.length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    const row = A[i];
    for (let j = 0; j < row.length; j++) s += row[j] * v[j];
    out[i] = s;
  }
  return out;
}

export function solveLinear(Ain: number[][], bin: number[]): number[] {
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
    if (best < 1e-14) {
      A[k][k] = 1e-14;
    } else if (piv !== k) {
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
  const x = new Array<number>(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

export function ridgeFit(
  X: Float64Array,
  y: ArrayLike<number>,
  n: number,
  d: number,
  alpha: number,
  skipCol: number,
): { intercept: number; coef: Float64Array; cols: number[] } {
  const cols: number[] = [];
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

  const XtX = Array.from({ length: p }, () => Array(p).fill(0) as number[]);
  const Xty = new Array<number>(p).fill(0);
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
  return { intercept, coef, cols };
}

export function ridgePredict(
  X: Float64Array,
  row: number,
  d: number,
  model: { intercept: number; coef: Float64Array; cols: number[] },
): number {
  let y = model.intercept;
  const base = row * d;
  for (let k = 0; k < model.cols.length; k++) {
    y += model.coef[k] * X[base + model.cols[k]];
  }
  return y;
}

export function topKEigen(
  C: number[][],
  k: number,
  rng: Rng,
): { values: number[]; vectors: number[][] } {
  const n = C.length;
  const values: number[] = [];
  const vectors: number[][] = [];
  for (let comp = 0; comp < k; comp++) {
    const v = new Array<number>(n);
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
  return { values, vectors };
}

export function pearson(a: ArrayLike<number>, b: ArrayLike<number>): number {
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

export function rocAuc(y: ArrayLike<number>, s: ArrayLike<number>): number {
  const n = y.length;
  const pairs = new Array<{ y: number; s: number }>(n);
  let npos = 0;
  let nneg = 0;
  for (let i = 0; i < n; i++) {
    pairs[i] = { y: y[i], s: s[i] };
    if (y[i] >= 1) npos++;
    else nneg++;
  }
  if (npos === 0 || nneg === 0) return 0.5;
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
  const U = rankSum - (npos * (npos + 1)) / 2;
  return U / (npos * nneg);
}

export function logSumExp(a: number[]): number {
  let m = -Infinity;
  for (const v of a) if (v > m) m = v;
  let s = 0;
  for (const v of a) s += Math.exp(v - m);
  return m + Math.log(s);
}

export function sampleWithoutReplacement(rng: Rng, n: number, k: number): Int32Array {
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

export function kde(values: number[], grid: number[]): number[] {
  const n = values.length;
  if (n === 0) return grid.map(() => 0);
  const s = std(values) || 1;
  const h = 1.06 * s * Math.pow(n, -0.2);
  const inv = 1 / (h * Math.sqrt(2 * Math.PI));
  return grid.map((x) => {
    let d = 0;
    for (let i = 0; i < n; i++) {
      const z = (x - values[i]) / h;
      d += Math.exp(-0.5 * z * z);
    }
    return (d * inv) / n;
  });
}

export function downsampleIndices(n: number, maxPoints: number): number[] {
  if (n <= maxPoints) return Array.from({ length: n }, (_, i) => i);
  const out: number[] = [];
  const step = (n - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) out.push(Math.round(i * step));
  return out;
}
