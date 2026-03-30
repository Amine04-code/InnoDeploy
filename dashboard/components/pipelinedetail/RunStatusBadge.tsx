"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { pipelineRunStatusLabel } from "@/lib/settingsI18n";
import type { PipelineRunStatus } from "@/types";

const statusConfig: Record<PipelineRunStatus, { className: string }> = {
  queued:  { className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  running: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 animate-pulse" },
  success: { className: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300" },
  failed:  { className: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300" },
};

interface RunStatusBadgeProps {
  status: PipelineRunStatus;
}

export default function RunStatusBadge({ status }: RunStatusBadgeProps) {
  const language = useLanguagePreference();
  const { className } = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {pipelineRunStatusLabel(language, status)}
    </span>
  );
}
