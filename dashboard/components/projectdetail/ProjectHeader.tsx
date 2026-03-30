"use client";

import { ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, projectStatusLabel, t } from "@/lib/settingsI18n";
import type { ProjectDetail, ProjectStatus } from "@/types";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  running: { label: "running", className: "bg-green-500/10 text-green-600 border-green-500/30" },
  stopped: { label: "stopped", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  failed: { label: "failed", className: "bg-red-500/10 text-red-600 border-red-500/30" },
};

interface ProjectHeaderProps {
  project: ProjectDetail;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);
  const status = statusConfig[project.status];
  const lastDeploy = project.lastDeployAt
    ? new Date(project.lastDeployAt).toLocaleString(locale)
    : t(language, "projectHeader.neverDeployed");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              status.className
            )}
          >
            {projectStatusLabel(language, status.label as ProjectStatus)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {project.repoUrl}
          </a>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t(language, "projectHeader.lastDeploy", { value: lastDeploy })}
          </span>
        </div>
      </div>
    </div>
  );
}
