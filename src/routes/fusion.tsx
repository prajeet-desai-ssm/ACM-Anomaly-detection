import { createFileRoute } from "@tanstack/react-router";
import { FusionView } from "@/components/acm/fusion-view";

export const Route = createFileRoute("/fusion")({ component: FusionView });
