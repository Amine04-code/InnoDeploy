"use client";

import { Moon, Monitor, Sun } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/types";

interface ThemeToggleProps {
  value: ThemePreference;
  disabled?: boolean;
  onChange: (value: ThemePreference) => void;
}

const options: Array<{ value: ThemePreference; labelKey: string; icon: typeof Sun }> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
];

export default function ThemeToggle({ value, disabled, onChange }: ThemeToggleProps) {
  const language = useLanguagePreference();

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ value: optionValue, labelKey, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          disabled={disabled}
          onClick={() => onChange(optionValue)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            value === optionValue ? "border-primary bg-primary/10 text-primary" : "border-input bg-background text-muted-foreground hover:bg-accent",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <Icon className="h-4 w-4" />
          {t(language, labelKey)}
        </button>
      ))}
    </div>
  );
}