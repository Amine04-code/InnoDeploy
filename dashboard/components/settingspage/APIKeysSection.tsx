"use client";

import { useState } from "react";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { OrganisationApiKey } from "@/types";

interface APIKeysSectionProps {
  apiKeys: OrganisationApiKey[];
  canManage: boolean;
  creating: boolean;
  onCreate: (name: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  revealedSecret: string | null;
}

export default function APIKeysSection({ apiKeys, canManage, creating, onCreate, onRevoke, revealedSecret }: APIKeysSectionProps) {
  const language = useLanguagePreference();
  const [name, setName] = useState("CLI access");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t(language, "apiKeys.title")}</CardTitle>
        <CardDescription>{t(language, "apiKeys.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {canManage && (
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">{t(language, "apiKeys.keyName")}</Label>
              <Input id="api-key-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <Button onClick={() => void onCreate(name)} disabled={creating || !name.trim()}>
              <KeyRound className="mr-2 h-4 w-4" />
              {creating ? t(language, "apiKeys.generating") : t(language, "apiKeys.generate")}
            </Button>
          </div>
        )}

        {revealedSecret && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="mb-2 font-medium">{t(language, "apiKeys.copyNow")}</div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded bg-white px-2 py-1 text-xs text-foreground">{revealedSecret}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void navigator.clipboard.writeText(revealedSecret)}
              >
                <Copy className="mr-2 h-4 w-4" />
                {t(language, "apiKeys.copy")}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(language, "apiKeys.none")}</p>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{apiKey.name}</div>
                  <div className="text-muted-foreground">
                    {apiKey.prefix} · {t(language, "apiKeys.created")} {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.revokedAt ? ` · ${t(language, "apiKeys.revoked")} ${new Date(apiKey.revokedAt).toLocaleDateString()}` : ` · ${t(language, "apiKeys.active")}`}
                  </div>
                </div>
                {canManage && !apiKey.revokedAt && (
                  <Button variant="ghost" size="sm" onClick={() => void onRevoke(apiKey.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t(language, "apiKeys.revoke")}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}