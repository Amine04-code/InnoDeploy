"use client";

import Link from "next/link";
import { GitBranch, Clock, Layers, ArrowRight, Circle } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, projectStatusLabel, t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

const statusConfig: Record<ProjectStatus, { className: string; dotColor: string; borderGlow: string }> = {
  running: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dotColor: "bg-emerald-400", borderGlow: "group-hover:border-emerald-500/20" },
  stopped: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", dotColor: "bg-amber-400", borderGlow: "group-hover:border-amber-500/20" },
  failed: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", dotColor: "bg-rose-400", borderGlow: "group-hover:border-rose-500/20" },
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const language = useLanguagePreference();
  const status = statusConfig[project.status];

  const lastDeploy = project.lastDeployAt
    ? timeAgo(project.lastDeployAt)
    : t(language, "projects.never");

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block group">
      <div className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-5 transition-all duration-300",
        "hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:bg-[#0a1628]/80",
        status.borderGlow
      )}>
        {/* Top: Name + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-slate-600 truncate mt-0.5">{project.description}</p>
            )}
          </div>
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0",
            status.className
          )}>
            <Circle className={cn("h-1.5 w-1.5 fill-current", project.status === "running" && "animate-pulse")} />
            {projectStatusLabel(language, project.status)}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <GitBranch className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
            <span className="truncate text-xs font-mono">{project.repoUrl}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
              <span className="text-xs" title={project.lastDeployAt ? new Date(project.lastDeployAt).toLocaleString(localeFromLanguage(language)) : undefined}>
                {lastDeploy}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Layers className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
              <span className="text-xs">
                {project.envCount} env{project.envCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Branch tag */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-mono text-slate-500">
              <GitBranch className="h-2.5 w-2.5" />
              {project.branch}
            </span>
            <span className="text-xs text-slate-600 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
              View <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
