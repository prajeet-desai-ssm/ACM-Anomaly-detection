import { BASELINE_END, IFOREST_SEED, RANDOM_STATE } from "./constants";
import { colVariance } from "./features";
import {
  logSumExp,
  Rng,
  ridgeFit,
  ridgePredict,
  sampleWithoutReplacement,
  std,
  topKEigen,
} from "./math";
import type { FeatureMatrix } from "./types";

export type PcaModel = {
  mean: Float64Array;
  values: number[];
  vectors: number[][];
  varExplained: number[];
};

type IsoNode =
  | { leaf: true; size: number }
  | { leaf: false; feat: number; thr: number; left: IsoNode; right: IsoNode };

type IsoTree = { root: IsoNode; maxDepth: number };

function harmonic(n: number): number {
  return n <= 0 ? 0 : Math.log(n) + 0.5772156649;
}

function cFactor(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * harmonic(n - 1) - (2 * (n - 1)) / n;
}

export function fitAr1(
  feat: FeatureMatrix,
  nB = BASELINE_END,
): { score: Float64Array; cols: number[] } {
  const { X, n, d } = feat;
  const vars = new Array<number>(d);
  for (let j = 0; j < d; j++) vars[j] = colVariance(X, n, d, j, nB);
  const cols = vars
    .map((v, j) => ({ v, j }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5)
    .map((x) => x.j);

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
    const c = my - phi * mx;
    return { phi, c };
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
  return { score, cols };
}

export function fitPca(feat: FeatureMatrix, nB = BASELINE_END, k = 5): PcaModel {
  const { X, d } = feat;
  const mean = new Float64Array(d);
  for (let i = 0; i < nB; i++) {
    const row = i * d;
    for (let j = 0; j < d; j++) mean[j] += X[row + j];
  }
  for (let j = 0; j < d; j++) mean[j] /= nB;

  const C = Array.from({ length: d }, () => Array(d).fill(0) as number[]);
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
    for (let b = 0; b < a; b++) {
      C[a][b] = C[b][a] = C[b][a] / denom;
    }
  }
  const rng = new Rng(RANDOM_STATE);
  const { values, vectors } = topKEigen(C, k, rng);
  const varExplained = values.map((v) => (trace > 0 ? v / trace : 0));
  return { mean, values, vectors, varExplained };
}

export function scorePca(feat: FeatureMatrix, pca: PcaModel): { spe: Float64Array; t2: Float64Array; scores2: Float64Array } {
  const { X, n, d } = feat;
  const k = pca.vectors.length;
  const spe = new Float64Array(n);
  const t2 = new Float64Array(n);
  const scores2 = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) {
    const row = i * d;
    const z = new Float64Array(d);
    for (let j = 0; j < d; j++) z[j] = X[row + j] - pca.mean[j];
    const sc = new Array<number>(k);
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
      t += (sc[c] * sc[c]) / lam;
    }
    t2[i] = t;
    scores2[i * 2] = sc[0] ?? 0;
    scores2[i * 2 + 1] = sc[1] ?? 0;
  }
  return { spe, t2, scores2 };
}

function buildIsoTree(
  X: Float64Array,
  idx: Int32Array,
  n: number,
  d: number,
  depth: number,
  maxDepth: number,
  rng: Rng,
): IsoNode {
  if (n <= 1 || depth >= maxDepth) return { leaf: true, size: n };
  const feat = rng.int(d);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < n; i++) {
    const v = X[idx[i] * d + feat];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!(max > min)) return { leaf: true, size: n };
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
  if (nl === 0 || nr === 0) return { leaf: true, size: n };
  return {
    leaf: false,
    feat,
    thr,
    left: buildIsoTree(X, leftIdx.subarray(0, nl), nl, d, depth + 1, maxDepth, rng),
    right: buildIsoTree(X, rightIdx.subarray(0, nr), nr, d, depth + 1, maxDepth, rng),
  };
}

function pathLength(node: IsoNode, xRow: number, X: Float64Array, d: number, depth: number): number {
  if (node.leaf) return depth + cFactor(node.size);
  if (X[xRow * d + node.feat] < node.thr) return pathLength(node.left, xRow, X, d, depth + 1);
  return pathLength(node.right, xRow, X, d, depth + 1);
}

export function fitIForest(
  feat: FeatureMatrix,
  nB = BASELINE_END,
  nEstimators = 100,
  maxSamples = 2048,
  seed = IFOREST_SEED,
): { score: Float64Array; depths: Float64Array } {
  const { X, n, d } = feat;
  const rng = new Rng(seed);
  const sampleSize = Math.min(maxSamples, nB);
  const maxDepth = Math.ceil(Math.log2(Math.max(sampleSize, 2)));
  const trees: IsoTree[] = [];
  for (let t = 0; t < nEstimators; t++) {
    const idx = sampleWithoutReplacement(rng, nB, sampleSize);
    trees.push({
      root: buildIsoTree(X, idx, sampleSize, d, 0, maxDepth, rng),
      maxDepth,
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
  return { score, depths };
}

type Gmm = {
  k: number;
  weights: Float64Array;
  means: Float64Array[];
  vars: Float64Array[];
  bic: number;
  ll: number;
};

function gmmLogPdf(xRow: number, X: Float64Array, d: number, mean: Float64Array, v: Float64Array): number {
  let q = 0;
  let logDet = 0;
  for (let j = 0; j < d; j++) {
    const vv = Math.max(v[j], 1e-6);
    const z = X[xRow * d + j] - mean[j];
    q += (z * z) / vv;
    logDet += Math.log(vv);
  }
  return -0.5 * (d * Math.log(2 * Math.PI) + logDet + q);
}

function kmeansPlusPlus(
  X: Float64Array,
  n: number,
  d: number,
  k: number,
  rng: Rng,
): Float64Array[] {
  const means: Float64Array[] = [];
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

function fitOneGmm(X: Float64Array, n: number, d: number, k: number, rng: Rng): Gmm {
  let means = kmeansPlusPlus(X, n, d, k, rng);
  const vars = Array.from({ length: k }, () => new Float64Array(d));
  const colStd = new Float64Array(d);
  for (let j = 0; j < d; j++) {
    const col: number[] = [];
    for (let i = 0; i < n; i++) col.push(X[i * d + j]);
    colStd[j] = Math.max(std(col), 1e-3);
  }
  for (let c = 0; c < k; c++) {
    for (let j = 0; j < d; j++) vars[c][j] = colStd[j] * colStd[j];
  }
  const weights = new Float64Array(k).fill(1 / k);
  const resp = Array.from({ length: n }, () => new Float64Array(k));
  let ll = -Infinity;

  for (let iter = 0; iter < 40; iter++) {
    let totalLl = 0;
    for (let i = 0; i < n; i++) {
      const logp = new Array<number>(k);
      for (let c = 0; c < k; c++) {
        logp[c] = Math.log(Math.max(weights[c], 1e-12)) + gmmLogPdf(i, X, d, means[c], vars[c]);
      }
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
  return { k, weights, means, vars, bic, ll };
}

export function fitGmm(
  feat: FeatureMatrix,
  nB = BASELINE_END,
): { score: Float64Array; bestK: number; bic: number } {
  const { X, n, d } = feat;
  const byK: Gmm[] = [];
  for (const k of [2, 3]) {
    let local: Gmm | null = null;
    for (let init = 0; init < 3; init++) {
      const rng = new Rng(RANDOM_STATE + k * 17 + init * 101);
      const model = fitOneGmm(X, nB, d, k, rng);
      if (!local || model.ll > local.ll) local = model;
    }
    if (local) byK.push(local);
  }
  byK.sort((a, b) => a.bic - b.bic);
  const chosen = byK[0];

  const score = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const logp = new Array<number>(chosen.k);
    for (let c = 0; c < chosen.k; c++) {
      logp[c] =
        Math.log(Math.max(chosen.weights[c], 1e-12)) +
        gmmLogPdf(i, X, d, chosen.means[c], chosen.vars[c]);
    }
    score[i] = -logSumExp(logp);
  }
  return { score, bestK: chosen.k, bic: chosen.bic };
}

export function fitOmr(feat: FeatureMatrix, nB = BASELINE_END): Float64Array {
  const { X, n, d } = feat;
  const stdResid = Array.from({ length: d }, () => new Float64Array(n));
  for (let col = 0; col < d; col++) {
    const yB = new Float64Array(nB);
    for (let i = 0; i < nB; i++) yB[i] = X[i * d + col];
    const model = ridgeFit(X, yB, nB, d, 1.0, col);
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

export function pcaEllipse(
  pca: PcaModel,
  nPoints = 80,
): Array<{ x: number; y: number }> {
  const chi = 9.21034037197618;
  const rx = Math.sqrt(chi * Math.max(pca.values[0], 1e-12));
  const ry = Math.sqrt(chi * Math.max(pca.values[1], 1e-12));
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= nPoints; i++) {
    const t = (2 * Math.PI * i) / nPoints;
    pts.push({ x: rx * Math.cos(t), y: ry * Math.sin(t) });
  }
  return pts;
}
