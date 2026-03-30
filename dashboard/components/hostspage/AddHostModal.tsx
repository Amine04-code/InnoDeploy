"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { HostFormData } from "@/types";

interface AddHostModalProps {
  open: boolean;
  onClose: () => void;
  onTestConnection: (data: HostFormData) => Promise<string[]>;
  onSubmit: (data: HostFormData) => Promise<void>;
}

const initialState: HostFormData = {
  hostname: "",
  ip: "",
  sshUser: "root",
  sshPrivateKeyName: "",
};

export default function AddHostModal({ open, onClose, onTestConnection, onSubmit }: AddHostModalProps) {
  const language = useLanguagePreference();
  const [form, setForm] = useState<HostFormData>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("");

  if (!open) return null;

  const update = (key: keyof HostFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    setError("");
    setTestResult(t(language, "hosts.testingSsh"));
    try {
      const output = await onTestConnection(form);
      setTestResult(output.join("\n"));
    } catch (testError: unknown) {
      setError(testError instanceof Error ? testError.message : t(language, "hosts.testFailed"));
      setTestResult("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      setForm(initialState);
      setTestResult("");
      setError("");
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : t(language, "hosts.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border bg-card shadow-xl">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{t(language, "hosts.addModalTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t(language, "hosts.addModalSubtitle")}</p>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hostname">{t(language, "hosts.hostName")}</Label>
            <Input id="hostname" value={form.hostname} onChange={(e) => update("hostname", e.target.value)} placeholder="prod-worker-01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip">{t(language, "hosts.ipAddress")}</Label>
            <Input id="ip" value={form.ip} onChange={(e) => update("ip", e.target.value)} placeholder="10.0.1.22" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssh-user">{t(language, "hosts.sshUser")}</Label>
            <Input id="ssh-user" value={form.sshUser} onChange={(e) => update("sshUser", e.target.value)} placeholder="deploy" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssh-key">{t(language, "hosts.sshKey")}</Label>
            <Input
              id="ssh-key"
              type="file"
              onChange={(e) => update("sshPrivateKeyName", e.target.files?.[0]?.name ?? "")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t(language, "hosts.testOutput")}</Label>
            <div className="min-h-24 rounded-md border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
              {testResult || t(language, "hosts.noTestYet")}
            </div>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={handleTest} disabled={!form.ip || !form.sshUser || !form.sshPrivateKeyName}>{t(language, "hosts.testConnection")}</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>{t(language, "hosts.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={loading || !form.hostname || !form.ip || !form.sshPrivateKeyName}>
              {loading ? t(language, "hosts.adding") : t(language, "hosts.saveHost")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
