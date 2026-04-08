"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import AddHostButton from "@/components/hostspage/AddHostButton";
import AddHostModal from "@/components/hostspage/AddHostModal";
import HostDetailPanel from "@/components/hostspage/HostDetailPanel";
import HostsList from "@/components/hostspage/HostsList";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { hostApi } from "@/lib/apiClient";
import { t } from "@/lib/settingsI18n";
import { Server, Wifi, WifiOff, HardDrive, RefreshCcw } from "lucide-react";
import type { Host, HostFormData } from "@/types";

export default function HostsPage() {
  const language = useLanguagePreference();
  const isReady = useRequireAuth();
  const searchParams = useSearchParams();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [requestedHostId, setRequestedHostId] = useState<string | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedHost = useMemo(
    () => hosts.find((host) => host.id === selectedHostId) ?? hosts[0] ?? null,
    [hosts, selectedHostId]
  );

  const loadHosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await hostApi.getHosts();
      const nextHosts = data.hosts as Host[];
      setHosts(nextHosts);
      setSelectedHostId((prev) => prev ?? nextHosts[0]?.id ?? null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load hosts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    loadHosts();
  }, [isReady, loadHosts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextHostId = new URLSearchParams(window.location.search).get("hostId");
    setRequestedHostId(nextHostId);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (searchParams.get("add") === "1") {
      setModalOpen(true);
    }
  }, [isReady, searchParams]);

  useEffect(() => {
    if (!requestedHostId || hosts.length === 0) {
      return;
    }

    if (hosts.some((host) => host.id === requestedHostId)) {
      setSelectedHostId(requestedHostId);
    }
  }, [requestedHostId, hosts]);

  const statCards = useMemo(() => {
    const online = hosts.filter((h) => h.status === "online").length;
    const offline = hosts.filter((h) => h.status === "offline").length;
    const totalContainers = hosts.reduce((sum, h) => sum + (h.containers?.length || 0), 0);
    return [
      { label: "Total Hosts", value: hosts.length, icon: Server, color: "text-cyan-400", borderColor: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-500/5" },
      { label: "Online", value: online, icon: Wifi, color: "text-emerald-400", borderColor: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-500/5" },
      { label: "Offline", value: offline, icon: WifiOff, color: "text-rose-400", borderColor: "border-rose-500/20", gradient: "from-rose-500/20 to-rose-500/5" },
      { label: "Containers", value: totalContainers, icon: HardDrive, color: "text-violet-400", borderColor: "border-violet-500/20", gradient: "from-violet-500/20 to-violet-500/5" },
    ];
  }, [hosts]);

  if (!isReady) return null;

  const handleAddHost = async (data: HostFormData) => {
    setError(null);
    const { data: response } = await hostApi.createHost(data);
    const newHost = response.host as Host;
    setHosts((prev) => [newHost, ...prev]);
    setSelectedHostId(newHost.id);
    setModalOpen(false);
  };

  const handleDraftConnectionTest = async (data: HostFormData) => {
    const { data: response } = await hostApi.testDraftConnection({
      ip: data.ip,
      sshUser: data.sshUser,
      sshPrivateKeyName: data.sshPrivateKeyName,
    });
    return response.output as string[];
  };

  const handleTestConnection = async (hostId: string) => {
    setError(null);
    const { data } = await hostApi.testConnection(hostId);
    if (typeof window !== "undefined") {
      window.alert((data.output as string[]).join("\n"));
    }
  };

  const handleRemoveHost = async (hostId: string) => {
    setError(null);
    await hostApi.removeHost(hostId);
    setHosts((prev) => {
      const next = prev.filter((host) => host.id !== hostId);
      if (selectedHostId === hostId && next.length > 0) {
        setSelectedHostId(next[0].id);
      } else if (next.length === 0) {
        setSelectedHostId(null);
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#030711]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="relative flex-1 space-y-6 p-6 overflow-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.06),transparent)]" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
                <Server className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, "hosts.pageTitle")}</h1>
                <p className="text-sm text-slate-500">{t(language, "hosts.pageSubtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void loadHosts()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <AddHostButton onClick={() => setModalOpen(true)} />
            </div>
          </div>

          {error && (
            <div className="relative rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300 backdrop-blur-sm">{error}</div>
          )}

          {/* Stat cards */}
          <div className="relative grid gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] animate-rise-fade"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b ${stat.gradient.replace('/20', '/60').replace('/5', '/30')}`} />
                <div className="relative flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.borderColor} bg-white/[0.03]`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="relative mt-3 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="relative rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 px-4 py-10 text-center text-sm text-slate-500">
              <RefreshCcw className="mx-auto h-6 w-6 text-cyan-400 animate-spin mb-3" />
              {t(language, "hosts.loading")}
            </div>
          ) : hosts.length === 0 ? (
            <div className="relative rounded-2xl border border-white/[0.06] bg-[#0a1628]/40 px-4 py-16 text-center">
              <Server className="mx-auto h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">{t(language, "hosts.empty")}</p>
              <p className="text-xs text-slate-600 mt-1">Click &quot;Add Host&quot; to register your first deployment node.</p>
            </div>
          ) : (
            <div className="relative">
              <HostsList hosts={hosts} selectedHostId={selectedHost?.id ?? null} onSelect={(host) => setSelectedHostId(host.id)} />
            </div>
          )}

          {selectedHost && (
            <div className="relative">
              <HostDetailPanel host={selectedHost} onTest={handleTestConnection} onRemove={handleRemoveHost} />
            </div>
          )}
        </main>
      </div>

      <AddHostModal open={modalOpen} onClose={() => setModalOpen(false)} onTestConnection={handleDraftConnectionTest} onSubmit={handleAddHost} />
    </div>
  );
}
