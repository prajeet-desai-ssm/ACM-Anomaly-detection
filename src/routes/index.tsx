import { createFileRoute } from "@tanstack/react-router";
import { OverviewView } from "@/components/acm/overview-view";

export const Route = createFileRoute("/")({ component: OverviewView });
