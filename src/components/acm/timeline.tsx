import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ASSET, FAULT_START, SAMPLE_MINUTES } from "@/lib/acm/constants";
import { useAcm } from "@/lib/acm/store";
import { cn } from "@/lib/utils";

const SPEEDS = [1, 4, 16, 64];

export function Timeline() {
  const result = useAcm((s) => s.result);
  const playIndex = useAcm((s) => s.playIndex);
  const playing = useAcm((s) => s.playing);
  const speed = useAcm((s) => s.speed);
  const setPlayIndex = useAcm((s) => s.setPlayIndex);
  const setPlaying = useAcm((s) => s.setPlaying);
  const setSpeed = useAcm((s) => s.setSpeed);
  if (!result) return null;

  const n = result.features.n;
  const ts = result.timestampsFeat[playIndex] ?? "";
  const alarm = result.anyAlarm[playIndex] === 1;
  const degraded = playIndex >= result.faultOnsetFeat;
  const status = alarm ? "alarm" : degraded ? "degraded" : "healthy";
  const hours = (playIndex * SAMPLE_MINUTES) / 60;

  return (
    <div className="border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="size-11"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <div>
              <p className="font-mono text-sm tabular">{ts}</p>
              <p className="text-xs text-muted-foreground">
                {ASSET.component} · t = {hours.toFixed(1)} h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={status === "alarm" ? "alarm" : status === "degraded" ? "warn" : "ok"}
            >
              {status}
            </Badge>
            <div className="flex rounded-md border border-border">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "h-10 min-w-11 px-2.5 font-mono text-xs",
                    speed === s ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="block">
          <span className="sr-only">Scrub historian</span>
          <input
            type="range"
            min={0}
            max={n - 1}
            value={playIndex}
            onChange={(e) => {
              setPlaying(false);
              setPlayIndex(Number(e.target.value));
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
          />
          <span className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
            <span>healthy baseline</span>
            <span>fault @ row {FAULT_START}</span>
            <span>end</span>
          </span>
        </label>
      </div>
    </div>
  );
}
