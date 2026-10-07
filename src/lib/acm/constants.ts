export const N_ROWS = 2000;
export const FAULT_START = 1500;
export const WINDOW = 60;
export const BASELINE_END = 900;
export const HOLDOUT_START = 900;
export const HOLDOUT_END = 1200;
export const FUSED_THRESHOLD = 3;
export const RANDOM_STATE = 42;
export const IFOREST_SEED = 17;
export const SAMPLE_MINUTES = 10;

export const SENSOR_KEYS = [
  "temp_bearing",
  "temp_motor",
  "vibration_x",
  "vibration_y",
  "pressure_inlet",
  "pressure_outlet",
  "current_draw",
  "speed_rpm",
  "flow_rate",
] as const;

export type SensorKey = (typeof SENSOR_KEYS)[number];

export const SENSOR_LABELS: Record<SensorKey, string> = {
  temp_bearing: "Bearing temp",
  temp_motor: "Motor temp",
  vibration_x: "Vibration X",
  vibration_y: "Vibration Y",
  pressure_inlet: "Inlet pressure",
  pressure_outlet: "Outlet pressure",
  current_draw: "Current draw",
  speed_rpm: "Speed",
  flow_rate: "Flow rate",
};

export const SENSOR_UNITS: Record<SensorKey, string> = {
  temp_bearing: "°C",
  temp_motor: "°C",
  vibration_x: "g",
  vibration_y: "g",
  pressure_inlet: "bar",
  pressure_outlet: "bar",
  current_draw: "A",
  speed_rpm: "rpm",
  flow_rate: "L/min",
};

export const SENSOR_MEANS: Record<SensorKey, number> = {
  temp_bearing: 65,
  temp_motor: 72,
  vibration_x: 0.8,
  vibration_y: 0.75,
  pressure_inlet: 4.2,
  pressure_outlet: 3.9,
  current_draw: 18,
  speed_rpm: 1480,
  flow_rate: 120,
};

export const SENSOR_STDS: Record<SensorKey, number> = {
  temp_bearing: 1.5,
  temp_motor: 1.8,
  vibration_x: 0.08,
  vibration_y: 0.07,
  pressure_inlet: 0.12,
  pressure_outlet: 0.1,
  current_draw: 0.6,
  speed_rpm: 15,
  flow_rate: 4,
};

export const FEATURE_STATS = [
  "mean",
  "std",
  "median",
  "mad",
  "slope",
  "skew",
  "kurtosis",
] as const;

export type FeatureStat = (typeof FEATURE_STATS)[number];

export const DETECTOR_IDS = [
  "AR1",
  "PCA-SPE",
  "PCA-T2",
  "IForest",
  "GMM",
  "OMR",
] as const;

export type DetectorId = (typeof DETECTOR_IDS)[number];

export const DETECTOR_LABELS: Record<DetectorId, string> = {
  AR1: "AR(1) residual",
  "PCA-SPE": "PCA-SPE (Q)",
  "PCA-T2": "PCA-T²",
  IForest: "Isolation Forest",
  GMM: "Gaussian mixture",
  OMR: "Overall model residual",
};

export const BASE_WEIGHTS: Record<DetectorId, number> = {
  "PCA-SPE": 0.3,
  AR1: 0.2,
  "PCA-T2": 0.2,
  IForest: 0.15,
  OMR: 0.1,
  GMM: 0.05,
};

export const DETECTOR_COLORS: Record<DetectorId, string> = {
  AR1: "var(--color-chart-1)",
  "PCA-SPE": "var(--color-chart-2)",
  "PCA-T2": "var(--color-chart-5)",
  IForest: "var(--color-chart-3)",
  GMM: "var(--color-chart-6)",
  OMR: "var(--color-chart-4)",
};

export const PLOT1_KEYS = [
  "temp_bearing",
  "temp_motor",
  "vibration_x",
  "pressure_inlet",
  "current_draw",
  "speed_rpm",
] as const;

export const ASSET = {
  site: "North Dock Compressor Station",
  unit: "Train A",
  tag: "K-1204",
  component: "Journal bearing BRG-04",
  scenario: "Inner-race bearing degradation",
  sampling: "10-minute historian",
  window: "10-hour rolling window",
};
