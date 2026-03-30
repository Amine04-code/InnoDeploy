"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { MonitoringTimeRange } from "@/types";

type CpuPoint = {
  time: string;
  [key: string]: string | number;
};

interface CPUChartProps {
  timeRange: MonitoringTimeRange;
  data?: CpuPoint[];
}

export default function CPUChart({ timeRange: _timeRange, data = [] }: CPUChartProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t(language, "monitoring.cpuUsage")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 && <p className="text-xs text-muted-foreground">{t(language, "monitoring.noCpuMetrics")}</p>}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                formatter={(v: number) => [`${v}%`]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="cpu" name={t(language, "monitoring.cpu")} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
