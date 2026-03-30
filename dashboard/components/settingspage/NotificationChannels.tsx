"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { NotificationChannelsConfig } from "@/types";

interface NotificationChannelsProps {
  value: NotificationChannelsConfig;
  onChange: (value: NotificationChannelsConfig) => void;
  onSubmit: () => Promise<void>;
  onTest: (channels?: string[]) => Promise<void>;
  saving: boolean;
  testing?: boolean;
  disabled?: boolean;
}

const parseListInput = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseHeadersInput = (value: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const raw = value.trim();

  if (!raw) return result;

  const pairs = raw.split(",").map((entry) => entry.trim()).filter(Boolean);
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf(":");
    if (separatorIndex <= 0) continue;
    const key = pair.slice(0, separatorIndex).trim();
    const val = pair.slice(separatorIndex + 1).trim();
    if (!key) continue;
    result[key] = val;
  }

  return result;
};

export default function NotificationChannels({ value, onChange, onSubmit, onTest, saving, testing = false, disabled }: NotificationChannelsProps) {
  const language = useLanguagePreference();
  const emailRecipientsInput = useMemo(() => value.emailRecipients.join(", "), [value.emailRecipients]);
  const expoTokensInput = useMemo(() => value.expoPushTokens.join(", "), [value.expoPushTokens]);
  const webhookHeadersInput = useMemo(
    () => Object.entries(value.webhookHeaders || {}).map(([key, val]) => `${key}: ${val}`).join(", "),
    [value.webhookHeaders]
  );

  const update = (next: Partial<NotificationChannelsConfig>) => onChange({ ...value, ...next });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t(language, "notifications.title")}</CardTitle>
        <CardDescription>{t(language, "notifications.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.emailEnabled} disabled={disabled} onChange={(event) => update({ emailEnabled: event.target.checked })} />
            {t(language, "members.email")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.slackEnabled} disabled={disabled} onChange={(event) => update({ slackEnabled: event.target.checked })} />
            {t(language, "notifications.slack")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.discordEnabled} disabled={disabled} onChange={(event) => update({ discordEnabled: event.target.checked })} />
            {t(language, "notifications.discord")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.expoEnabled} disabled={disabled} onChange={(event) => update({ expoEnabled: event.target.checked })} />
            {t(language, "notifications.expo")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.webhookEnabled} disabled={disabled} onChange={(event) => update({ webhookEnabled: event.target.checked })} />
            {t(language, "notifications.webhook")}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slack-webhook">{t(language, "notifications.slackWebhook")}</Label>
            <Input id="slack-webhook" value={value.slackWebhook} disabled={disabled} onChange={(event) => update({ slackWebhook: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discord-webhook">{t(language, "notifications.discordWebhook")}</Label>
            <Input id="discord-webhook" value={value.discordWebhook} disabled={disabled} onChange={(event) => update({ discordWebhook: event.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">{t(language, "notifications.smtpHost")}</Label>
            <Input id="smtp-host" value={value.smtpHost} disabled={disabled} onChange={(event) => update({ smtpHost: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">{t(language, "notifications.smtpPort")}</Label>
            <Input id="smtp-port" type="number" value={String(value.smtpPort)} disabled={disabled} onChange={(event) => update({ smtpPort: Number(event.target.value) || 0 })} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="smtp-user">{t(language, "notifications.smtpUsername")}</Label>
            <Input id="smtp-user" value={value.smtpUsername} disabled={disabled} onChange={(event) => update({ smtpUsername: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-password">{t(language, "notifications.smtpPassword")}</Label>
            <Input id="smtp-password" type="password" value={value.smtpPassword} disabled={disabled} onChange={(event) => update({ smtpPassword: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-from">{t(language, "notifications.smtpFrom")}</Label>
            <Input id="smtp-from" type="email" value={value.smtpFromEmail} disabled={disabled} onChange={(event) => update({ smtpFromEmail: event.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email-recipients">{t(language, "notifications.emailRecipients")}</Label>
            <Input
              id="email-recipients"
              value={emailRecipientsInput}
              disabled={disabled}
              onChange={(event) => update({ emailRecipients: parseListInput(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expo-access-token">{t(language, "notifications.expoAccessToken")}</Label>
            <Input
              id="expo-access-token"
              type="password"
              value={value.expoAccessToken}
              disabled={disabled}
              onChange={(event) => update({ expoAccessToken: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="expo-push-tokens">{t(language, "notifications.expoPushTokens")}</Label>
            <Input
              id="expo-push-tokens"
              value={expoTokensInput}
              disabled={disabled}
              onChange={(event) => update({ expoPushTokens: parseListInput(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">{t(language, "notifications.webhookUrl")}</Label>
            <Input
              id="webhook-url"
              value={value.webhookUrl}
              disabled={disabled}
              onChange={(event) => update({ webhookUrl: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-headers">{t(language, "notifications.webhookHeaders")}</Label>
          <Input
            id="webhook-headers"
            value={webhookHeadersInput}
            disabled={disabled}
            onChange={(event) => update({ webhookHeaders: parseHeadersInput(event.target.value) })}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {t(language, "notifications.maskedHint")}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void onTest()} disabled={disabled || testing}>{t(language, "notifications.testEnabled")}</Button>
            <Button variant="outline" onClick={() => void onTest(["email"])} disabled={disabled || testing}>{t(language, "notifications.testEmail")}</Button>
            <Button variant="outline" onClick={() => void onTest(["slack"])} disabled={disabled || testing}>{t(language, "notifications.testSlack")}</Button>
            <Button variant="outline" onClick={() => void onTest(["discord"])} disabled={disabled || testing}>{t(language, "notifications.testDiscord")}</Button>
            <Button variant="outline" onClick={() => void onTest(["expo"])} disabled={disabled || testing}>{t(language, "notifications.testExpo")}</Button>
            <Button variant="outline" onClick={() => void onTest(["webhook"])} disabled={disabled || testing}>{t(language, "notifications.testWebhook")}</Button>
          </div>

          <Button onClick={() => void onSubmit()} disabled={disabled || saving || testing}>
            {saving ? t(language, "settings.saving") : t(language, "notifications.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}