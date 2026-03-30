"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { MonitoringTimeRange } from "@/types";

type NetworkPoint = { time: string; inKbPerSec: number; outKbPerSec: number };

interface NetworkChartProps {
  timeRange: MonitoringTimeRange;
  data?: NetworkPoint[];
}

export default function NetworkChart({ timeRange: _timeRange, data = [] }: NetworkChartProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t(language, "monitoring.networkIo")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 && <p className="text-xs text-muted-foreground">{t(language, "monitoring.noNetworkMetrics")}</p>}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="netIn"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="netOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit=" KB/s" />
              <Tooltip
                contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                formatter={(v: number) => [`${v} KB/s`]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="inKbPerSec" name={t(language, "monitoring.inbound")} stroke="#6366f1" fill="url(#netIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="outKbPerSec" name={t(language, "monitoring.outbound")} stroke="#f59e0b" fill="url(#netOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
