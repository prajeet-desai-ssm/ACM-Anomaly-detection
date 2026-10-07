import {
  FAULT_START,
  N_ROWS,
  RANDOM_STATE,
  SENSOR_KEYS,
  SENSOR_MEANS,
  SENSOR_STDS,
  type SensorKey,
} from "./constants";
import { cholesky, Rng } from "./math";
import type { SensorTable } from "./types";

const CORR: number[][] = [
  [1.0, 0.72, 0.45, 0.38, 0.22, 0.18, 0.48, 0.3, 0.2],
  [0.72, 1.0, 0.28, 0.25, 0.2, 0.16, 0.58, 0.35, 0.22],
  [0.45, 0.28, 1.0, 0.82, 0.15, 0.12, 0.32, 0.25, 0.18],
  [0.38, 0.25, 0.82, 1.0, 0.14, 0.11, 0.28, 0.22, 0.16],
  [0.22, 0.2, 0.15, 0.14, 1.0, 0.78, 0.25, 0.4, 0.62],
  [0.18, 0.16, 0.12, 0.11, 0.78, 1.0, 0.22, 0.38, 0.58],
  [0.48, 0.58, 0.32, 0.28, 0.25, 0.22, 1.0, 0.65, 0.3],
  [0.3, 0.35, 0.25, 0.22, 0.4, 0.38, 0.65, 1.0, 0.45],
  [0.2, 0.22, 0.18, 0.16, 0.62, 0.58, 0.3, 0.45, 1.0],
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function timestampAt(i: number): string {
  const minutes = i * 10;
  const d = new Date(Date.UTC(2024, 0, 1, 0, minutes));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

function covariance(): number[][] {
  const d = SENSOR_KEYS.length;
  const stds = SENSOR_KEYS.map((k) => SENSOR_STDS[k]);
  const S = Array.from({ length: d }, () => Array(d).fill(0) as number[]);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      S[i][j] = CORR[i][j] * stds[i] * stds[j];
    }
  }
  return S;
}

export function generateSensorData(seed = RANDOM_STATE): SensorTable {
  const rng = new Rng(seed);
  const d = SENSOR_KEYS.length;
  const L = cholesky(covariance());
  const values = {} as Record<SensorKey, Float64Array>;
  for (const k of SENSOR_KEYS) values[k] = new Float64Array(N_ROWS);
  const fault = new Uint8Array(N_ROWS);
  const timestamps: string[] = new Array(N_ROWS);
  const means = SENSOR_KEYS.map((k) => SENSOR_MEANS[k]);
  const stds = SENSOR_KEYS.map((k) => SENSOR_STDS[k]);
  const noiseScale = stds.map((s) => s / 10);

  for (let t = 0; t < N_ROWS; t++) {
    timestamps[t] = timestampAt(t);
    const z = new Array<number>(d);
    for (let i = 0; i < d; i++) z[i] = rng.normal();
    const x = new Array<number>(d).fill(0);
    for (let i = 0; i < d; i++) {
      let s = 0;
      for (let j = 0; j <= i; j++) s += L[i][j] * z[j];
      x[i] = means[i] + s;
    }

    if (t >= FAULT_START) {
      fault[t] = 1;
      const step = t - FAULT_START;
      const frac = step / Math.max(N_ROWS - FAULT_START - 1, 1);
      x[0] += 0.04 * stds[0] * step;
      x[2] += 0.04 * stds[2] * step;
      x[5] -= 0.3 * frac;
      for (let i = 0; i < d; i++) {
        x[i] += rng.normal(0, 0.35 * stds[i]);
        if (i !== 0 && i !== 2 && i !== 5) x[i] += 0.002 * stds[i] * step;
      }
    }

    for (let i = 0; i < d; i++) {
      x[i] += rng.normal(0, noiseScale[i]);
      values[SENSOR_KEYS[i]][t] = x[i];
    }
  }

  return { n: N_ROWS, timestamps, values, fault };
}

export function sensorsToCsv(data: SensorTable): string {
  const header = ["timestamp", ...SENSOR_KEYS, "fault_injected"].join(",");
  const lines = [header];
  for (let i = 0; i < data.n; i++) {
    const row = [
      data.timestamps[i],
      ...SENSOR_KEYS.map((k) => data.values[k][i].toFixed(6)),
      String(data.fault[i]),
    ];
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

export { CORR as SENSOR_CORR };
