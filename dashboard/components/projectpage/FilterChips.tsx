"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { projectStatusLabel, t } from "@/lib/settingsI18n";
import type { ProjectStatus } from "@/types";

const filters: { value: ProjectStatus | "all" }[] = [
  { value: "all" },
  { value: "running" },
  { value: "stopped" },
  { value: "failed" },
];

interface FilterChipsProps {
  active: ProjectStatus | "all";
  onChange: (value: ProjectStatus | "all") => void;
}

export default function FilterChips({ active, onChange }: FilterChipsProps) {
  const language = useLanguagePreference();

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors border",
            active === value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {value === "all" ? t(language, "projects.all") : projectStatusLabel(language, value)}
        </button>
      ))}
    </div>
  );
}
