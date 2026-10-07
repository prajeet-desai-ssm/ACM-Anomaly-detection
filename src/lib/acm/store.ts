import { create } from "zustand";
import { runPipeline } from "./pipeline";
import type { PipelineResult } from "./types";

type Status = "idle" | "running" | "ready" | "error";

type AcmState = {
  status: Status;
  step: string;
  pct: number;
  error: string | null;
  result: PipelineResult | null;
  playIndex: number;
  playing: boolean;
  speed: number;
  ensure: () => void;
  setPlayIndex: (i: number) => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
};

let started = false;

export const useAcm = create<AcmState>((set) => ({
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
    set({ status: "running", step: "Initializing historian", pct: 2 });
    void runPipeline((step, pct) => set({ step, pct }))
      .then((result) => {
        const start = Math.max(0, result.faultOnsetFeat - 40);
        set({
          status: "ready",
          result,
          playIndex: start,
          pct: 100,
          step: "Pipeline ready",
        });
      })
      .catch((err: unknown) => {
        started = false;
        set({
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      });
  },
}));

export function featIndexFromRaw(raw: number, offset: number, nFeat: number): number {
  return Math.max(0, Math.min(nFeat - 1, raw - offset));
}

export function rawIndexFromFeat(feat: number, offset: number, nRaw: number): number {
  return Math.max(0, Math.min(nRaw - 1, feat + offset));
}

export function useAcmStore(): AcmState {
  return useAcm();
}
