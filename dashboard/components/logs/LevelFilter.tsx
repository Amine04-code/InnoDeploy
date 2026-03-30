"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { logLevelLabel } from "@/lib/settingsI18n";
import type { LogLevel } from "@/types";

const LEVELS: { value: LogLevel; label: string; activeClass: string }[] = [
  { value: "debug", label: "Debug", activeClass: "bg-gray-500 text-white" },
  { value: "info",  label: "Info",  activeClass: "bg-blue-500 text-white" },
  { value: "warn",  label: "Warn",  activeClass: "bg-yellow-500 text-white" },
  { value: "error", label: "Error", activeClass: "bg-red-500 text-white" },
  { value: "fatal", label: "Fatal", activeClass: "bg-purple-700 text-white" },
];

interface LevelFilterProps {
  selected: Set<LogLevel>;
  onChange: (selected: Set<LogLevel>) => void;
}

export default function LevelFilter({ selected, onChange }: LevelFilterProps) {
  const language = useLanguagePreference();
  const toggle = (level: LogLevel) => {
    const next = new Set(selected);
    if (next.has(level)) {
      next.delete(level);
    } else {
      next.add(level);
    }
    onChange(next);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {LEVELS.map(({ value, activeClass }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            selected.has(value)
              ? activeClass
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {logLevelLabel(language, value)}
        </button>
      ))}
    </div>
  );
}
