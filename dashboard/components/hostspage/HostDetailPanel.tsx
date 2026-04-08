"use client";

import { HardDrive, MemoryStick, MonitorCog, Server, Cpu, Circle } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import TestConnectionButton from "./TestConnectionButton";
import RemoveHostButton from "./RemoveHostButton";
import type { Host } from "@/types";

interface HostDetailPanelProps {
  host: Host;
  onTest: (hostId: string) => Promise<void>;
  onRemove: (hostId: string) => Promise<void>;
}

function Gauge({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  const barColor = value > 80 ? "bg-rose-500" : color;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-500">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className={cn("font-mono font-medium", value > 80 ? "text-rose-400" : "text-slate-300")}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06]">
        <div className={cn("h-2 rounded-full transition-all duration-500", barColor)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function HostDetailPanel({ host, onTest, onRemove }: HostDetailPanelProps) {
  const language = useLanguagePreference();
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{host.hostname}</h2>
            <p className="mt-1 text-sm text-slate-500">
              <span className="font-mono">{host.sshUser}@{host.ip}</span>
              {host.os && <> · {host.os}</>}
              {host.dockerVersion && <> · Docker {host.dockerVersion}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <TestConnectionButton hostId={host.id} onTest={onTest} />
            <RemoveHostButton hostId={host.id} onRemove={onRemove} disabled={host.activeDeployments > 0} />
          </div>
        </div>
        {host.activeDeployments > 0 && (
          <p className="mt-2 text-xs text-amber-400">{t(language, "hosts.removeBlocked", { count: String(host.activeDeployments), suffix: host.activeDeployments > 1 ? "s" : "" })}</p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Gauges */}
        <div className="grid gap-6 md:grid-cols-3">
          <Gauge label="CPU" value={host.cpu} color="bg-cyan-500" icon={Cpu} />
          <Gauge label={t(language, "hosts.memory")} value={host.memory} color="bg-emerald-500" icon={MemoryStick} />
          <Gauge label={t(language, "hosts.disk")} value={host.disk} color="bg-amber-500" icon={HardDrive} />
        </div>

        {/* Info cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <MonitorCog className="h-3.5 w-3.5 text-cyan-400" /> OS
            </div>
            <p className="mt-2 text-sm text-slate-300">{host.os || "Unknown"}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Server className="h-3.5 w-3.5 text-violet-400" /> Docker
            </div>
            <p className="mt-2 text-sm text-slate-300">{host.dockerVersion || "Not detected"}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <MemoryStick className="h-3.5 w-3.5 text-emerald-400" /> {t(language, "hosts.activeDeployments")}
            </div>
            <p className="mt-2 text-sm text-slate-300">{host.activeDeployments}</p>
          </div>
        </div>

        {/* Containers */}
        {host.containers && host.containers.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-400">
              <HardDrive className="h-4 w-4 text-slate-600" />
              {t(language, "hosts.deployedContainers")}
              <span className="text-xs text-slate-600">({host.containers.length})</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {host.containers.map((container) => (
                <div key={container.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate">{container.name}</p>
                      <p className="text-xs text-slate-600 font-mono truncate">{container.image}</p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      container.status === "running"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-slate-500 bg-slate-500/10 border-slate-500/20"
                    )}>
                      <Circle className={cn("h-1.5 w-1.5 fill-current", container.status === "running" && "animate-pulse")} />
                      {container.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
