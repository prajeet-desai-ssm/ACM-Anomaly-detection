import { createFileRoute } from "@tanstack/react-router";
import { DetectorsView } from "@/components/acm/detectors-view";

export const Route = createFileRoute("/detectors")({ component: DetectorsView });
