"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { MonitoringTimeRange } from "@/types";

type LatencyPoint = { time: string; latencyMs: number };

interface LatencyChartProps {
  timeRange: MonitoringTimeRange;
  data?: LatencyPoint[];
}

export default function LatencyChart({ timeRange: _timeRange, data = [] }: LatencyChartProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t(language, "monitoring.responseLatency")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 && <p className="text-xs text-muted-foreground">{t(language, "monitoring.noLatencyMetrics")}</p>}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit=" ms" />
              <Tooltip
                contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                formatter={(v: number) => [`${v} ms`]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="latencyMs" name={t(language, "monitoring.latency")} stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
