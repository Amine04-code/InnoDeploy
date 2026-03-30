"use client";

import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { alertSeverityLabel, localeFromLanguage, t } from "@/lib/settingsI18n";
import type { AlertHistoryEntry, AlertSeverity } from "@/types";

const severityConfig: Record<AlertSeverity, {
  icon: React.ReactNode;
  badgeClass: string;
}> = {
  critical: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
  warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  },
  info: {
    icon: <Info className="h-3.5 w-3.5" />,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
};

interface AlertHistoryTableProps {
  alerts: AlertHistoryEntry[];
}

export default function AlertHistoryTable({ alerts }: AlertHistoryTableProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t(language, "monitoring.alertHistory")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">{t(language, "alerts.severity")}</th>
              <th className="pb-2 font-medium">{t(language, "alerts.message")}</th>
              <th className="pb-2 font-medium whitespace-nowrap">{t(language, "monitoring.triggered")}</th>
              <th className="pb-2 font-medium">{t(language, "monitoring.resolved")}</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t(language, "monitoring.noAlertsRange")}
                </td>
              </tr>
            ) : (
              alerts.map((alert) => {
                const cfg = severityConfig[alert.severity];
                return (
                  <tr key={alert.id} className="border-b last:border-0">
                    <td className="py-2.5">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.badgeClass)}>
                        {cfg.icon}
                        {alertSeverityLabel(language, alert.severity)}
                      </span>
                    </td>
                    <td className="py-2.5 text-sm">{alert.message}</td>
                    <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(alert.triggeredAt).toLocaleString(locale)}
                    </td>
                    <td className="py-2.5">
                      {alert.resolved ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {alert.resolvedAt
                            ? new Date(alert.resolvedAt).toLocaleString(locale)
                            : t(language, "actions.yes")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t(language, "monitoring.ongoing")}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
