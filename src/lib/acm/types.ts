import type { DetectorId, SensorKey } from "./constants";

export type SensorTable = {
  n: number;
  timestamps: string[];
  values: Record<SensorKey, Float64Array>;
  fault: Uint8Array;
};

export type FeatureMatrix = {
  n: number;
  d: number;
  offset: number;
  names: string[];
  X: Float64Array;
  rollingMean: Record<"temp_bearing" | "vibration_x", Float64Array>;
};

export type DetectorScores = Record<DetectorId, Float64Array>;

export type RuleId = "R1" | "R2" | "R3" | "R4";

export type RuleMetrics = {
  rule: RuleId;
  name: string;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1: number;
};

export type DetectorReport = {
  detector: DetectorId;
  label: string;
  meanHealthy: number;
  meanFault: number;
  separation: number;
  auc: number;
};

export type ProgressCb = (step: string, pct: number) => void;

export type PipelineResult = {
  sensors: SensorTable;
  features: {
    n: number;
    d: number;
    offset: number;
    names: string[];
    rollingMean: Record<"temp_bearing" | "vibration_x", number[]>;
  };
  faultOnsetFeat: number;
  rawScores: Record<DetectorId, number[]>;
  zScores: Record<DetectorId, number[]>;
  thresholds: Record<DetectorId, number>;
  fused: number[];
  fusedThreshold: number;
  weights: Record<DetectorId, number>;
  weightBase: Record<DetectorId, number>;
  corrPairs: Array<{ a: DetectorId; b: DetectorId; r: number; discounted: boolean }>;
  gmmBestK: number;
  gmmBic: number;
  pca: {
    varExplained: number[];
    scores: Array<{ pc1: number; pc2: number; fault: boolean }>;
    ellipse: Array<{ x: number; y: number }>;
  };
  iforestDepth: number[];
  alarms: Record<RuleId, number[]>;
  anyAlarm: number[];
  alarmMetrics: RuleMetrics[];
  firstAlarm: {
    featRow: number;
    rawRow: number;
    timestamp: string;
    latencyRows: number;
    latencyHours: number;
  } | null;
  detectorTable: DetectorReport[];
  fusedAuc: number;
  bestDetector: { detector: DetectorId; auc: number };
  timestampsFeat: string[];
  faultFeat: number[];
};
