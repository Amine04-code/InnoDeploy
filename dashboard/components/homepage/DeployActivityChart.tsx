"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { pipelineApi, projectApi } from "@/lib/apiClient";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { Project } from "@/types";

type ActivityPoint = { date: string; deploys: number };

export default function DeployActivityChart() {
  const language = useLanguagePreference();
  const [data, setData] = useState<ActivityPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: projectsData } = await projectApi.getProjects();
        const projects = (projectsData?.projects || []) as Project[];

        const runsByProject = await Promise.all(
          projects.map(async (project) => {
            const { data: runsData } = await pipelineApi.listProjectRuns(project.id);
            return Array.isArray(runsData?.runs) ? runsData.runs : [];
          })
        );

        const allRuns = runsByProject.flat();
        const bucket = new Map<string, number>();

        for (const run of allRuns) {
          const createdAt = new Date(String(run.createdAt || ""));
          if (Number.isNaN(createdAt.getTime())) continue;

          const dayKey = createdAt.toISOString().slice(0, 10);
          bucket.set(dayKey, (bucket.get(dayKey) || 0) + 1);
        }

        const points: ActivityPoint[] = [];
        for (let i = 13; i >= 0; i -= 1) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const key = date.toISOString().slice(0, 10);
          points.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            deploys: bucket.get(key) || 0,
          });
        }

        setData(points);
      } catch {
        setData([]);
      }
    };

    void load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t(language, "activity.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 && <p className="text-sm text-muted-foreground">{t(language, "activity.none")}</p>}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="deploys"
                stroke="hsl(221.2, 83.2%, 53.3%)"
                fill="hsl(221.2, 83.2%, 53.3%)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
