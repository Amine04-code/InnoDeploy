"use client";

import { Search } from "lucide-react";
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

const selectClasses = "rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-300 outline-none transition hover:border-white/[0.15] focus:border-cyan-500/40";

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
    <div className="grid gap-3 rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-4 lg:grid-cols-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(language, "alerts.filterSearch")}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 outline-none transition hover:border-white/[0.15] focus:border-cyan-500/40"
        />
      </div>
      <select value={severity} onChange={(e) => onSeverityChange(e.target.value)} className={selectClasses}>
        {severityOptions.map((option) => <option key={option} value={option}>{option === "all" ? t(language, "alerts.allSeverities") : alertSeverityLabel(language, option)}</option>)}
      </select>
      <select value={project} onChange={(e) => onProjectChange(e.target.value)} className={selectClasses}>
        <option value="all">{t(language, "alerts.allProjects")}</option>
        {projects.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select value={ruleType} onChange={(e) => onRuleTypeChange(e.target.value)} className={selectClasses}>
        {ruleOptions.map((option) => <option key={option} value={option}>{option === "all" ? t(language, "alerts.allRules") : alertRuleLabel(language, option)}</option>)}
      </select>
      <select value={dateRange} onChange={(e) => onDateRangeChange(e.target.value)} className={selectClasses}>
        <option value="24h">{t(language, "alerts.last24h")}</option>
        <option value="7d">{t(language, "alerts.last7d")}</option>
        <option value="30d">{t(language, "alerts.last30d")}</option>
      </select>
    </div>
  );
}
