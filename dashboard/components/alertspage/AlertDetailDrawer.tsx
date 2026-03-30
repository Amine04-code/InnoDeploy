"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { alertRuleLabel, localeFromLanguage, t } from "@/lib/settingsI18n";
import AcknowledgeButton from "./AcknowledgeButton";
import type { ProjectAlert } from "@/types";

interface AlertDetailDrawerProps {
  alert: ProjectAlert | null;
  open: boolean;
  onClose: () => void;
  onAcknowledge: (alertId: string) => Promise<void>;
}

export default function AlertDetailDrawer({ alert, open, onClose, onAcknowledge }: AlertDetailDrawerProps) {
  const language = useLanguagePreference();
  if (!open || !alert) return null;

  const chartData = Array.from({ length: 12 }, (_, index) => ({
    point: `${index * 5}m`,
    value: alert.metricAtTrigger[0].value * (0.75 + index * 0.04),
  }));

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl border-l bg-card shadow-2xl">
      <div className="flex min-h-full w-full flex-col">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{t(language, "alerts.detailTitle")}</h2>
            <p className="text-sm text-muted-foreground">{alert.project} · {alertRuleLabel(language, alert.ruleType)} · {new Date(alert.timestamp).toLocaleString(localeFromLanguage(language))}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</p>
            <p className="mt-2 text-sm leading-6">{alert.message}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {alert.metricAtTrigger.map((metric) => (
              <div key={metric.label} className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold">{metric.value}{metric.unit}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">{t(language, "alerts.metricAtTrigger")}</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="point" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground capitalize">{t(language, "alerts.statusPrefix", { status: alert.status })}</p>
          <AcknowledgeButton alertId={alert.id} disabled={alert.status !== "open"} onAcknowledge={onAcknowledge} />
        </div>
      </div>
    </div>
  );
}
