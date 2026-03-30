"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { MonitoringTimeRange } from "@/types";

const MEMORY_LIMIT_MB = 512;
type MemoryPoint = { time: string; memoryMb: number };

interface MemoryChartProps {
  timeRange: MonitoringTimeRange;
  data?: MemoryPoint[];
}

export default function MemoryChart({ timeRange: _timeRange, data = [] }: MemoryChartProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t(language, "monitoring.memoryUsage")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 && <p className="text-xs text-muted-foreground">{t(language, "monitoring.noMemoryMetrics")}</p>}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, MEMORY_LIMIT_MB + 64]} unit=" MB" />
              <Tooltip
                contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                formatter={(v: number) => [`${v} MB`]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine
                y={MEMORY_LIMIT_MB}
                stroke="#ef4444"
                strokeDasharray="5 3"
                label={{ value: t(language, "monitoring.limitMb", { value: String(MEMORY_LIMIT_MB) }), position: "insideTopRight", fontSize: 10, fill: "#ef4444" }}
              />
              <Line type="monotone" dataKey="memoryMb" name={t(language, "monitoring.memory")} stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
