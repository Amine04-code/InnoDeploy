"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import { alertApi } from "@/lib/apiClient";
import type { ProjectAlert } from "@/types";

type Severity = "critical" | "warning" | "info";

interface Alert {
  id: string;
  message: string;
  severity: Severity;
  time: string;
}

const severityStyles: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function AlertsFeed() {
  const language = useLanguagePreference();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const formatRelative = (isoDate: string) => {
      const deltaSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
      if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
      if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m ago`;
      if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h ago`;
      return `${Math.floor(deltaSeconds / 86400)}d ago`;
    };

    const load = async () => {
      try {
        const { data } = await alertApi.getAlerts();
        const mapped = ((data?.alerts || []) as ProjectAlert[])
          .slice(0, 5)
          .map((item) => ({
            id: item.id,
            message: item.message,
            severity: item.severity,
            time: formatRelative(item.timestamp),
          }));

        setAlerts(mapped);
      } catch {
        setAlerts([]);
      }
    };

    void load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t(language, "alerts.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {alerts.length === 0 && <li className="text-sm text-muted-foreground">{t(language, "alerts.none")}</li>}
          {alerts.map((alert) => (
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
