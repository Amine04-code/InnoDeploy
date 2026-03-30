"use client";

import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

const tabs = ["Overview", "Pipelines", "Monitoring", "Logs", "Settings"] as const;
export type SubNavTab = (typeof tabs)[number];

interface SubNavTabsProps {
  active: SubNavTab;
  onChange: (tab: SubNavTab) => void;
}

export default function SubNavTabs({ active, onChange }: SubNavTabsProps) {
  const language = useLanguagePreference();

  const labelByTab: Record<SubNavTab, string> = {
    Overview: t(language, "nav.overview"),
    Pipelines: t(language, "nav.pipelines"),
    Monitoring: t(language, "nav.monitoring"),
    Logs: t(language, "nav.logs"),
    Settings: t(language, "nav.settings"),
  };

  return (
    <div className="border-b">
      <nav className="flex gap-4 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "px-1 pb-3 text-sm font-medium transition-colors border-b-2",
              active === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {labelByTab[tab]}
          </button>
        ))}
      </nav>
    </div>
  );
}
