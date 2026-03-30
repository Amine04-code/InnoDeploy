"use client";

import { Server, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { hostStatusLabel, t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import type { Host } from "@/types";

interface HostsListProps {
  hosts: Host[];
  selectedHostId: string | null;
  onSelect: (host: Host) => void;
}

export default function HostsList({ hosts, selectedHostId, onSelect }: HostsListProps) {
  const language = useLanguagePreference();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t(language, "hosts.listTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">{t(language, "hosts.hostname")}</th>
              <th className="pb-2 font-medium">{t(language, "hosts.ip")}</th>
              <th className="pb-2 font-medium">{t(language, "hosts.status")}</th>
              <th className="pb-2 font-medium">{t(language, "hosts.cpu")}</th>
              <th className="pb-2 font-medium">{t(language, "hosts.memory")}</th>
              <th className="pb-2 font-medium">{t(language, "hosts.disk")}</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((host) => (
              <tr
                key={host.id}
                onClick={() => onSelect(host)}
                className={cn(
                  "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50",
                  selectedHostId === host.id && "bg-primary/5"
                )}
              >
                <td className="py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    {host.hostname}
                  </div>
                </td>
                <td className="py-3 font-mono text-xs">{host.ip}</td>
                <td className="py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    host.status === "online" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {host.status === "online" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    {hostStatusLabel(language, host.status)}
                  </span>
                </td>
                <td className="py-3">{host.cpu}%</td>
                <td className="py-3">{host.memory}%</td>
                <td className="py-3">{host.disk}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
