"use client";

import { ChevronDown } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface ContainerFilterProps {
  containers: string[];
  value: string;
  onChange: (container: string) => void;
}

export default function ContainerFilter({ containers, value, onChange }: ContainerFilterProps) {
  const language = useLanguagePreference();

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">{t(language, "logs.allContainers")}</option>
        {containers.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
}
