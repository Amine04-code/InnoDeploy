"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCcw,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Rocket,
  Server,
  User,
} from "lucide-react";
import DeployActivityChart from "@/components/homepage/DeployActivityChart";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { projectApi } from "@/lib/apiClient";
import type { Project } from "@/types";

type DeploymentRecord = {
  id: string;
  projectId: string;
  projectName: string;
  version: string;
  strategy: string;
  runType: "deployment" | "rollback";
  status: "success" | "failed" | "in-progress";
  environment: string;
  triggeredBy: string;
  duration: number;
  createdAt: string;
};

const toDeploymentStatus = (status: string): DeploymentRecord["status"] => {
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "success") return "success";
  return "in-progress";
};

const statusConfig = {
  success: { icon: CheckCircle2, label: "Success", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  failed: { icon: XCircle, label: "Failed", className: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  "in-progress": { icon: Loader2, label: "In Progress", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

const strategyConfig: Record<string, { color: string; bg: string }> = {
  rolling: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "blue-green": { color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  canary: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  recreate: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
};

const envConfig: Record<string, string> = {
  production: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  staging: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  development: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const formatDuration = (ms: number): string => {
  if (!ms || ms <= 0) return "—";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

const PAGE_SIZE = 10;

export default function DeploymentsPage() {
  const language = useLanguagePreference();
  const isReady = useRequireAuth();
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [strategyFilter, setStrategyFilter] = useState<string>("all");
  const [envFilter, setEnvFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const loadDeployments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: projectsRes } = await projectApi.getProjects();
      const projects = (Array.isArray(projectsRes?.projects) ? projectsRes.projects : []) as Project[];

      const historyBatches = await Promise.allSettled(
        projects.map(async (project) => {
          const { data } = await projectApi.getDeploymentHistory(project.id);
          const history = Array.isArray(data?.history) ? data.history : [];

          return history.map((item: any) => ({
            id: String(item._id || item.id || `${project.id}-${item.createdAt || Date.now()}`),
            projectId: project.id,
            projectName: project.name,
            version: String(item.version || "unknown"),
            strategy: String(item.strategy || "rolling"),
            runType: item.runType === "rollback" ? "rollback" : "deployment",
            status: toDeploymentStatus(String(item.status || "in-progress")),
            environment: String(item.environment || "staging"),
            triggeredBy: String(item.triggeredBy || "unknown"),
            duration: Number(item.duration || 0),
            createdAt: String(item.createdAt || new Date().toISOString()),
          })) as DeploymentRecord[];
        })
      );

      const merged = historyBatches
        .flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setDeployments(merged);
    } catch {
      setError("Failed to load deployments.");
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void loadDeployments();
  }, [isReady, loadDeployments]);

  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (strategyFilter !== "all" && d.strategy !== strategyFilter) return false;
      if (envFilter !== "all" && d.environment !== envFilter) return false;
      return true;
    });
  }, [deployments, statusFilter, strategyFilter, envFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDeployments.length / PAGE_SIZE));
  const paginatedDeployments = filteredDeployments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, strategyFilter, envFilter]);

  const uniqueStrategies = useMemo(() => [...new Set(deployments.map((d) => d.strategy))], [deployments]);
  const uniqueEnvironments = useMemo(() => [...new Set(deployments.map((d) => d.environment))], [deployments]);

  const completedDeploys = deployments.filter((d) => d.status === "success" || d.status === "failed");
  const successRate = completedDeploys.length > 0
    ? Math.round((completedDeploys.filter((d) => d.status === "success").length / completedDeploys.length) * 100)
    : 0;

  const avgDuration = useMemo(() => {
    const withDuration = deployments.filter((d) => d.duration > 0);
    if (withDuration.length === 0) return 0;
    return Math.round(withDuration.reduce((sum, d) => sum + d.duration, 0) / withDuration.length);
  }, [deployments]);

  const deploymentStats = useMemo(
    () => [
      {
        label: t(language, "deployments.successful"),
        value: String(deployments.filter((item) => item.status === "success").length),
        gradient: "from-emerald-500/20 to-emerald-500/5",
        borderColor: "border-emerald-500/20",
        color: "text-emerald-400",
        icon: CheckCircle2,
      },
      {
        label: t(language, "deployments.failed"),
        value: String(deployments.filter((item) => item.status === "failed").length),
        gradient: "from-rose-500/20 to-rose-500/5",
        borderColor: "border-rose-500/20",
        color: "text-rose-400",
        icon: XCircle,
      },
      {
        label: t(language, "deployments.inProgress"),
        value: String(deployments.filter((item) => item.status === "in-progress").length),
        gradient: "from-amber-500/20 to-amber-500/5",
        borderColor: "border-amber-500/20",
        color: "text-amber-400",
        icon: Loader2,
      },
      {
        label: "Success Rate",
        value: completedDeploys.length > 0 ? `${successRate}%` : "—",
        gradient: "from-cyan-500/20 to-cyan-500/5",
        borderColor: "border-cyan-500/20",
        color: "text-cyan-400",
        icon: TrendingUp,
      },
      {
        label: "Avg Duration",
        value: avgDuration > 0 ? formatDuration(avgDuration) : "—",
        gradient: "from-violet-500/20 to-violet-500/5",
        borderColor: "border-violet-500/20",
        color: "text-violet-400",
        icon: Clock,
      },
    ],
    [deployments, language, successRate, completedDeploys.length, avgDuration]
  );

  if (!isReady) return null;

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
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/20">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, "deployments.pageTitle")}</h1>
                  <p className="text-sm text-slate-500">{t(language, "deployments.subtitle")}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => void loadDeployments()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="relative rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300 backdrop-blur-sm">{error}</div>
          )}

          {/* Stat cards */}
          <div className="relative grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {deploymentStats.map((stat, index) => (
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

          {/* Filter bar */}
          {deployments.length > 0 && (
            <div className="relative flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.1em]">Filters</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 outline-none transition hover:border-white/[0.15] focus:border-cyan-500/40"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="in-progress">In Progress</option>
              </select>
              <select
                value={strategyFilter}
                onChange={(e) => setStrategyFilter(e.target.value)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 outline-none transition hover:border-white/[0.15] focus:border-cyan-500/40"
              >
                <option value="all">All Strategies</option>
                {uniqueStrategies.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={envFilter}
                onChange={(e) => setEnvFilter(e.target.value)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 outline-none transition hover:border-white/[0.15] focus:border-cyan-500/40"
              >
                <option value="all">All Environments</option>
                {uniqueEnvironments.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              {(statusFilter !== "all" || strategyFilter !== "all" || envFilter !== "all") && (
                <button
                  onClick={() => { setStatusFilter("all"); setStrategyFilter("all"); setEnvFilter("all"); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  Clear filters
                </button>
              )}
              <span className="ml-auto text-xs text-slate-600">
                {filteredDeployments.length} deployment{filteredDeployments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Deployments table */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Recent Deployments</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  <span className="ml-3 text-sm text-slate-500">Loading deployments...</span>
                </div>
              ) : filteredDeployments.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {deployments.length === 0 ? "No deployment history available yet." : "No deployments match the current filters."}
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-left">
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Project</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Type</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Version</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Environment</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Strategy</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Status</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Duration</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Triggered By</th>
                          <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Started</th>
                          <th className="pb-3 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDeployments.map((item) => {
                          const sc = statusConfig[item.status];
                          const StatusIcon = sc.icon;
                          const strat = strategyConfig[item.strategy] || strategyConfig.rolling;
                          const envCls = envConfig[item.environment] || "text-slate-400 bg-slate-500/10 border-slate-500/20";
                          return (
                            <tr key={item.id} className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]">
                              <td className="py-3 pr-4">
                                <Link href={`/dashboard/projects/${item.projectId}`} className="font-medium text-slate-200 hover:text-white transition">
                                  {item.projectName}
                                </Link>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                  {item.runType === "rollback" ? (
                                    <><RotateCcw className="h-3 w-3 text-orange-400" /> Rollback</>
                                  ) : (
                                    <><Rocket className="h-3 w-3 text-cyan-400" /> Deploy</>
                                  )}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-slate-400 font-mono text-xs">{item.version}</td>
                              <td className="py-3 pr-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${envCls}`}>
                                  <Server className="h-3 w-3" />
                                  {item.environment}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${strat.bg} ${strat.color}`}>
                                  {item.strategy}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.className}`}>
                                  <StatusIcon className={`h-3 w-3 ${item.status === "in-progress" ? "animate-spin" : ""}`} />
                                  {sc.label}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-slate-500 text-xs font-mono">{formatDuration(item.duration)}</td>
                              <td className="py-3 pr-4">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500" title={item.triggeredBy}>
                                  <User className="h-3 w-3" />
                                  <span className="max-w-[120px] truncate">{item.triggeredBy}</span>
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-slate-500 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                              <td className="py-3">
                                <Link href={`/dashboard/projects/${item.projectId}`} className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition">
                                  View →
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="text-xs text-slate-600">
                        Page {page} of {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="h-3 w-3" /> Prev
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Next <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <DeployActivityChart />
          </div>
        </main>
      </div>
    </div>
  );
}
