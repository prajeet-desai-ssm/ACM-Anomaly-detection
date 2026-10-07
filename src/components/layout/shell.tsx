import { useEffect } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Cpu,
  FileBarChart,
  Layers,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { BootScreen } from "@/components/acm/boot-screen";
import { Timeline } from "@/components/acm/timeline";
import { Badge } from "@/components/ui/badge";
import { ASSET } from "@/lib/acm/constants";
import { useAcm } from "@/lib/acm/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/telemetry", label: "Telemetry", icon: Activity },
  { to: "/detectors", label: "Detectors", icon: Cpu },
  { to: "/fusion", label: "Fusion", icon: Layers },
  { to: "/report", label: "Report", icon: FileBarChart },
] as const;

function PlaybackClock() {
  const playing = useAcm((s) => s.playing);
  const speed = useAcm((s) => s.speed);
  const n = useAcm((s) => s.result?.features.n ?? 0);

  useEffect(() => {
    if (!playing || n === 0) return;
    const step = speed >= 32 ? 12 : speed >= 8 ? 3 : 1;
    const ms = speed >= 32 ? 32 : speed >= 8 ? 40 : 90;
    const id = window.setInterval(() => {
      const { playIndex, setPlayIndex, setPlaying } = useAcm.getState();
      if (playIndex >= n - 1) {
        setPlaying(false);
        return;
      }
      setPlayIndex(Math.min(n - 1, playIndex + step));
    }, ms);
    return () => window.clearInterval(id);
  }, [playing, speed, n]);

  return null;
}

export function Shell() {
  const status = useAcm((s) => s.status);
  const ensure = useAcm((s) => s.ensure);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    ensure();
  }, [ensure]);

  if (status !== "ready") return <BootScreen />;

  return (
    <div className="bg-grid flex h-dvh flex-col overflow-hidden">
      <PlaybackClock />
      <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary">
              <Shield className="size-4" strokeWidth={1.75} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium tracking-tight">Aegis ACM</p>
              <p className="hidden font-mono text-xs text-muted-foreground sm:block">
                {ASSET.unit} · {ASSET.tag}
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors duration-150",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Badge variant="live">analysis</Badge>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
        <div className="shrink-0">
          <Timeline />
        </div>
      </div>

      <nav className="shrink-0 border-t border-border bg-background md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 text-xs",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
