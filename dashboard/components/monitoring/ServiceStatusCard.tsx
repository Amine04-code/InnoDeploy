"use client";

import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, serviceStatusLabel, t } from "@/lib/settingsI18n";
import type { ServiceStatus } from "@/types";

const statusConfig: Record<ServiceStatus, {
  icon: React.ReactNode;
  badgeClass: string;
  iconClass: string;
}> = {
  healthy: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    iconClass: "text-green-600",
  },
  degraded: {
    icon: <AlertTriangle className="h-5 w-5" />,
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    iconClass: "text-yellow-500",
  },
  down: {
    icon: <XCircle className="h-5 w-5" />,
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    iconClass: "text-red-600",
  },
};

interface ServiceStatusCardProps {
  status: ServiceStatus;
  lastCheckedAt: string;
}

export default function ServiceStatusCard({ status, lastCheckedAt }: ServiceStatusCardProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);
  const cfg = statusConfig[status];
  const lastChecked = new Date(lastCheckedAt);

  return (
    <Card>
      <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex-shrink-0", cfg.iconClass)}>{cfg.icon}</span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {t(language, "monitoring.serviceStatus")}
            </p>
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold mt-1", cfg.badgeClass)}>
              {serviceStatusLabel(language, status)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground text-right">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {t(language, "monitoring.lastCheck")}<br />
            {lastChecked.toLocaleString(locale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
