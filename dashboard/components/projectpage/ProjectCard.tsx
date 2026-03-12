"use client";

import Link from "next/link";
import { GitBranch, Clock, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-green-500/10 text-green-600 border-green-500/30" },
  stopped: { label: "Stopped", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-600 border-red-500/30" },
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status];

  const lastDeploy = project.lastDeployAt
    ? new Date(project.lastDeployAt).toLocaleString()
    : "Never";

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            status.className
          )}
        >
          {status.label}
        </span>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <GitBranch className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{project.repoUrl}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{lastDeploy}</span>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {project.envCount} environment{project.envCount !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
