"use client";

import { HardDrive, MemoryStick, MonitorCog, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function Gauge({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={cn("h-2 rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function HostDetailPanel({ host, onTest, onRemove }: HostDetailPanelProps) {
  const language = useLanguagePreference();
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{host.hostname}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{host.os} · Docker {host.dockerVersion} · {host.sshUser}@{host.ip}</p>
          </div>
          <div className="flex gap-2">
            <TestConnectionButton hostId={host.id} onTest={onTest} />
            <RemoveHostButton hostId={host.id} onRemove={onRemove} disabled={host.activeDeployments > 0} />
          </div>
        </div>
        {host.activeDeployments > 0 && (
          <p className="text-xs text-amber-600">{t(language, "hosts.removeBlocked", { count: String(host.activeDeployments), suffix: host.activeDeployments > 1 ? "s" : "" })}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Gauge label="CPU" value={host.cpu} tone="bg-blue-500" />
          <Gauge label={t(language, "hosts.memory")} value={host.memory} tone="bg-emerald-500" />
          <Gauge label={t(language, "hosts.disk")} value={host.disk} tone="bg-amber-500" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><MonitorCog className="h-4 w-4 text-muted-foreground" /> OS</div>
            <p className="mt-2 text-sm text-muted-foreground">{host.os}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><Server className="h-4 w-4 text-muted-foreground" /> Docker</div>
            <p className="mt-2 text-sm text-muted-foreground">{host.dockerVersion}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><MemoryStick className="h-4 w-4 text-muted-foreground" /> {t(language, "hosts.activeDeployments")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{host.activeDeployments}</p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            {t(language, "hosts.deployedContainers")}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {host.containers.map((container) => (
              <div key={container.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{container.name}</p>
                    <p className="text-xs text-muted-foreground">{container.image}</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    container.status === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {container.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
