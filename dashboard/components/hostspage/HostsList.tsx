"use client";

import { Server, Wifi, WifiOff, Circle } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { hostStatusLabel, t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import type { Host } from "@/types";

interface HostsListProps {
  hosts: Host[];
  selectedHostId: string | null;
  onSelect: (host: Host) => void;
}

function UsageBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-white/[0.06]">
        <div className={cn("h-1.5 rounded-full transition-all", tone)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-slate-500 font-mono w-8">{value}%</span>
    </div>
  );
}

export default function HostsList({ hosts, selectedHostId, onSelect }: HostsListProps) {
  const language = useLanguagePreference();
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60">
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t(language, "hosts.listTitle")}</h2>
        <span className="text-xs text-slate-600">{hosts.length} host{hosts.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left">
              <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "hosts.hostname")}</th>
              <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "hosts.ip")}</th>
              <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "hosts.status")}</th>
              <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "hosts.cpu")}</th>
              <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "hosts.memory")}</th>
              <th className="pb-3 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "hosts.disk")}</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((host) => (
              <tr
                key={host.id}
                onClick={() => onSelect(host)}
                className={cn(
                  "cursor-pointer border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]",
                  selectedHostId === host.id && "bg-cyan-500/[0.04] border-cyan-500/10"
                )}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-slate-600" />
                    <span className="font-medium text-slate-200">{host.hostname}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-slate-400">{host.ip}</td>
                <td className="py-3 pr-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    host.status === "online"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-slate-500 bg-slate-500/10 border-slate-500/20"
                  )}>
                    {host.status === "online" ? <Circle className="h-1.5 w-1.5 fill-emerald-400 animate-pulse" /> : <WifiOff className="h-3 w-3" />}
                    {hostStatusLabel(language, host.status)}
                  </span>
                </td>
                <td className="py-3 pr-4"><UsageBar value={host.cpu} tone={host.cpu > 80 ? "bg-rose-500" : "bg-cyan-500"} /></td>
                <td className="py-3 pr-4"><UsageBar value={host.memory} tone={host.memory > 80 ? "bg-rose-500" : "bg-emerald-500"} /></td>
                <td className="py-3"><UsageBar value={host.disk} tone={host.disk > 80 ? "bg-rose-500" : "bg-amber-500"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
