import { createFileRoute } from "@tanstack/react-router";
import { TelemetryView } from "@/components/acm/telemetry-view";

export const Route = createFileRoute("/telemetry")({ component: TelemetryView });
