"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban, Rocket, HeartPulse, AlertTriangle } from "lucide-react";

const kpis = [
  { label: "Total Projects", value: "12", icon: FolderKanban, color: "text-blue-500" },
  { label: "Active Deploys", value: "3", icon: Rocket, color: "text-violet-500" },
  { label: "Healthy Services", value: "18", icon: HeartPulse, color: "text-emerald-500" },
  { label: "Open Alerts", value: "2", icon: AlertTriangle, color: "text-amber-500" },
];

export default function StatsGrid() {
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
