"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import AddHostButton from "@/components/hostspage/AddHostButton";
import AddHostModal from "@/components/hostspage/AddHostModal";
import HostDetailPanel from "@/components/hostspage/HostDetailPanel";
import HostsList from "@/components/hostspage/HostsList";
import { hostApi } from "@/lib/apiClient";
import type { Host, HostFormData } from "@/types";

export default function HostsPage() {
  const isReady = useRequireAuth();
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

  useEffect(() => {
    if (!isReady) return;

    const loadHosts = async () => {
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
    };

    loadHosts();
  }, [isReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextHostId = new URLSearchParams(window.location.search).get("hostId");
    setRequestedHostId(nextHostId);
  }, []);

  useEffect(() => {
    if (!requestedHostId || hosts.length === 0) {
      return;
    }

    if (hosts.some((host) => host.id === requestedHostId)) {
      setSelectedHostId(requestedHostId);
    }
  }, [requestedHostId, hosts]);

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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Hosts</h1>
              <p className="text-sm text-muted-foreground">Manage deployment nodes, inspect capacity, and verify SSH connectivity.</p>
            </div>
            <AddHostButton onClick={() => setModalOpen(true)} />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">Loading hosts...</div>
          ) : hosts.length === 0 ? (
            <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">No hosts yet. Add your first deployment host.</div>
          ) : (
            <HostsList hosts={hosts} selectedHostId={selectedHost?.id ?? null} onSelect={(host) => setSelectedHostId(host.id)} />
          )}

          {selectedHost && (
            <HostDetailPanel host={selectedHost} onTest={handleTestConnection} onRemove={handleRemoveHost} />
          )}
        </main>
      </div>

      <AddHostModal open={modalOpen} onClose={() => setModalOpen(false)} onTestConnection={handleDraftConnectionTest} onSubmit={handleAddHost} />
    </div>
  );
}
