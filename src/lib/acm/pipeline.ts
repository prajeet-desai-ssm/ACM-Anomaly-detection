import { BASELINE_END, BASE_WEIGHTS, DETECTOR_IDS, FAULT_START, FUSED_THRESHOLD, RANDOM_STATE, type DetectorId } from "./constants";
import { buildFeatures, standardizeBaseline } from "./features";
import {
  fitAr1,
  fitGmm,
  fitIForest,
  fitOmr,
  fitPca,
  pcaEllipse,
  scorePca,
} from "./detectors";
import { generateSensorData } from "./generate";
import { rocAuc } from "./math";
import {
  applyAlarms,
  calibrateAll,
  detectorReports,
  evaluateAlarms,
  firstTruePositive,
  fuseScores,
} from "./postprocess";
import type { DetectorScores, PipelineResult, ProgressCb } from "./types";

function toArr(a: Float64Array): number[] {
  return Array.from(a);
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

export async function runPipeline(onProgress?: ProgressCb): Promise<PipelineResult> {
  const p = (step: string, pct: number) => onProgress?.(step, pct);

  p("Sampling correlated industrial sensors", 6);
  await tick();
  const sensors = generateSensorData(RANDOM_STATE);

  p("Rolling 10-hour feature window (mean, MAD, slope, kurtosis)", 16);
  await tick();
  const feat = buildFeatures(sensors);
  standardizeBaseline(feat, BASELINE_END);
  const { n, offset } = feat;
  const faultOnsetFeat = FAULT_START - offset;
  const faultFeat = new Array<number>(n);
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

  const raw: DetectorScores = {
    AR1: ar1.score,
    "PCA-SPE": pcaScores.spe,
    "PCA-T2": pcaScores.t2,
    IForest: iso.score,
    GMM: gmm.score,
    OMR: omr,
  };

  p("MAD/median calibration · weighted fusion · alarm rules", 92);
  await tick();
  const calib = calibrateAll(raw);
  const fusedPack = fuseScores(calib.z, n);
  const alarms = applyAlarms(fusedPack.fused, calib.z);
  const anyAlarm = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (alarms.R1[i] || alarms.R2[i] || alarms.R3[i] || alarms.R4[i]) anyAlarm[i] = 1;
  }
  const alarmMetrics = evaluateAlarms(alarms, faultFeat);
  const firstAlarm = firstTruePositive(anyAlarm, faultOnsetFeat, offset, sensors.timestamps);
  const detectorTable = detectorReports(calib.z, faultFeat, faultOnsetFeat);
  const fusedAuc = rocAuc(faultFeat, fusedPack.fused);
  const bestDetector = detectorTable.reduce(
    (a, b) => (b.auc > a.auc ? b : a),
    detectorTable[0],
  );

  const pcaScatter: PipelineResult["pca"]["scores"] = [];
  const stride = Math.max(1, Math.floor(n / 700));
  for (let i = 0; i < n; i += stride) {
    pcaScatter.push({
      pc1: pcaScores.scores2[i * 2],
      pc2: pcaScores.scores2[i * 2 + 1],
      fault: faultFeat[i] === 1,
    });
  }

  const zScores = {} as Record<DetectorId, number[]>;
  const rawScores = {} as Record<DetectorId, number[]>;
  const thresholds = {} as Record<DetectorId, number>;
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
        vibration_x: toArr(feat.rollingMean.vibration_x),
      },
    },
    faultOnsetFeat,
    rawScores,
    zScores,
    thresholds,
    fused: toArr(fusedPack.fused),
    fusedThreshold: FUSED_THRESHOLD,
    weights: fusedPack.weights,
    weightBase: { ...BASE_WEIGHTS },
    corrPairs: fusedPack.corrPairs,
    gmmBestK: gmm.bestK,
    gmmBic: gmm.bic,
    pca: {
      varExplained: pca.varExplained,
      scores: pcaScatter,
      ellipse: pcaEllipse(pca),
    },
    iforestDepth: toArr(iso.depths),
    alarms: {
      R1: Array.from(alarms.R1),
      R2: Array.from(alarms.R2),
      R3: Array.from(alarms.R3),
      R4: Array.from(alarms.R4),
    },
    anyAlarm: Array.from(anyAlarm),
    alarmMetrics,
    firstAlarm,
    detectorTable,
    fusedAuc,
    bestDetector: { detector: bestDetector.detector, auc: bestDetector.auc },
    timestampsFeat,
    faultFeat,
  };
}
