import { DETECTOR_IDS, SENSOR_KEYS, type DetectorId } from "./constants";
import { downsampleIndices, kde, pearson, quantile } from "./math";
import type { PipelineResult, SensorTable } from "./types";

export function corrMatrix(data: SensorTable, lo: number, hi: number): number[][] {
  const slices = SENSOR_KEYS.map((k) => data.values[k].subarray(lo, hi));
  const d = slices.length;
  const R = Array.from({ length: d }, () => Array<number>(d).fill(1));
  for (let i = 0; i < d; i++) {
    for (let j = i + 1; j < d; j++) {
      const r = pearson(slices[i], slices[j]);
      R[i][j] = R[j][i] = r;
    }
  }
  return R;
}

export function boxStats(values: number[]): {
  min: number;
  q1: number;
  med: number;
  q3: number;
  max: number;
} {
  const s = values.slice().sort((a, b) => a - b);
  return {
    min: s[0] ?? 0,
    q1: quantile(s, 0.25),
    med: quantile(s, 0.5),
    q3: quantile(s, 0.75),
    max: s[s.length - 1] ?? 0,
  };
}

export function histBins(values: number[], bins = 24): Array<{ x: number; y: number }> {
  if (!values.length) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max === min) max = min + 1;
  const w = (max - min) / bins;
  const counts = new Array<number>(bins).fill(0);
  for (const v of values) {
    let b = Math.floor((v - min) / w);
    if (b >= bins) b = bins - 1;
    if (b < 0) b = 0;
    counts[b]++;
  }
  const n = values.length;
  return counts.map((c, i) => ({ x: min + (i + 0.5) * w, y: c / n }));
}

export function radarQuarters(result: PipelineResult): Array<Record<string, number | string>> {
  const start = result.faultOnsetFeat;
  const end = result.features.n;
  const span = Math.max(end - start, 4);
  const q = Math.floor(span / 4);
  const rows: Array<Record<string, number | string>> = [];
  for (const id of DETECTOR_IDS) {
    const rec: Record<string, number | string> = { detector: id };
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

export function rollingZHeatmap(
  result: PipelineResult,
  win = 50,
): { bins: number[][]; labels: DetectorId[] } {
  const n = result.features.n;
  const nBins = Math.ceil(n / win);
  const labels = [...DETECTOR_IDS];
  const bins = labels.map((id) => {
    const row: number[] = [];
    for (let b = 0; b < nBins; b++) {
      const lo = b * win;
      const hi = Math.min(n, lo + win);
      let s = 0;
      for (let i = lo; i < hi; i++) s += result.zScores[id][i];
      row.push(s / Math.max(hi - lo, 1));
    }
    return row;
  });
  return { bins, labels };
}

export function sampledSeries(
  n: number,
  maxPoints: number,
  extras: number[] = [],
): number[] {
  const idx = downsampleIndices(n, maxPoints);
  const set = new Set(idx);
  for (const e of extras) {
    if (e >= 0 && e < n) set.add(e);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function kdeCurve(values: number[], points = 48): Array<{ x: number; y: number }> {
  if (!values.length) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const pad = (max - min) * 0.08 || 1;
  const grid: number[] = [];
  const a = min - pad;
  const b = max + pad;
  for (let i = 0; i < points; i++) grid.push(a + ((b - a) * i) / (points - 1));
  const y = kde(values, grid);
  return grid.map((x, i) => ({ x, y: y[i] }));
}
