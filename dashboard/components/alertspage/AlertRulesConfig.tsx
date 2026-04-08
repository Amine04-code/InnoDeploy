"use client";

import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { Cpu, HardDrive, Gauge, Globe, ServerCrash, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import type { AlertRuleConfig } from "@/types";

interface AlertRulesConfigProps {
  value: AlertRuleConfig;
  onChange: (value: AlertRuleConfig) => void;
}

const inputClasses = "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 outline-none transition hover:border-white/[0.15] focus:border-cyan-500/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export default function AlertRulesConfig({ value, onChange }: AlertRulesConfigProps) {
  const language = useLanguagePreference();

  const updateNumber = (key: keyof AlertRuleConfig, raw: string) => {
    onChange({ ...value, [key]: Number(raw) });
  };

  const updateBoolean = (key: keyof AlertRuleConfig, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  const fields = [
    { key: "cpuThreshold" as const, label: "CPU threshold (%)", icon: Cpu, color: "text-cyan-400" },
    { key: "memoryThreshold" as const, label: "Memory threshold (%)", icon: HardDrive, color: "text-violet-400" },
    { key: "latencyThreshold" as const, label: "Latency threshold (ms)", icon: Gauge, color: "text-amber-400" },
    { key: "availabilityThreshold" as const, label: "Availability threshold (%)", icon: Globe, color: "text-emerald-400" },
    { key: "serviceDownFailures" as const, label: "Service down failures", icon: ServerCrash, color: "text-rose-400" },
    { key: "diskThreshold" as const, label: "Disk threshold (%)", icon: HardDrive, color: "text-orange-400" },
    { key: "certExpiryDays" as const, label: "Certificate expiry days", icon: ShieldCheck, color: "text-blue-400" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 h-fit">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <h2 className="text-lg font-semibold text-white">{t(language, "alerts.rulesTitle")}</h2>
      </div>
      <div className="p-5 space-y-4">
        {fields.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              {label}
            </label>
            <input
              type="number"
              value={value[key] as number}
              onChange={(e) => updateNumber(key, e.target.value)}
              className={inputClasses}
            />
          </div>
        ))}

        <div className="border-t border-white/[0.06] pt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={value.emailNotifications}
                onChange={(e) => updateBoolean("emailNotifications", e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] transition peer-checked:bg-cyan-500/20 peer-checked:border-cyan-500/30" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-500 transition peer-checked:translate-x-4 peer-checked:bg-cyan-400" />
            </div>
            <span className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition">
              <Mail className="h-3.5 w-3.5" />
              Email notifications
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={value.slackNotifications}
                onChange={(e) => updateBoolean("slackNotifications", e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full border border-white/[0.08] bg-white/[0.03] transition peer-checked:bg-cyan-500/20 peer-checked:border-cyan-500/30" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-500 transition peer-checked:translate-x-4 peer-checked:bg-cyan-400" />
            </div>
            <span className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition">
              <MessageSquare className="h-3.5 w-3.5" />
              Slack notifications
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
