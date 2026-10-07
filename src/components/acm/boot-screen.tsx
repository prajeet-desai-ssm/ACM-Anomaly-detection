import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcm } from "@/lib/acm/store";

export function BootScreen() {
  const status = useAcm((s) => s.status);
  const step = useAcm((s) => s.step);
  const pct = useAcm((s) => s.pct);
  const error = useAcm((s) => s.error);
  const ensure = useAcm((s) => s.ensure);
  const [log, setLog] = useState<string[]>(["Historian cold start"]);

  useEffect(() => {
    ensure();
  }, [ensure]);

  useEffect(() => {
    setLog((prev) => {
      if (prev[prev.length - 1] === step) return prev;
      return [...prev, step].slice(-9);
    });
  }, [step]);

  return (
    <main className="bg-grid flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
            <Shield className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              North Dock · K-1204
            </p>
            <h1 className="text-2xl font-medium tracking-tight">Aegis ACM</h1>
          </div>
        </div>

        <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Asset condition monitor. Six unsupervised detectors, MAD-calibrated and fused,
          watching a journal bearing as it leaves the healthy envelope.
        </p>

        {status === "error" ? (
          <div className="rounded-xl border border-destructive/40 bg-card p-5">
            <p className="text-sm text-destructive">{error}</p>
            <Button className="mt-4" onClick={() => ensure()}>
              Retry analysis
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {status === "ready" ? "Ready" : "Running pipeline"}
              </span>
              <span className="font-mono text-sm tabular text-primary">{pct}%</span>
            </div>
            <div className="mb-6 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <ol className="space-y-1.5 font-mono text-xs text-muted-foreground">
              {log.map((line, i) => (
                <li
                  key={`${line}-${i}`}
                  className={i === log.length - 1 ? "text-foreground" : undefined}
                >
                  <span className="mr-2 text-primary">›</span>
                  {line}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </main>
  );
}
