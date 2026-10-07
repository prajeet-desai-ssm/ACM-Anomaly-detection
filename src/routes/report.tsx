import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/acm/report-view";

export const Route = createFileRoute("/report")({ component: ReportView });
