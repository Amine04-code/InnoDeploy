"use client";

import { useState } from "react";
import { X } from "lucide-react";
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

function ModalInput({ id, type = "text", value, onChange, placeholder }: { id: string; type?: string; value?: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string }) {
  return (
    <input
      id={id}
      type={type}
      value={type === "file" ? undefined : value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 file:mr-3 file:rounded-md file:border-0 file:bg-white/[0.06] file:px-3 file:py-1 file:text-xs file:text-slate-400"
    />
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/[0.06] bg-[#0a1628] shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t(language, "hosts.addModalTitle")}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t(language, "hosts.addModalSubtitle")}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="hostname" className="text-xs font-medium text-slate-400">{t(language, "hosts.hostName")}</label>
            <ModalInput id="hostname" value={form.hostname} onChange={(e) => update("hostname", e.target.value)} placeholder="prod-worker-01" />
          </div>
          <div className="space-y-2">
            <label htmlFor="ip" className="text-xs font-medium text-slate-400">{t(language, "hosts.ipAddress")}</label>
            <ModalInput id="ip" value={form.ip} onChange={(e) => update("ip", e.target.value)} placeholder="10.0.1.22" />
          </div>
          <div className="space-y-2">
            <label htmlFor="ssh-user" className="text-xs font-medium text-slate-400">{t(language, "hosts.sshUser")}</label>
            <ModalInput id="ssh-user" value={form.sshUser} onChange={(e) => update("sshUser", e.target.value)} placeholder="deploy" />
          </div>
          <div className="space-y-2">
            <label htmlFor="ssh-key" className="text-xs font-medium text-slate-400">{t(language, "hosts.sshKey")}</label>
            <ModalInput id="ssh-key" type="file" onChange={(e) => update("sshPrivateKeyName", e.target.files?.[0]?.name ?? "")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-slate-400">{t(language, "hosts.testOutput")}</label>
            <div className="min-h-24 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-xs text-slate-500 whitespace-pre-wrap">
              {testResult || t(language, "hosts.noTestYet")}
            </div>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={handleTest}
            disabled={!form.ip || !form.sshUser || !form.sshPrivateKeyName}
            className="rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/10 disabled:opacity-40 disabled:pointer-events-none"
          >
            {t(language, "hosts.testConnection")}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-300">
              {t(language, "hosts.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.hostname || !form.ip || !form.sshPrivateKeyName}
              className="rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? t(language, "hosts.adding") : t(language, "hosts.saveHost")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
