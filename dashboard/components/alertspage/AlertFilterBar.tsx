"use client";

import { Input } from "@/components/ui/input";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { alertRuleLabel, alertSeverityLabel, t } from "@/lib/settingsI18n";
import type { AlertRuleType, AlertSeverity } from "@/types";

interface AlertFilterBarProps {
  severity: string;
  project: string;
  ruleType: string;
  dateRange: string;
  search: string;
  projects: string[];
  onSeverityChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onRuleTypeChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const severityOptions: Array<"all" | AlertSeverity> = ["all", "critical", "warning", "info"];
const ruleOptions: Array<"all" | AlertRuleType> = ["all", "cpu", "memory", "latency", "availability", "deployment", "disk", "certificate"];

export default function AlertFilterBar(props: AlertFilterBarProps) {
  const language = useLanguagePreference();
  const {
    severity,
    project,
    ruleType,
    dateRange,
    search,
    projects,
    onSeverityChange,
    onProjectChange,
    onRuleTypeChange,
    onDateRangeChange,
    onSearchChange,
  } = props;

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 lg:grid-cols-5">
      <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder={t(language, "alerts.filterSearch")} />
      <select value={severity} onChange={(e) => onSeverityChange(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
        {severityOptions.map((option) => <option key={option} value={option}>{option === "all" ? t(language, "alerts.allSeverities") : alertSeverityLabel(language, option)}</option>)}
      </select>
      <select value={project} onChange={(e) => onProjectChange(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
        <option value="all">{t(language, "alerts.allProjects")}</option>
        {projects.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select value={ruleType} onChange={(e) => onRuleTypeChange(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
        {ruleOptions.map((option) => <option key={option} value={option}>{option === "all" ? t(language, "alerts.allRules") : alertRuleLabel(language, option)}</option>)}
      </select>
      <select value={dateRange} onChange={(e) => onDateRangeChange(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
        <option value="24h">{t(language, "alerts.last24h")}</option>
        <option value="7d">{t(language, "alerts.last7d")}</option>
        <option value="30d">{t(language, "alerts.last30d")}</option>
      </select>
    </div>
  );
}
