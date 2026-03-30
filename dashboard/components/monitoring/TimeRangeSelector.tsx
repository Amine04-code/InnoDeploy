"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { MonitoringTimeRange } from "@/types";

const RANGES: { label: string; value: MonitoringTimeRange }[] = [
  { label: "1h",   value: "1h" },
  { label: "6h",   value: "6h" },
  { label: "24h",  value: "24h" },
  { label: "7d",   value: "7d" },
  { label: "30d",  value: "30d" },
  { label: "Custom", value: "custom" },
];

interface TimeRangeSelectorProps {
  value: MonitoringTimeRange;
  onChange: (range: MonitoringTimeRange) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const language = useLanguagePreference();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === r.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {r.value === "custom" ? t(language, "filters.custom") : r.label}
        </button>
      ))}
    </div>
  );
}
