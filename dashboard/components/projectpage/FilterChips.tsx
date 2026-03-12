"use client";

import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const filters: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Stopped", value: "stopped" },
  { label: "Failed", value: "failed" },
];

interface FilterChipsProps {
  active: ProjectStatus | "all";
  onChange: (value: ProjectStatus | "all") => void;
}

export default function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ label, value }) => (
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
          {label}
        </button>
      ))}
    </div>
  );
}
