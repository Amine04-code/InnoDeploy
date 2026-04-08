"use client";

import { useEffect, useState } from "react";
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <h2 className="text-lg font-semibold text-white">{t(language, "activity.title")}</h2>
      </div>
      <div className="p-6">
        {data.length === 0 && <p className="text-sm text-slate-500">{t(language, "activity.none")}</p>}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0a1628",
                  fontSize: 12,
                  color: "#e2e8f0",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area
                type="monotone"
                dataKey="deploys"
                stroke="#06b6d4"
                fill="url(#deployGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
