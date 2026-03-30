"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { AlertRuleConfig } from "@/types";

interface AlertRulesConfigProps {
  value: AlertRuleConfig;
  onChange: (value: AlertRuleConfig) => void;
}

export default function AlertRulesConfig({ value, onChange }: AlertRulesConfigProps) {
  const language = useLanguagePreference();

  const updateNumber = (key: keyof AlertRuleConfig, raw: string) => {
    onChange({ ...value, [key]: Number(raw) });
  };

  const updateBoolean = (key: keyof AlertRuleConfig, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t(language, "alerts.rulesTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cpu-threshold">CPU threshold (%)</Label>
          <Input id="cpu-threshold" type="number" value={value.cpuThreshold} onChange={(e) => updateNumber("cpuThreshold", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memory-threshold">Memory threshold (%)</Label>
          <Input id="memory-threshold" type="number" value={value.memoryThreshold} onChange={(e) => updateNumber("memoryThreshold", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="latency-threshold">Latency threshold (ms)</Label>
          <Input id="latency-threshold" type="number" value={value.latencyThreshold} onChange={(e) => updateNumber("latencyThreshold", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability-threshold">Availability threshold (%)</Label>
          <Input id="availability-threshold" type="number" value={value.availabilityThreshold} onChange={(e) => updateNumber("availabilityThreshold", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-down-failures">Service down failures</Label>
          <Input id="service-down-failures" type="number" value={value.serviceDownFailures} onChange={(e) => updateNumber("serviceDownFailures", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disk-threshold">Disk threshold (%)</Label>
          <Input id="disk-threshold" type="number" value={value.diskThreshold} onChange={(e) => updateNumber("diskThreshold", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cert-expiry-days">Certificate expiry days</Label>
          <Input id="cert-expiry-days" type="number" value={value.certExpiryDays} onChange={(e) => updateNumber("certExpiryDays", e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={value.emailNotifications} onChange={(e) => updateBoolean("emailNotifications", e.target.checked)} />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={value.slackNotifications} onChange={(e) => updateBoolean("slackNotifications", e.target.checked)} />
          Slack notifications
        </label>
      </CardContent>
    </Card>
  );
}
