"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineRun {
  id: string;
  project: string;
  branch: string;
  status: "success" | "failed" | "running";
  duration: string;
  trigger: string;
  startedAt: string;
}

const mockRuns: PipelineRun[] = [
  { id: "1", project: "web-app", branch: "main", status: "success", duration: "2m 14s", trigger: "push", startedAt: "2 min ago" },
  { id: "2", project: "api-service", branch: "feat/auth", status: "failed", duration: "1m 02s", trigger: "PR #42", startedAt: "8 min ago" },
  { id: "3", project: "web-app", branch: "main", status: "running", duration: "0m 45s", trigger: "push", startedAt: "12 min ago" },
  { id: "4", project: "worker", branch: "main", status: "success", duration: "3m 30s", trigger: "schedule", startedAt: "25 min ago" },
  { id: "5", project: "api-service", branch: "main", status: "success", duration: "1m 55s", trigger: "push", startedAt: "1 hr ago" },
  { id: "6", project: "web-app", branch: "fix/css", status: "success", duration: "2m 01s", trigger: "PR #39", startedAt: "1 hr ago" },
  { id: "7", project: "infra", branch: "main", status: "failed", duration: "0m 30s", trigger: "push", startedAt: "2 hr ago" },
  { id: "8", project: "worker", branch: "feat/queue", status: "success", duration: "4m 12s", trigger: "PR #15", startedAt: "3 hr ago" },
  { id: "9", project: "api-service", branch: "main", status: "success", duration: "1m 48s", trigger: "push", startedAt: "4 hr ago" },
  { id: "10", project: "web-app", branch: "main", status: "success", duration: "2m 10s", trigger: "schedule", startedAt: "5 hr ago" },
];

const statusConfig = {
  success: { icon: CheckCircle, className: "text-emerald-500" },
  failed: { icon: XCircle, className: "text-destructive" },
  running: { icon: Clock, className: "text-blue-500 animate-pulse" },
};

export default function RecentPipelinesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Pipelines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Project</th>
                <th className="pb-2 font-medium">Branch</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Trigger</th>
                <th className="pb-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {mockRuns.map((run) => {
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
                    <td className="py-2.5 text-muted-foreground">{run.duration}</td>
                    <td className="py-2.5 text-muted-foreground">{run.trigger}</td>
                    <td className="py-2.5 text-muted-foreground">{run.startedAt}</td>
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
