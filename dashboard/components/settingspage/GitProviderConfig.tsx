"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { providerLabel, t } from "@/lib/settingsI18n";
import type { GitProviderOption, GitProviderSettings } from "@/types";

interface GitProviderConfigProps {
  value: GitProviderSettings;
  onChange: (value: GitProviderSettings) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
  disabled?: boolean;
}

const providers: GitProviderOption[] = ["none", "github", "gitlab", "bitbucket"];

export default function GitProviderConfig({ value, onChange, onSubmit, saving, disabled }: GitProviderConfigProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t(language, "provider.title")}</CardTitle>
        <CardDescription>{t(language, "provider.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="git-provider">{t(language, "provider.provider")}</Label>
            <select
              id="git-provider"
              value={value.provider}
              disabled={disabled}
              onChange={(event) => onChange({ ...value, provider: event.target.value as GitProviderOption })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {providerLabel(language, provider)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo-owner">{t(language, "provider.owner")}</Label>
            <Input id="repo-owner" value={value.repositoryOwner} disabled={disabled} onChange={(event) => onChange({ ...value, repositoryOwner: event.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="installation-url">{t(language, "provider.installationUrl")}</Label>
          <Input id="installation-url" value={value.installationUrl} disabled={disabled} onChange={(event) => onChange({ ...value, installationUrl: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhook-secret">{t(language, "provider.webhookSecret")}</Label>
          <Input id="webhook-secret" type="password" value={value.webhookSecret} disabled={disabled} onChange={(event) => onChange({ ...value, webhookSecret: event.target.value })} />
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          {t(language, "provider.webhookGuide", { provider: value.provider === "none" ? "provider" : value.provider })}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => void onSubmit()} disabled={disabled || saving}>
            {saving ? t(language, "settings.saving") : t(language, "provider.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}