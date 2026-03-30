"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { pipelineApi, projectApi } from "@/lib/apiClient";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";
import type { Project } from "@/types";

interface PipelineRun {
  id: string;
  project: string;
  branch: string;
  status: "success" | "failed" | "running";
  duration: string | null;
  trigger: string;
  startedAt: string;
}

const statusConfig = {
  success: { icon: CheckCircle, className: "text-emerald-500" },
  failed: { icon: XCircle, className: "text-destructive" },
  running: { icon: Clock, className: "text-blue-500 animate-pulse" },
};

export default function RecentPipelinesTable() {
  const language = useLanguagePreference();
  const [runs, setRuns] = useState<PipelineRun[]>([]);

  useEffect(() => {
    const mapStatus = (status: string): PipelineRun["status"] => {
      if (status === "in-progress" || status === "pending") return "running";
      if (status === "failed" || status === "cancelled") return "failed";
      return "success";
    };

    const asDuration = (durationMs?: number) => {
      if (!durationMs || durationMs <= 0) return null;
      const seconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const rem = seconds % 60;
      return minutes > 0 ? `${minutes}m ${rem}s` : `${rem}s`;
    };

    const load = async () => {
      try {
        const { data: projectsData } = await projectApi.getProjects();
        const projects = (projectsData?.projects || []) as Project[];

        const runBatches = await Promise.all(
          projects.map(async (project) => {
            const { data } = await pipelineApi.listProjectRuns(project.id);
            const source = Array.isArray(data?.runs) ? data.runs : [];
            return source.map((run: any) => ({
              id: String(run.id),
              project: project.name,
              branch: String(run.branch || "main"),
              status: mapStatus(String(run.status || "pending")),
              duration: asDuration(Number(run.duration || 0)),
              trigger: String(run.triggeredBy || "manual"),
              startedAt: String(run.createdAt || new Date().toISOString()),
            }));
          })
        );

        const merged = runBatches
          .flat()
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, 10);

        setRuns(merged);
      } catch {
        setRuns([]);
      }
    };

    void load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t(language, "pipelines.recent")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-2 font-medium">{t(language, "pipelines.status")}</th>
                <th className="pb-2 font-medium">{t(language, "pipelines.project")}</th>
                <th className="pb-2 font-medium">{t(language, "pipelines.branch")}</th>
                <th className="pb-2 font-medium">{t(language, "pipelines.duration")}</th>
                <th className="pb-2 font-medium">{t(language, "pipelines.trigger")}</th>
                <th className="pb-2 font-medium">{t(language, "pipelines.started")}</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                    {t(language, "pipelines.none")}
                  </td>
                </tr>
              )}
              {runs.map((run) => {
                const { icon: StatusIcon, className } = statusConfig[run.status];
                return (
                  <tr key={run.id} className="border-b last:border-0">
                    <td className="py-2.5">
                      <StatusIcon className={cn("h-4 w-4", className)} />
                    </td>
                    <td className="py-2.5 font-medium">{run.project}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded-full">
                        <GitBranch className="h-3 w-3" />
                        {run.branch}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{run.duration || "-"}</td>
                    <td className="py-2.5 text-muted-foreground">{run.trigger}</td>
                    <td className="py-2.5 text-muted-foreground">{new Date(run.startedAt).toLocaleString(localeFromLanguage(language))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
