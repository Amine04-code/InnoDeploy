"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import AlertDetailDrawer from "@/components/alertspage/AlertDetailDrawer";
import AlertFilterBar from "@/components/alertspage/AlertFilterBar";
import AlertRulesConfig from "@/components/alertspage/AlertRulesConfig";
import AlertsTable from "@/components/alertspage/AlertsTable";
import NotificationTestButton from "@/components/alertspage/NotificationTestButton";
import { alertApi } from "@/lib/apiClient";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";
import { ShieldAlert, Siren, BellRing, Bell, RefreshCcw, CheckCircle2 } from "lucide-react";
import type { AlertRuleConfig, ProjectAlert } from "@/types";

const initialRules: AlertRuleConfig = {
  cpuThreshold: 90,
  memoryThreshold: 95,
  latencyThreshold: 2000,
  availabilityThreshold: 99,
  serviceDownFailures: 5,
  diskThreshold: 85,
  certExpiryDays: 14,
  emailNotifications: true,
  slackNotifications: true,
};

export default function AlertsPage() {
  const isReady = useRequireAuth();
  const [alerts, setAlerts] = useState<ProjectAlert[]>([]);
  const [severity, setSeverity] = useState("all");
  const [project, setProject] = useState("all");
  const [ruleType, setRuleType] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [search, setSearch] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [rules, setRules] = useState<AlertRuleConfig>(initialRules);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const language = useLanguagePreference();

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await alertApi.getAlerts();
      setAlerts(data.alerts as ProjectAlert[]);
      if (data.rules) {
        setRules({ ...initialRules, ...(data.rules as Partial<AlertRuleConfig>) });
      }
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : t(language, "alerts.pageTitle"));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (!isReady) return;
    loadAlerts();
  }, [isReady, loadAlerts]);

  const projects = useMemo(() => Array.from(new Set(alerts.map((alert) => alert.project))), [alerts]);

  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    const rangeMs = dateRange === "24h" ? 24 * 60 * 60 * 1000 : dateRange === "7d" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    return alerts.filter((alert) => {
      if (severity !== "all" && alert.severity !== severity) return false;
      if (project !== "all" && alert.project !== project) return false;
      if (ruleType !== "all" && alert.ruleType !== ruleType) return false;
      if (now - new Date(alert.timestamp).getTime() > rangeMs) return false;
      if (search && !`${alert.project} ${alert.message} ${alert.ruleType}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [alerts, dateRange, project, ruleType, search, severity]);

  const selectedAlert = filteredAlerts.find((alert) => alert.id === selectedAlertId) ?? alerts.find((alert) => alert.id === selectedAlertId) ?? null;

  const statCards = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const warning = alerts.filter((a) => a.severity === "warning").length;
    const info = alerts.filter((a) => a.severity === "info").length;
    const acknowledged = alerts.filter((a) => a.status === "acknowledged" || a.status === "resolved").length;
    return [
      { label: "Critical", value: critical, icon: Siren, color: "text-rose-400", borderColor: "border-rose-500/20", gradient: "from-rose-500/20 to-rose-500/5" },
      { label: "Warning", value: warning, icon: BellRing, color: "text-amber-400", borderColor: "border-amber-500/20", gradient: "from-amber-500/20 to-amber-500/5" },
      { label: "Info", value: info, icon: Bell, color: "text-blue-400", borderColor: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-500/5" },
      { label: "Acknowledged", value: acknowledged, icon: CheckCircle2, color: "text-emerald-400", borderColor: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-500/5" },
    ];
  }, [alerts]);

  if (!isReady) return null;

  const handleAcknowledge = async (alertId: string) => {
    const { data } = await alertApi.acknowledgeAlert(alertId);
    const updatedAlert = data.alert as ProjectAlert;
    setAlerts((prev) => prev.map((alert) => alert.id === alertId ? updatedAlert : alert));
  };

  const handleNotificationTest = async () => {
    const { data } = await alertApi.testNotification();
    if (typeof window !== "undefined") {
        const formatted = new Date(data.sentAt as string).toLocaleString(localeFromLanguage(language));
        window.alert(t(language, "alerts.notificationSentAt", { time: formatted }));
    }
  };

  const handleRulesChange = async (nextRules: AlertRuleConfig) => {
    setRules(nextRules);
    try {
      await alertApi.updateRules(nextRules);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : t(language, "alerts.rulesTitle"));
    }
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, "alerts.pageTitle")}</h1>
                <p className="text-sm text-slate-500">{t(language, "alerts.pageSubtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void loadAlerts()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <NotificationTestButton onTest={handleNotificationTest} />
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

          <div className="relative">
            <AlertFilterBar
              severity={severity}
              project={project}
              ruleType={ruleType}
              dateRange={dateRange}
              search={search}
              projects={projects}
              onSeverityChange={setSeverity}
              onProjectChange={setProject}
              onRuleTypeChange={setRuleType}
              onDateRangeChange={setDateRange}
              onSearchChange={setSearch}
            />
          </div>

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {loading ? (
              <div className="rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 px-4 py-10 text-center text-sm text-slate-500">{t(language, "alerts.loading")}</div>
            ) : (
              <AlertsTable
                alerts={filteredAlerts}
                selectedAlertId={selectedAlertId}
                onSelect={(alert) => setSelectedAlertId(alert.id)}
              />
            )}
            <AlertRulesConfig value={rules} onChange={handleRulesChange} />
          </div>
        </main>
      </div>

      <AlertDetailDrawer
        alert={selectedAlert}
        open={selectedAlert !== null}
        onClose={() => setSelectedAlertId(null)}
        onAcknowledge={handleAcknowledge}
      />
    </div>
  );
}
