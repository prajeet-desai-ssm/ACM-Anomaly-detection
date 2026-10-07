import { FEATURE_STATS, SENSOR_KEYS, WINDOW } from "./constants";
import { madRange, medianRange, skewKurtRange, slopeRange, std } from "./math";
import type { FeatureMatrix, SensorTable } from "./types";

export function buildFeatures(data: SensorTable, window = WINDOW): FeatureMatrix {
  const offset = window - 1;
  const n = data.n - offset;
  const d = SENSOR_KEYS.length * FEATURE_STATS.length;
  const X = new Float64Array(n * d);
  const names: string[] = [];
  for (const s of SENSOR_KEYS) {
    for (const st of FEATURE_STATS) names.push(`${s}__${st}`);
  }

  const rollingMean = {
    temp_bearing: new Float64Array(n),
    vibration_x: new Float64Array(n),
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

  return { n, d, offset, names, X, rollingMean };
}

export function standardizeBaseline(feat: FeatureMatrix, nB: number): void {
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

export function rowOf(X: Float64Array, r: number, d: number): Float64Array {
  return X.subarray(r * d, r * d + d);
}

export function colVariance(X: Float64Array, n: number, d: number, col: number, nUse: number): number {
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
