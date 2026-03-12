"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceTile {
  name: string;
  status: "healthy" | "degraded" | "down";
}

const mockServices: ServiceTile[] = [
  { name: "web-app", status: "healthy" },
  { name: "api-service", status: "healthy" },
  { name: "worker", status: "degraded" },
  { name: "auth-svc", status: "healthy" },
  { name: "payments", status: "healthy" },
  { name: "notifications", status: "down" },
  { name: "search", status: "healthy" },
  { name: "analytics", status: "healthy" },
  { name: "cdn-proxy", status: "healthy" },
];

const statusColors = {
  healthy: "bg-emerald-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
};

export default function ServiceHealthMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mockServices.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  statusColors[svc.status]
                )}
              />
              <span className="truncate">{svc.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
