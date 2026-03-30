"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, GitBranch, GitCommit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";
import RunStatusBadge from "./RunStatusBadge";
import type { PipelineRun } from "@/types";

type SortKey = "id" | "branch" | "status" | "duration" | "triggerType" | "createdAt";
type SortDir = "asc" | "desc";

interface PipelineRunsTableProps {
  runs: PipelineRun[];
  selectedRunId: string | null;
  onSelectRun: (run: PipelineRun) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

export default function PipelineRunsTable({ runs, selectedRunId, onSelectRun }: PipelineRunsTableProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...runs].sort((a, b) => {
      const valA = String(a[sortKey] ?? "");
      const valB = String(b[sortKey] ?? "");
      const cmp = valA.localeCompare(valB);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [runs, sortKey, sortDir]);

  const col = (key: SortKey, label: string) => (
    <th
      className="pb-2 font-medium cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon active={sortKey === key} dir={sortDir} />
      </div>
    </th>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t(language, "pipeline.runs")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {col("id", t(language, "pipeline.runId"))}
              {col("branch", t(language, "projects.branch"))}
              <th className="pb-2 font-medium">{t(language, "pipelines.commit")}</th>
              {col("status", t(language, "projects.status"))}
              {col("duration", t(language, "projects.duration"))}
              {col("triggerType", t(language, "projects.trigger"))}
              {col("createdAt", t(language, "pipeline.started"))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  {t(language, "pipeline.none")}
                </td>
              </tr>
            ) : (
              sorted.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => onSelectRun(run)}
                  className={cn(
                    "border-b last:border-0 cursor-pointer transition-colors",
                    selectedRunId === run.id
                      ? "bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <td className="py-2.5 font-mono text-xs text-primary font-semibold">#{run.id}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1 text-xs">
                      <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {run.branch}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1 text-xs font-mono" title={run.commitMsg}>
                      <GitCommit className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {run.commit.slice(0, 7)}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <RunStatusBadge status={run.status} />
                  </td>
                  <td className="py-2.5 text-muted-foreground text-xs">{run.duration ?? "—"}</td>
                  <td className="py-2.5">
                    <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded">
                      {run.triggerType}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(run.createdAt).toLocaleString(locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
