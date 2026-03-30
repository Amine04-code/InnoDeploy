"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban, Rocket, HeartPulse, AlertTriangle } from "lucide-react";
import { alertApi, projectApi } from "@/lib/apiClient";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { Project, ProjectAlert } from "@/types";

type KpiItem = {
  label: string;
  value: string;
  icon: typeof FolderKanban;
  color: string;
};

export default function StatsGrid() {
  const language = useLanguagePreference();
  const [kpis, setKpis] = useState<KpiItem[]>([
    { label: t(language, "stats.totalProjects"), value: "0", icon: FolderKanban, color: "text-blue-500" },
    { label: t(language, "stats.runningProjects"), value: "0", icon: Rocket, color: "text-violet-500" },
    { label: t(language, "stats.healthyProjects"), value: "0", icon: HeartPulse, color: "text-emerald-500" },
    { label: t(language, "stats.openAlerts"), value: "0", icon: AlertTriangle, color: "text-amber-500" },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: projectsRes }, { data: alertsRes }] = await Promise.all([
          projectApi.getProjects(),
          alertApi.getAlerts(),
        ]);

        const projects = (projectsRes?.projects || []) as Project[];
        const alerts = (alertsRes?.alerts || []) as ProjectAlert[];

        const runningProjects = projects.filter((project) => project.status === "running").length;
        const healthyProjects = projects.filter((project) => project.status !== "failed").length;
        const openAlerts = alerts.filter((alert) => alert.status === "open").length;

        setKpis([
          { label: t(language, "stats.totalProjects"), value: String(projects.length), icon: FolderKanban, color: "text-blue-500" },
          { label: t(language, "stats.runningProjects"), value: String(runningProjects), icon: Rocket, color: "text-violet-500" },
          { label: t(language, "stats.healthyProjects"), value: String(healthyProjects), icon: HeartPulse, color: "text-emerald-500" },
          { label: t(language, "stats.openAlerts"), value: String(openAlerts), icon: AlertTriangle, color: "text-amber-500" },
        ]);
      } catch {
        setKpis([
          { label: t(language, "stats.totalProjects"), value: "0", icon: FolderKanban, color: "text-blue-500" },
          { label: t(language, "stats.runningProjects"), value: "0", icon: Rocket, color: "text-violet-500" },
          { label: t(language, "stats.healthyProjects"), value: "0", icon: HeartPulse, color: "text-emerald-500" },
          { label: t(language, "stats.openAlerts"), value: "0", icon: AlertTriangle, color: "text-amber-500" },
        ]);
      }
    };

    void load();
  }, [language]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{label}</CardDescription>
            <Icon className={`h-5 w-5 ${color}`} />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl">{value}</CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
