"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, X, Loader2, Clock, ChevronRight, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import StageLogViewer from "./StageLogViewer";
import CancelRunButton from "./CancelRunButton";
import RetryButton from "./RetryButton";
import type { PipelineRun, StageStatus } from "@/types";

function parseDurationToSeconds(d: string | null): number {
  if (!d) return 0;
  let seconds = 0;
  const m = d.match(/(\d+)m/);
  const s = d.match(/(\d+)s/);
  if (m) seconds += parseInt(m[1]) * 60;
  if (s) seconds += parseInt(s[1]);
  return seconds;
}

const stageStatusIcon: Record<StageStatus, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  running: <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />,
  success: <Check className="h-3.5 w-3.5 text-green-600" />,
  failed:  <X className="h-3.5 w-3.5 text-red-600" />,
  skipped: <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />,
};

const stageBarColor: Record<StageStatus, string> = {
  pending: "bg-muted-foreground/30",
  running: "bg-blue-500",
  success: "bg-green-500",
  failed:  "bg-red-500",
  skipped: "bg-muted-foreground/20",
};

interface PipelineDetailPanelProps {
  run: PipelineRun;
  onCancel: (runId: string) => Promise<void>;
  onRetry: (runId: string) => Promise<void>;
  streamState?: "idle" | "connecting" | "live" | "reconnecting" | "offline";
}

const streamStatusConfig: Record<NonNullable<PipelineDetailPanelProps["streamState"]>, { label: string; className: string }> = {
  idle: { label: "Idle", className: "border-border bg-muted/40 text-muted-foreground" },
  connecting: { label: "Connecting", className: "border-blue-300/30 bg-blue-100/50 text-blue-700" },
  live: { label: "Live", className: "border-emerald-300/30 bg-emerald-100/50 text-emerald-700" },
  reconnecting: { label: "Reconnecting", className: "border-amber-300/30 bg-amber-100/50 text-amber-700" },
  offline: { label: "Offline", className: "border-red-300/30 bg-red-100/50 text-red-700" },
};

export default function PipelineDetailPanel({ run, onCancel, onRetry, streamState = "idle" }: PipelineDetailPanelProps) {
  const language = useLanguagePreference();
  const [selectedStageId, setSelectedStageId] = useState<string>(run.stages[0]?.id ?? "");
  const streamStatus = streamStatusConfig[streamState];
  const streamLabelByState: Record<NonNullable<PipelineDetailPanelProps["streamState"]>, string> = {
    idle: t(language, "pipeline.stream.idle"),
    connecting: t(language, "pipeline.stream.connecting"),
    live: t(language, "pipeline.stream.live"),
    reconnecting: t(language, "pipeline.stream.reconnecting"),
    offline: t(language, "pipeline.stream.offline"),
  };

  // Reset selected stage when a different run is opened
  useEffect(() => {
    setSelectedStageId(run.stages[0]?.id ?? "");
  }, [run.id]);

  const totalSeconds = useMemo(
    () => run.stages.reduce((acc, s) => acc + parseDurationToSeconds(s.duration), 0),
    [run.stages]
  );

  const selectedStage = run.stages.find((s) => s.id === selectedStageId) ?? null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">
              Run <span className="font-mono text-primary">#{run.id}</span>
              <span className="text-muted-foreground font-normal ml-2 text-sm">
                {run.branch} · {run.commit.slice(0, 7)}
              </span>
            </CardTitle>
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", streamStatus.className)}>
              <CircleDot className={cn("h-3 w-3", streamState === "live" ? "animate-pulse" : "")} />
              {streamLabelByState[streamState]}
            </span>
          </div>
          <div className="flex gap-2">
            {run.status === "running" && (
              <CancelRunButton runId={run.id} onCancel={onCancel} />
            )}
            {run.status === "failed" && (
              <RetryButton runId={run.id} onRetry={onRetry} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stage step buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {run.stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => setSelectedStageId(stage.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  selectedStageId === stage.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                {stageStatusIcon[stage.status]}
                {stage.name}
                {stage.duration && (
                  <span className={cn("ml-1", selectedStageId === stage.id ? "opacity-80" : "opacity-60")}>
                    {stage.duration}
                  </span>
                )}
              </button>
              {idx < run.stages.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 mx-0.5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Duration bars */}
        {totalSeconds > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t(language, "pipeline.stageDuration")}
            </p>
            <div className="space-y-1.5">
              {run.stages.map((stage) => {
                const secs = parseDurationToSeconds(stage.duration);
                const pct = totalSeconds > 0 ? Math.max((secs / totalSeconds) * 100, 2) : 0;
                return (
                  <div key={stage.id} className="flex items-center gap-3 text-xs">
                    <span className="w-24 truncate text-muted-foreground text-right">{stage.name}</span>
                    <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", stageBarColor[stage.status])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-muted-foreground tabular-nums">
                      {stage.duration ?? "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Log viewer */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            {t(language, "pipeline.stageLogs")}
          </p>
          <StageLogViewer stage={selectedStage} />
        </div>
      </CardContent>
    </Card>
  );
}
