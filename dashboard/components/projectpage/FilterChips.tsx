"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { projectStatusLabel, t } from "@/lib/settingsI18n";
import type { ProjectStatus } from "@/types";

const filters: { value: ProjectStatus | "all"; activeClass: string }[] = [
  { value: "all", activeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  { value: "running", activeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { value: "stopped", activeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { value: "failed", activeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
];

interface FilterChipsProps {
  active: ProjectStatus | "all";
  onChange: (value: ProjectStatus | "all") => void;
}

export default function FilterChips({ active, onChange }: FilterChipsProps) {
  const language = useLanguagePreference();

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ value, activeClass }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border",
            active === value
              ? activeClass
              : "border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15] hover:text-slate-300"
          )}
        >
          {value === "all" ? t(language, "projects.all") : projectStatusLabel(language, value)}
        </button>
      ))}
    </div>
  );
}
