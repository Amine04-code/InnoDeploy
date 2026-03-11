"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "info";

interface Alert {
  id: string;
  message: string;
  severity: Severity;
  time: string;
}

const mockAlerts: Alert[] = [
  { id: "1", message: "notifications service is unreachable", severity: "critical", time: "3 min ago" },
  { id: "2", message: "worker response time > 2 s", severity: "warning", time: "18 min ago" },
  { id: "3", message: "Deployment #84 completed for web-app", severity: "info", time: "1 hr ago" },
  { id: "4", message: "Disk usage above 80% on host prod-02", severity: "warning", time: "2 hr ago" },
  { id: "5", message: "Certificate expiring in 7 days for api.example.com", severity: "info", time: "5 hr ago" },
];

const severityStyles: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function AlertsFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {mockAlerts.map((alert) => (
            <li key={alert.id} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  severityStyles[alert.severity]
                )}
              >
                {alert.severity}
              </span>
              <span className="flex-1">{alert.message}</span>
              <span className="shrink-0 text-muted-foreground text-xs">{alert.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
