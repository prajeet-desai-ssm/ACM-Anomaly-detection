import {
  BASE_WEIGHTS,
  BASELINE_END,
  DETECTOR_IDS,
  DETECTOR_LABELS,
  FAULT_START,
  FUSED_THRESHOLD,
  HOLDOUT_END,
  HOLDOUT_START,
  SAMPLE_MINUTES,
  type DetectorId,
} from "./constants";
import { pearson, quantile, rocAuc } from "./math";
import type { DetectorReport, DetectorScores, RuleId, RuleMetrics } from "./types";

export type Calib = {
  z: DetectorScores;
  thresholds: Record<DetectorId, number>;
};

function slice(arr: Float64Array, lo: number, hi: number): Float64Array {
  return arr.subarray(lo, hi);
}

function calibrateOne(raw: Float64Array, lo = HOLDOUT_START, hi = HOLDOUT_END): {
  z: Float64Array;
  threshold: number;
  median: number;
  mad: number;
} {
  const hold = Array.from(slice(raw, lo, hi));
  let clean = hold.slice();
  const guard = Math.floor(hold.length * 0.7);
  let prevMed = Infinity;
  for (let it = 0; it < 10; it++) {
    const sorted = clean.slice().sort((a, b) => a - b);
    const median = quantile(sorted, 0.5);
    const devs = clean.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = Math.max(quantile(devs, 0.5), 1e-12);
    const next = clean.filter((v) => Math.abs(v - median) / (1.4826 * mad) <= 4);
    if (next.length < guard) break;
    if (Math.abs(median - prevMed) < 0.001 && it > 0) {
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
  const sorted = clean.slice().sort((a, b) => a - b);
  const median = quantile(sorted, 0.5);
  const devs = clean.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
  const mad = Math.max(quantile(devs, 0.5), 1e-12);
  const scale = 1.4826 * mad;
  const z = new Float64Array(raw.length);
  for (let i = 0; i < raw.length; i++) z[i] = (raw[i] - median) / scale;
  const zHoldClean = clean.map((v) => (v - median) / scale);
  const threshold = quantile(zHoldClean, 0.999);
  return { z, threshold, median, mad };
}

export function calibrateAll(raw: DetectorScores): Calib {
  const z = {} as DetectorScores;
  const thresholds = {} as Record<DetectorId, number>;
  for (const id of DETECTOR_IDS) {
    const c = calibrateOne(raw[id]);
    z[id] = c.z;
    thresholds[id] = c.threshold;
  }
  return { z, thresholds };
}

export function fuseScores(z: DetectorScores, n: number): {
  fused: Float64Array;
  weights: Record<DetectorId, number>;
  corrPairs: Array<{ a: DetectorId; b: DetectorId; r: number; discounted: boolean }>;
} {
  const weights = { ...BASE_WEIGHTS };
  const corrPairs: Array<{ a: DetectorId; b: DetectorId; r: number; discounted: boolean }> = [];
  for (let i = 0; i < DETECTOR_IDS.length; i++) {
    for (let j = i + 1; j < DETECTOR_IDS.length; j++) {
      const a = DETECTOR_IDS[i];
      const b = DETECTOR_IDS[j];
      const r = pearson(
        z[a].subarray(HOLDOUT_START, HOLDOUT_END),
        z[b].subarray(HOLDOUT_START, HOLDOUT_END),
      );
      const discounted = Math.abs(r) > 0.85;
      if (discounted) {
        const lo = BASE_WEIGHTS[a] <= BASE_WEIGHTS[b] ? a : b;
        weights[lo] *= 0.5;
      }
      corrPairs.push({ a, b, r, discounted });
    }
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
  return { fused, weights, corrPairs };
}

function markConsecutive(flags: ArrayLike<number>, k: number): Uint8Array {
  const n = flags.length;
  const out = new Uint8Array(n);
  let run = 0;
  for (let i = 0; i <= n; i++) {
    if (i < n && flags[i]) {
      run++;
    } else {
      if (run >= k) {
        for (let j = i - run; j < i; j++) out[j] = 1;
      }
      run = 0;
    }
  }
  return out;
}

export function applyAlarms(
  fused: Float64Array,
  z: DetectorScores,
  fusedThreshold = FUSED_THRESHOLD,
): Record<RuleId, Uint8Array> {
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

  return { R1: r1, R2: r2, R3: r3, R4: r4 };
}

function metrics(rule: RuleId, name: string, alarm: Uint8Array, y: ArrayLike<number>): RuleMetrics {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
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
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { rule, name, tp, fp, fn, tn, precision, recall, f1 };
}

export function evaluateAlarms(
  alarms: Record<RuleId, Uint8Array>,
  y: ArrayLike<number>,
): RuleMetrics[] {
  return [
    metrics("R1", "Sustained (3 consecutive)", alarms.R1, y),
    metrics("R2", "Repeated (4 of 15)", alarms.R2, y),
    metrics("R3", "Per-detector (z>4 × 5)", alarms.R3, y),
    metrics("R4", "Rapid rise (Δ>1.5 / 10)", alarms.R4, y),
  ];
}

export function firstTruePositive(
  anyAlarm: Uint8Array,
  faultOnsetFeat: number,
  offset: number,
  timestamps: string[],
): {
  featRow: number;
  rawRow: number;
  timestamp: string;
  latencyRows: number;
  latencyHours: number;
} | null {
  for (let i = faultOnsetFeat; i < anyAlarm.length; i++) {
    if (anyAlarm[i]) {
      const rawRow = i + offset;
      return {
        featRow: i,
        rawRow,
        timestamp: timestamps[rawRow] ?? "",
        latencyRows: rawRow - FAULT_START,
        latencyHours: ((rawRow - FAULT_START) * SAMPLE_MINUTES) / 60,
      };
    }
  }
  return null;
}

export function detectorReports(
  z: DetectorScores,
  y: ArrayLike<number>,
  faultOnsetFeat: number,
): DetectorReport[] {
  const n = y.length;
  const out: DetectorReport[] = [];
  for (const id of DETECTOR_IDS) {
    let sh = 0,
      nh = 0,
      sf = 0,
      nf = 0;
    for (let i = 0; i < n; i++) {
      if (i < faultOnsetFeat) {
        sh += z[id][i];
        nh++;
      } else {
        sf += z[id][i];
        nf++;
      }
    }
    const meanHealthy = nh ? sh / nh : 0;
    const meanFault = nf ? sf / nf : 0;
    const separation =
      Math.abs(meanHealthy) < 1e-9 ? meanFault : meanFault / Math.max(Math.abs(meanHealthy), 1e-6);
    out.push({
      detector: id,
      label: DETECTOR_LABELS[id],
      meanHealthy,
      meanFault,
      separation,
      auc: rocAuc(y, z[id]),
    });
  }
  return out;
}

export { BASELINE_END };
