"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import ProjectHeader from "@/components/projectdetail/ProjectHeader";
import SubNavTabs, { type SubNavTab } from "@/components/projectdetail/SubNavTabs";
import EnvironmentTabs from "@/components/projectdetail/EnvironmentTabs";
import EnvironmentPanel from "@/components/projectdetail/EnvironmentPanel";
import DeployButton from "@/components/projectdetail/DeployButton";
import RollbackButton from "@/components/projectdetail/RollbackButton";
import SecretsList from "@/components/projectdetail/SecretsList";
import PipelineConfigEditor from "@/components/projectdetail/PipelineConfigEditor";
import RecentDeploysTable from "@/components/projectdetail/RecentDeploysTable";
import MetricsSummaryCards from "@/components/projectdetail/MetricsSummaryCards";
import TriggerPipelineButton from "@/components/pipelinedetail/TriggerPipelineButton";
import PipelineRunsTable from "@/components/pipelinedetail/PipelineRunsTable";
import PipelineDetailPanel from "@/components/pipelinedetail/PipelineDetailPanel";
import TimeRangeSelector from "@/components/monitoring/TimeRangeSelector";
import CPUChart from "@/components/monitoring/CPUChart";
import MemoryChart from "@/components/monitoring/MemoryChart";
import LatencyChart from "@/components/monitoring/LatencyChart";
import NetworkChart from "@/components/monitoring/NetworkChart";
import UptimeBar from "@/components/monitoring/UptimeBar";
import ServiceStatusCard from "@/components/monitoring/ServiceStatusCard";
import AlertHistoryTable from "@/components/monitoring/AlertHistoryTable";
import LogSearchBar from "@/components/logs/LogSearchBar";
import LevelFilter from "@/components/logs/LevelFilter";
import ContainerFilter from "@/components/logs/ContainerFilter";
import LiveToggle, { type LogMode } from "@/components/logs/LiveToggle";
import LogTerminal from "@/components/logs/LogTerminal";
import LogTable from "@/components/logs/LogTable";
import DownloadLogsButton from "@/components/logs/DownloadLogsButton";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";
import { alertApi, apiBaseUrl, pipelineApi, projectApi } from "@/lib/apiClient";
import type { ProjectDetail, Secret, PipelineRun, MonitoringTimeRange, AlertHistoryEntry, LogEntry, LogLevel, Project, ProjectAlert } from "@/types";

type BackendPipelineStep = {
  name: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  duration?: number;
  output?: string;
};

type BackendPipelineRun = {
  id: string;
  version: string;
  status: "pending" | "in-progress" | "success" | "failed" | "cancelled";
  branch: string;
  triggeredBy: string;
  duration?: number;
  steps: BackendPipelineStep[];
  createdAt: string;
  strategy?: string;
  environment?: string;
};

type PipelineStreamState = "idle" | "connecting" | "live" | "reconnecting" | "offline";

const asDurationLabel = (durationMs: number | undefined) => {
  if (!durationMs || durationMs <= 0) return null;
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const mapRunStatus = (status: BackendPipelineRun["status"]): PipelineRun["status"] => {
  if (status === "pending") return "queued";
  if (status === "in-progress") return "running";
  if (status === "cancelled") return "failed";
  return status;
};

const mapBackendRunToUi = (run: BackendPipelineRun): PipelineRun => ({
  id: run.id,
  branch: run.branch,
  commit: String(run.version || "unknown"),
  commitMsg: `${run.strategy || "pipeline"} / ${run.environment || "staging"}`,
  status: mapRunStatus(run.status),
  duration: asDurationLabel(run.duration),
  triggeredBy: run.triggeredBy,
  triggerType: "manual",
  createdAt: run.createdAt,
  stages: (run.steps || []).map((step, index) => ({
    id: `${run.id}-stage-${index}`,
    name: step.name,
    status: step.status,
    duration: asDurationLabel(step.duration),
    logs: String(step.output || "")
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean),
  })),
});

export default function ProjectDetailPage() {
  const isReady = useRequireAuth();
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);
  const params = useParams();
  const searchParams = useSearchParams();
  const _projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<SubNavTab>("Overview");
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [activeEnvId, setActiveEnvId] = useState("");
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [pipelineConfig, setPipelineConfig] = useState("");
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStreamState, setPipelineStreamState] = useState<PipelineStreamState>("idle");
  const [monitoringRange, setMonitoringRange] = useState<MonitoringTimeRange>("24h");

  // Logs state
  const [logSearch, setLogSearch] = useState("");
  const [logRegex, setLogRegex] = useState(false);
  const [logLevels, setLogLevels] = useState<Set<LogLevel>>(new Set(["debug", "info", "warn", "error", "fatal"]));
  const [logContainer, setLogContainer] = useState("all");
  const [logMode, setLogMode] = useState<LogMode>("historical");
  const [logAutoScroll, setLogAutoScroll] = useState(true);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [monitoringAlerts, setMonitoringAlerts] = useState<AlertHistoryEntry[]>([]);
  const [serviceStatus, setServiceStatus] = useState<{ status: "healthy" | "degraded" | "down"; lastCheckedAt: string }>({
    status: "healthy",
    lastCheckedAt: new Date().toISOString(),
  });
  const [uptimeSegments, setUptimeSegments] = useState<{ date: string; status: "up" | "incident" }[]>([]);
  const [cpuPoints, setCpuPoints] = useState<Array<{ time: string; cpu: number }>>([]);
  const [memoryPoints, setMemoryPoints] = useState<Array<{ time: string; memoryMb: number }>>([]);
  const [latencyPoints, setLatencyPoints] = useState<Array<{ time: string; latencyMs: number }>>([]);
  const [networkPoints, setNetworkPoints] = useState<Array<{ time: string; inKbPerSec: number; outKbPerSec: number }>>([]);

  useEffect(() => {
    const requestedTab = String(searchParams.get("tab") || "");
    const requestedMode = String(searchParams.get("mode") || "");
    const allowedTabs: SubNavTab[] = ["Overview", "Pipelines", "Monitoring", "Logs", "Settings"];

    if (allowedTabs.includes(requestedTab as SubNavTab)) {
      setActiveTab(requestedTab as SubNavTab);
    }

    if (requestedMode === "live") {
      setLogMode("live");
    } else if (requestedMode === "historical") {
      setLogMode("historical");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isReady) return;

    const loadProjectData = async () => {
      try {
        setProjectLoading(true);
        setProjectError(null);

        const [
          projectRes,
          historyRes,
          statusRes,
          metricsRes,
          logsRes,
          alertsRes,
        ] = await Promise.all([
          projectApi.getProject(_projectId),
          projectApi.getDeploymentHistory(_projectId),
          projectApi.getProjectStatus(_projectId),
          projectApi.getProjectMetrics(_projectId, { limit: 200 }),
          projectApi.getProjectLogs(_projectId, { limit: 500 }),
          alertApi.getAlerts(),
        ]);

        const projectData = projectRes.data?.project as Project;
        const deploymentHistory = Array.isArray(historyRes.data?.history) ? historyRes.data.history : [];
        const latestMetric = statusRes.data?.latestMetric || null;

        const mappedProject: ProjectDetail = {
          ...projectData,
          environments: [
            {
              id: "env-default",
              name: t(language, "projectDetail.defaultEnv"),
              image: "",
              domain: "",
              replicas: Math.max(1, Number(projectData.envCount || 1)),
              strategy: "rolling",
              status:
                projectData.status === "running"
                  ? "healthy"
                  : projectData.status === "failed"
                    ? "down"
                    : "degraded",
            },
          ],
          deployments: deploymentHistory.map((run: any) => ({
            id: String(run._id || run.id),
            version: String(run.version || "unknown"),
            strategy: String(run.strategy || "rolling") as ProjectDetail["deployments"][number]["strategy"],
            duration: asDurationLabel(Number(run.duration || 0)) || "-",
            triggeredBy: String(run.triggeredBy || "manual"),
            createdAt: String(run.createdAt || new Date().toISOString()),
            status: run.status === "success" ? "success" : run.status === "failed" ? "failed" : "in-progress",
          })),
          secrets: [],
          metrics: {
            cpu: `${Number(latestMetric?.cpu_percent ?? latestMetric?.cpu ?? 0).toFixed(1)}%`,
            memory: `${Number(latestMetric?.memory_mb ?? 0).toFixed(0)} MB`,
            latency: `${Number(latestMetric?.http_latency_ms ?? latestMetric?.latency ?? 0).toFixed(0)} ms`,
            uptime: `${Number(latestMetric?.uptime ?? 0).toFixed(2)}%`,
          },
          pipelineConfig: "",
        };

        setProject(mappedProject);
        setActiveEnvId((prev) => prev || mappedProject.environments[0]?.id || "");

        const metrics = Array.isArray(metricsRes.data?.metrics) ? metricsRes.data.metrics : [];
        const sortedMetrics = [...metrics].sort(
          (a: any, b: any) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );

        setCpuPoints(
          sortedMetrics.map((metric: any) => ({
            time: new Date(metric.recordedAt).toLocaleTimeString(locale),
            cpu: Number(metric.cpu_percent ?? metric.cpu ?? 0),
          }))
        );

        setMemoryPoints(
          sortedMetrics.map((metric: any) => ({
            time: new Date(metric.recordedAt).toLocaleTimeString(locale),
            memoryMb: Number(metric.memory_mb ?? 0),
          }))
        );

        setLatencyPoints(
          sortedMetrics.map((metric: any) => ({
            time: new Date(metric.recordedAt).toLocaleTimeString(locale),
            latencyMs: Number(metric.http_latency_ms ?? metric.latency ?? 0),
          }))
        );

        setNetworkPoints(
          sortedMetrics.map((metric: any) => ({
            time: new Date(metric.recordedAt).toLocaleTimeString(locale),
            inKbPerSec: Number(metric.net_rx_bytes ?? 0) / 1024,
            outKbPerSec: Number(metric.net_tx_bytes ?? 0) / 1024,
          }))
        );

        const segments = sortedMetrics.slice(-30).map((metric: any) => ({
          date: new Date(metric.recordedAt).toLocaleDateString(locale, { month: "short", day: "numeric" }),
          status: ["down", "degraded"].includes(String(metric.health_state || "").toLowerCase()) ? "incident" : "up",
        })) as { date: string; status: "up" | "incident" }[];
        setUptimeSegments(segments);

        const statusValue = String(statusRes.data?.status || "").toLowerCase();
        setServiceStatus({
          status: statusValue === "down" ? "down" : statusValue === "degraded" ? "degraded" : "healthy",
          lastCheckedAt: String(statusRes.data?.checkedAt || new Date().toISOString()),
        });

        const logs = Array.isArray(logsRes.data?.logs) ? logsRes.data.logs : [];
        setLogEntries(
          logs.map((log: any) => ({
            id: String(log._id || log.id),
            timestamp: String(log.eventAt || log.createdAt || new Date().toISOString()),
            level: String(log.level || "info") as LogLevel,
            container: String(log.containerName || "app"),
            message: String(log.message || ""),
          }))
        );

        const alerts = (alertsRes.data?.alerts || []) as ProjectAlert[];
        setMonitoringAlerts(
          alerts
            .filter((alert) => {
              const alertProjectId = (alert as { projectId?: string }).projectId;
              return alertProjectId === _projectId || alert.project === projectData.name;
            })
            .map((alert) => ({
              id: alert.id,
              severity: alert.severity,
              message: alert.message,
              triggeredAt: alert.timestamp,
              resolved: alert.status === "resolved",
              resolvedAt: alert.status === "resolved" ? alert.timestamp : null,
            }))
        );
      } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { message?: string } } };
        setProjectError(axiosErr.response?.data?.message || t(language, "projects.errorLoad"));
        setProject(null);
      } finally {
        setProjectLoading(false);
      }
    };

    void loadProjectData();
  }, [isReady, _projectId, locale, language]);

  const filteredLogs = useMemo(() => {
    return logEntries.filter((entry) => {
      if (!logLevels.has(entry.level)) return false;
      if (logContainer !== "all" && entry.container !== logContainer) return false;
      if (logSearch) {
        try {
          const re = logRegex
            ? new RegExp(logSearch, "i")
            : new RegExp(logSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          if (!re.test(entry.message)) return false;
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [logEntries, logSearch, logRegex, logLevels, logContainer]);

  const activeEnv = useMemo(
    () => project?.environments.find((e) => e.id === activeEnvId) || null,
    [project, activeEnvId]
  );

  const logContainers = useMemo(() => {
    const unique = new Set(logEntries.map((entry) => entry.container).filter(Boolean));
    return Array.from(unique);
  }, [logEntries]);

  const mergeRun = (incoming: PipelineRun) => {
    setPipelineRuns((prev) => {
      const idx = prev.findIndex((run) => run.id === incoming.id);
      if (idx === -1) return [incoming, ...prev];
      const updated = [...prev];
      updated[idx] = incoming;
      return updated;
    });

    setSelectedRun((prev) => (prev?.id === incoming.id ? incoming : prev));
  };

  const fetchRunById = async (runId: string) => {
    const { data } = await pipelineApi.getRun(runId);
    const mapped = mapBackendRunToUi(data.run as BackendPipelineRun);
    mergeRun(mapped);
  };

  useEffect(() => {
    if (!isReady) return;

    const loadRuns = async () => {
      try {
        setPipelineLoading(true);
        setPipelineError(null);
        const { data } = await pipelineApi.listProjectRuns(_projectId);
        const mappedRuns = ((data.runs || []) as BackendPipelineRun[]).map(mapBackendRunToUi);
        setPipelineRuns(mappedRuns);
        setSelectedRun((prev) => {
          if (prev) {
            return mappedRuns.find((run) => run.id === prev.id) || mappedRuns[0] || null;
          }
          return mappedRuns[0] || null;
        });
      } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { message?: string } } };
        setPipelineError(axiosErr.response?.data?.message || t(language, "projectDetail.failedLoadRuns"));
        setPipelineRuns([]);
        setSelectedRun((prev) => prev || null);
      } finally {
        setPipelineLoading(false);
      }
    };

    void loadRuns();
  }, [isReady, _projectId, language]);

  useEffect(() => {
    if (!isReady || !selectedRun) {
      setPipelineStreamState("idle");
      return;
    }

    if (!["queued", "running"].includes(selectedRun.status)) {
      setPipelineStreamState("idle");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setPipelineStreamState("offline");
      return;
    }

    const abortController = new AbortController();
    const streamUrl = `${apiBaseUrl}/pipelines/${selectedRun.id}/stream`;
    let reconnectAttempts = 0;

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const consumeStream = async () => {
      while (!abortController.signal.aborted) {
        try {
          setPipelineStreamState(reconnectAttempts === 0 ? "connecting" : "reconnecting");

          const response = await fetch(streamUrl, {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: abortController.signal,
            cache: "no-store",
          });

          if (!response.ok || !response.body) {
            reconnectAttempts += 1;
            setPipelineStreamState("reconnecting");
            await wait(Math.min(1000 * reconnectAttempts, 5000));
            continue;
          }

          reconnectAttempts = 0;
          setPipelineStreamState("live");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!abortController.signal.aborted) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() || "";

            for (const chunk of chunks) {
              const lines = chunk.split("\n").filter(Boolean);
              const hasData = lines.some((line) => line.startsWith("data:"));
              if (!hasData) continue;
              await fetchRunById(selectedRun.id);
            }
          }
        } catch {
          reconnectAttempts += 1;
          setPipelineStreamState("reconnecting");
          await wait(Math.min(1000 * reconnectAttempts, 5000));
        }
      }
    };

    void consumeStream();

    return () => {
      abortController.abort();
      setPipelineStreamState("idle");
    };
  }, [isReady, selectedRun?.id, selectedRun?.status]);

  if (!isReady) return null;

  if (projectLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            <p className="text-sm text-muted-foreground">{t(language, "projectDetail.loading")}</p>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            <p className="text-sm text-red-500">{projectError || t(language, "projectDetail.unavailable")}</p>
          </main>
        </div>
      </div>
    );
  }

  const handleDeploy = async () => {
    await projectApi.triggerDeploy(_projectId, {
      environment: activeEnv?.name?.toLowerCase() || t(language, "projectDetail.defaultEnv"),
    });
  };

  const handleRollback = async () => {
    await projectApi.triggerRollback(_projectId, {
      environment: activeEnv?.name?.toLowerCase() || t(language, "projectDetail.defaultEnv"),
      version: project.deployments[0]?.version,
    });
  };

  const handleTriggerPipeline = async (branch: string) => {
    try {
      setPipelineError(null);
      const { data } = await pipelineApi.triggerRun(_projectId, {
        branch,
        config: pipelineConfig,
      });

      const mapped = mapBackendRunToUi(data.run as BackendPipelineRun);
      mergeRun(mapped);
      setSelectedRun(mapped);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      setPipelineError(axiosErr.response?.data?.message || t(language, "projectDetail.failedTrigger"));
    }
  };

  const handleCancelRun = async (runId: string) => {
    try {
      setPipelineError(null);
      await pipelineApi.cancelRun(runId);
      await fetchRunById(runId);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      setPipelineError(axiosErr.response?.data?.message || t(language, "projectDetail.failedCancel"));
    }
  };

  const handleRetryRun = async (runId: string) => {
    const run = pipelineRuns.find((item) => item.id === runId);
    if (!run) return;
    await handleTriggerPipeline(run.branch);
  };

  const handleAddSecret = (key: string, value: string) => {
    setSecrets((prev) => [...prev, { id: `s_${Date.now()}`, key, value }]);
  };

  const handleEditSecret = (id: string, value: string) => {
    setSecrets((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 space-y-6">
          <ProjectHeader project={project} />
          <SubNavTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === "Overview" && (
            <div className="space-y-6">
              <EnvironmentTabs
                environments={project.environments}
                activeId={activeEnvId}
                onChange={setActiveEnvId}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                {activeEnv && <EnvironmentPanel environment={activeEnv} />}
                <div className="flex flex-col gap-3">
                  <DeployButton
                    environmentName={activeEnv?.name || t(language, "projectDetail.defaultEnv")}
                    onDeploy={handleDeploy}
                  />
                  <RollbackButton onRollback={handleRollback} />
                </div>
              </div>

              <MetricsSummaryCards metrics={project.metrics} />
              <RecentDeploysTable deployments={project.deployments} />
            </div>
          )}

          {activeTab === "Pipelines" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {t(language, "projectDetail.runsCount", {
                    count: String(pipelineRuns.length),
                    suffix: pipelineRuns.length !== 1 ? "s" : "",
                  })}
                </h2>
                <TriggerPipelineButton onTrigger={handleTriggerPipeline} />
              </div>

              {pipelineLoading && (
                <p className="text-xs text-muted-foreground">{t(language, "projectDetail.loadingRuns")}</p>
              )}

              {pipelineError && (
                <p className="text-xs text-red-500">{pipelineError}</p>
              )}

              <PipelineRunsTable
                runs={pipelineRuns}
                selectedRunId={selectedRun?.id ?? null}
                onSelectRun={setSelectedRun}
              />

              {selectedRun && (
                <PipelineDetailPanel
                  key={selectedRun.id}
                  run={selectedRun}
                  onCancel={handleCancelRun}
                  onRetry={handleRetryRun}
                  streamState={pipelineStreamState}
                />
              )}
            </div>
          )}

          {activeTab === "Monitoring" && (
            <div className="space-y-5">
              {/* Time range + status row */}
              <div className="flex items-center gap-4 flex-wrap justify-between">
                <TimeRangeSelector value={monitoringRange} onChange={setMonitoringRange} />
              </div>

              {/* Service status + uptime */}
              <div className="grid gap-4 lg:grid-cols-2">
                <ServiceStatusCard
                  status={serviceStatus.status}
                  lastCheckedAt={serviceStatus.lastCheckedAt}
                />
                <div className="rounded-lg border bg-card shadow-sm p-5">
                  <p className="text-sm font-semibold mb-3">{t(language, "projectDetail.uptime30d")}</p>
                  <UptimeBar segments={uptimeSegments} />
                </div>
              </div>

              {/* Charts row 1 */}
              <div className="grid gap-4 lg:grid-cols-2">
                <CPUChart timeRange={monitoringRange} data={cpuPoints} />
                <MemoryChart timeRange={monitoringRange} data={memoryPoints} />
              </div>

              {/* Charts row 2 */}
              <div className="grid gap-4 lg:grid-cols-2">
                <LatencyChart timeRange={monitoringRange} data={latencyPoints} />
                <NetworkChart timeRange={monitoringRange} data={networkPoints} />
              </div>

              {/* Alert history */}
              <AlertHistoryTable alerts={monitoringAlerts} />
            </div>
          )}

          {activeTab === "Logs" && (
            <div className="space-y-4">
              {/* Toolbar row 1: search */}
              <div className="pt-1">
                <LogSearchBar
                  value={logSearch}
                  isRegex={logRegex}
                  onChange={setLogSearch}
                  onRegexToggle={setLogRegex}
                />
              </div>

              {/* Toolbar row 2: filters + mode + download */}
              <div className="flex items-center gap-3 flex-wrap justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <LevelFilter selected={logLevels} onChange={setLogLevels} />
                  <ContainerFilter
                    containers={logContainers}
                    value={logContainer}
                    onChange={setLogContainer}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <LiveToggle mode={logMode} onChange={setLogMode} />
                  <DownloadLogsButton entries={filteredLogs} />
                </div>
              </div>

              {/* Result count */}
              <p className="text-xs text-muted-foreground">
                {t(language, "projectDetail.logsShowing", {
                  shown: String(filteredLogs.length),
                  total: String(logEntries.length),
                })}
                {logMode === "live" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-cyan-300">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    {t(language, "projectDetail.liveStreamActive")}
                  </span>
                )}
              </p>

              {/* Terminal view (Live) */}
              {logMode === "live" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={logAutoScroll}
                        onChange={(e) => setLogAutoScroll(e.target.checked)}
                        className="rounded"
                      />
                      {t(language, "projectDetail.autoScroll")}
                    </label>
                  </div>
                  <LogTerminal
                    entries={filteredLogs}
                    searchQuery={logSearch}
                    isRegex={logRegex}
                    autoScroll={logAutoScroll}
                  />
                </div>
              )}

              {/* Table view (Historical) */}
              {logMode === "historical" && (
                <LogTable
                  entries={filteredLogs}
                  searchQuery={logSearch}
                  isRegex={logRegex}
                />
              )}
            </div>
          )}

          {activeTab === "Settings" && (
            <SecretsList
              secrets={secrets}
              onAdd={handleAddSecret}
              onEdit={handleEditSecret}
              onDelete={handleDeleteSecret}
            />
          )}
        </main>
      </div>
    </div>
  );
}
