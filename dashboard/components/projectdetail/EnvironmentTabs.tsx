"use client";

import { cn } from "@/lib/utils";
import type { Environment } from "@/types";

interface EnvironmentTabsProps {
  environments: Environment[];
  activeId: string;
  onChange: (id: string) => void;
}

export default function EnvironmentTabs({
  environments,
  activeId,
  onChange,
}: EnvironmentTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {environments.map((env) => (
        <button
          key={env.id}
          onClick={() => onChange(env.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors border",
            activeId === env.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {env.name}
        </button>
      ))}
    </div>
  );
}
