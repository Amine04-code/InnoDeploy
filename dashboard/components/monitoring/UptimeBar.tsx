"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface UptimeSegment {
  date: string;
  status: "up" | "incident";
}
interface UptimeBarProps {
  segments?: UptimeSegment[];
}

export default function UptimeBar({ segments = [] }: UptimeBarProps) {
  const language = useLanguagePreference();
  const upDays = segments.filter((s) => s.status === "up").length;
  const uptimePct = segments.length > 0 ? ((upDays / segments.length) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{segments[0]?.date || "-"}</span>
        <span className="font-semibold text-foreground">{t(language, "monitoring.uptime30d", { percent: uptimePct })}</span>
        <span>{t(language, "monitoring.today")}</span>
      </div>
      <div className="flex gap-0.5 h-8">
        {segments.length === 0 && <span className="text-xs text-muted-foreground">{t(language, "monitoring.noUptimeHistory")}</span>}
        {segments.map((seg) => (
          <div
            key={seg.date}
            title={`${seg.date}: ${seg.status === "up" ? t(language, "monitoring.operational") : t(language, "monitoring.incident")}`}
            className={cn(
              "flex-1 rounded-sm cursor-default transition-opacity hover:opacity-75",
              seg.status === "up" ? "bg-green-500" : "bg-red-500"
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
          {t(language, "monitoring.operational")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />
          {t(language, "monitoring.incident")}
        </span>
      </div>
    </div>
  );
}
