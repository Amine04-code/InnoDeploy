"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import DeployActivityChart from "@/components/homepage/DeployActivityChart";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { projectApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/types";

type DeploymentRecord = {
  id: string;
  projectId: string;
  projectName: string;
  version: string;
  strategy: string;
  status: "success" | "failed" | "in-progress";
  createdAt: string;
};

const toDeploymentStatus = (status: string): DeploymentRecord["status"] => {
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "success") return "success";
  return "in-progress";
};

export default function DeploymentsPage() {
  const language = useLanguagePreference();
  const isReady = useRequireAuth();
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeployments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: projectsRes } = await projectApi.getProjects();
      const projects = (Array.isArray(projectsRes?.projects) ? projectsRes.projects : []) as Project[];

      const historyBatches = await Promise.allSettled(
        projects.map(async (project) => {
          const { data } = await projectApi.getDeploymentHistory(project.id);
          const history = Array.isArray(data?.history) ? data.history : [];

          return history.map((item: any) => ({
            id: String(item._id || item.id || `${project.id}-${item.createdAt || Date.now()}`),
            projectId: project.id,
            projectName: project.name,
            version: String(item.version || "unknown"),
            strategy: String(item.strategy || "rolling"),
            status: toDeploymentStatus(String(item.status || "in-progress")),
            createdAt: String(item.createdAt || new Date().toISOString()),
          })) as DeploymentRecord[];
        })
      );

      const merged = historyBatches
        .flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setDeployments(merged);
    } catch {
      setError("Failed to load deployments.");
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    void loadDeployments();
  }, [isReady]);

  const deploymentStats = useMemo(
    () => [
      {
        label: t(language, "deployments.successful"),
        value: deployments.filter((item) => item.status === "success").length,
      },
      {
        label: t(language, "deployments.failed"),
        value: deployments.filter((item) => item.status === "failed").length,
      },
      {
        label: t(language, "deployments.inProgress"),
        value: deployments.filter((item) => item.status === "in-progress").length,
      },
    ],
    [deployments, language]
  );

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{t(language, "deployments.pageTitle")}</h1>
              <p className="text-sm text-muted-foreground">
                {t(language, "deployments.subtitle")}
              </p>
            </div>
            <Button variant="outline" onClick={() => void loadDeployments()} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-3">
            {deploymentStats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading deployments...</p>
              ) : deployments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deployment history available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Project</th>
                        <th className="pb-2 font-medium">Version</th>
                        <th className="pb-2 font-medium">Strategy</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Started</th>
                        <th className="pb-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployments.slice(0, 12).map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2.5 font-medium">{item.projectName}</td>
                          <td className="py-2.5 text-muted-foreground">{item.version}</td>
                          <td className="py-2.5 capitalize text-muted-foreground">{item.strategy}</td>
                          <td className="py-2.5 capitalize">{item.status}</td>
                          <td className="py-2.5 text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</td>
                          <td className="py-2.5">
                            <Link href={`/dashboard/projects/${item.projectId}`} className="text-primary hover:underline">
                              View project
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <DeployActivityChart />
        </main>
      </div>
    </div>
  );
}
