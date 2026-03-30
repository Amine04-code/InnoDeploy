"use client";

import { useEffect, useRef } from "react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { PipelineStage } from "@/types";

interface StageLogViewerProps {
  stage: PipelineStage | null;
}

export default function StageLogViewer({ stage }: StageLogViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const language = useLanguagePreference();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stage?.id, stage?.logs.length]);

  return (
    <div className="rounded-md border bg-[#0d1117] text-[#e6edf3] font-mono text-xs min-h-[220px] max-h-[340px] overflow-y-auto p-4 leading-relaxed">
      {!stage ? (
        <span className="text-[#6e7681]">{t(language, "pipeline.selectStage")}</span>
      ) : (
        <>
          <p className="text-[#58a6ff] mb-3">
            <span className="text-[#6e7681]">$</span> {t(language, "pipeline.stage")}: <span className="font-semibold">{stage.name}</span>
          </p>
          {stage.logs.length === 0 ? (
            <p className="text-[#6e7681]">{t(language, "pipeline.noStageLogs")}</p>
          ) : (
            stage.logs.map((line, i) => (
              <p key={i} className="leading-6">
                <span className="text-[#6e7681] select-none mr-3">{String(i + 1).padStart(4, " ")}</span>
                {line}
              </p>
            ))
          )}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
