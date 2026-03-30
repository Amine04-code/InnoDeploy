"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { OrganisationSettingsProfile } from "@/types";

interface OrgProfileFormProps {
  value: OrganisationSettingsProfile;
  onChange: (value: OrganisationSettingsProfile) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
  disabled?: boolean;
}

export default function OrgProfileForm({ value, onChange, onSubmit, saving, disabled }: OrgProfileFormProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t(language, "org.title")}</CardTitle>
        <CardDescription>{t(language, "org.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="org-name">{t(language, "org.name")}</Label>
            <Input
              id="org-name"
              value={value.name}
              disabled={disabled}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">{t(language, "org.slug")}</Label>
            <Input
              id="org-slug"
              value={value.slug}
              disabled={disabled}
              onChange={(event) => onChange({ ...value, slug: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="billing-email">{t(language, "org.billingEmail")}</Label>
            <Input
              id="billing-email"
              type="email"
              value={value.billingInfo.contactEmail}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  billingInfo: { ...value.billingInfo, contactEmail: event.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-id">{t(language, "org.taxId")}</Label>
            <Input
              id="tax-id"
              value={value.billingInfo.taxId}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  billingInfo: { ...value.billingInfo, taxId: event.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-address">{t(language, "org.companyAddress")}</Label>
          <textarea
            id="company-address"
            rows={4}
            disabled={disabled}
            value={value.billingInfo.companyAddress}
            onChange={(event) =>
              onChange({
                ...value,
                billingInfo: { ...value.billingInfo, companyAddress: event.target.value },
              })
            }
            className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">{t(language, "org.currentPlan")}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium capitalize text-primary">{value.plan}</span>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => void onSubmit()} disabled={disabled || saving}>
            {saving ? t(language, "settings.saving") : t(language, "org.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}