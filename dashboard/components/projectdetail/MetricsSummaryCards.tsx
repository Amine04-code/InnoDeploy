"use client";

import { Cpu, MemoryStick, Timer, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EnvironmentMetrics } from "@/types";

const metricItems = [
  { key: "cpu" as const, label: "CPU", icon: Cpu },
  { key: "memory" as const, label: "Memory", icon: MemoryStick },
  { key: "latency" as const, label: "Latency", icon: Timer },
  { key: "uptime" as const, label: "Uptime", icon: ArrowUp },
];

interface MetricsSummaryCardsProps {
  metrics: EnvironmentMetrics;
}

export default function MetricsSummaryCards({ metrics }: MetricsSummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {metricItems.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{metrics[key]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
