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
import { apiBaseUrl, pipelineApi } from "@/lib/apiClient";
import type { ProjectDetail, Secret, PipelineRun, MonitoringTimeRange, AlertHistoryEntry, LogEntry, LogLevel } from "@/types";

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

/** Mock data — replace with API call */
const mockProject: ProjectDetail = {
  id: "p1",
  name: "inno-web",
  description: "Main web application",
  repoUrl: "https://github.com/innodeploy/inno-web",
  branch: "main",
  status: "running",
  lastDeployAt: "2026-03-11T15:30:00Z",
  envCount: 3,
  createdAt: "2026-01-10T10:00:00Z",
  environments: [
    {
      id: "env-staging",
      name: "Staging",
      image: "innodeploy/inno-web:staging-abc1234",
      domain: "staging.inno-web.innodeploy.app",
      replicas: 2,
      strategy: "rolling",
      status: "healthy",
    },
    {
      id: "env-production",
      name: "Production",
      image: "innodeploy/inno-web:v2.4.1",
      domain: "inno-web.innodeploy.app",
      replicas: 4,
      strategy: "blue-green",
      status: "healthy",
    },
    {
      id: "env-canary",
      name: "Canary",
      image: "innodeploy/inno-web:canary-def5678",
      domain: "canary.inno-web.innodeploy.app",
      replicas: 1,
      strategy: "canary",
      status: "degraded",
    },
  ],
  deployments: [
    {
      id: "d1",
      version: "v2.4.1",
      strategy: "blue-green",
      duration: "2m 14s",
      triggeredBy: "sarah@innodeploy.com",
      createdAt: "2026-03-11T15:30:00Z",
      status: "success",
    },
    {
      id: "d2",
      version: "v2.4.0",
      strategy: "rolling",
      duration: "1m 52s",
      triggeredBy: "CI/CD",
      createdAt: "2026-03-10T12:00:00Z",
      status: "success",
    },
    {
      id: "d3",
      version: "v2.3.9",
      strategy: "rolling",
      duration: "3m 01s",
      triggeredBy: "james@innodeploy.com",
      createdAt: "2026-03-09T09:15:00Z",
      status: "failed",
    },
    {
      id: "d4",
      version: "v2.3.8",
      strategy: "canary",
      duration: "4m 30s",
      triggeredBy: "CI/CD",
      createdAt: "2026-03-08T16:45:00Z",
      status: "success",
    },
  ],
  secrets: [
    { id: "s1", key: "DATABASE_URL", value: "postgresql://user:pass@db:5432/app" },
    { id: "s2", key: "REDIS_URL", value: "redis://redis:6379" },
    { id: "s3", key: "API_SECRET", value: "sk_live_abc123def456" },
  ],
  metrics: {
    cpu: "34%",
    memory: "512 MB",
    latency: "45 ms",
    uptime: "99.97%",
  },
  pipelineConfig: `# .innodeploy.yml
name: inno-web
build:
  image: node:18-alpine
  steps:
    - npm ci
    - npm run build
    - npm run test

deploy:
  strategy: blue-green
  replicas: 4
  health_check:
    path: /health
    interval: 30s
    timeout: 5s

environments:
  staging:
    branch: develop
    auto_deploy: true
  production:
    branch: main
    auto_deploy: false
    approval_required: true
`,
};

const mockPipelineRuns: PipelineRun[] = [
  {
    id: "run-003",
    branch: "develop",
    commit: "def56789",
    commitMsg: "chore: update dependencies",
    status: "running",
    duration: null,
    triggeredBy: "push",
    triggerType: "push",
    createdAt: "2026-03-13T09:45:00Z",
    stages: [
      {
        id: "s3-1", name: "Checkout", status: "success", duration: "4s",
        logs: [
          "Initialized empty Git repository",
          "From https://github.com/innodeploy/inno-web",
          "  abc1234..def5678  develop -> origin/develop",
          "HEAD is now at def5678 chore: update dependencies",
        ],
      },
      {
        id: "s3-2", name: "Build", status: "success", duration: "1m 48s",
        logs: [
          "npm warn deprecated inflight@1.0.6",
          "added 312 packages in 23s",
          "> next build",
          "  ▲ Next.js 15.5.12",
          "  ✓ Compiled successfully",
          "  ✓ Generating static pages (8/8)",
        ],
      },
      {
        id: "s3-3", name: "Test", status: "running", duration: null,
        logs: [
          "npm run test",
          "PASS src/__tests__/auth.test.ts",
          "PASS src/__tests__/projects.test.ts",
          "Running pipeline.test.ts...",
        ],
      },
      {
        id: "s3-4", name: "Push Image", status: "pending", duration: null, logs: [],
      },
      {
        id: "s3-5", name: "Deploy", status: "pending", duration: null, logs: [],
      },
    ],
  },
  {
    id: "run-002",
    branch: "main",
    commit: "abc12345",
    commitMsg: "feat: add pipeline page with stage log viewer",
    status: "success",
    duration: "4m 12s",
    triggeredBy: "sarah@innodeploy.com",
    triggerType: "manual",
    createdAt: "2026-03-11T15:30:00Z",
    stages: [
      {
        id: "s2-1", name: "Checkout", status: "success", duration: "5s",
        logs: [
          "Initialized empty Git repository",
          "HEAD is now at abc1234 feat: add pipeline page",
        ],
      },
      {
        id: "s2-2", name: "Build", status: "success", duration: "1m 55s",
        logs: [
          "npm ci",
          "added 312 packages in 21s",
          "> next build",
          "  ✓ Compiled successfully",
        ],
      },
      {
        id: "s2-3", name: "Test", status: "success", duration: "1m 08s",
        logs: [
          "PASS src/__tests__/auth.test.ts",
          "PASS src/__tests__/projects.test.ts",
          "Test Suites: 2 passed, 2 total",
          "Tests:       14 passed, 14 total",
        ],
      },
      {
        id: "s2-4", name: "Push Image", status: "success", duration: "48s",
        logs: [
          "docker build -t innodeploy/inno-web:abc1234 .",
          "Successfully built d4e5f6a7b8c9",
          "docker push innodeploy/inno-web:abc1234",
          "abc1234: digest: sha256:deadbeef size: 1234",
        ],
      },
      {
        id: "s2-5", name: "Deploy", status: "success", duration: "16s",
        logs: [
          "Updating deployment inno-web-production",
          "Waiting for rollout to complete...",
          "deployment.apps/inno-web-production successfully rolled out",
        ],
      },
    ],
  },
  {
    id: "run-001",
    branch: "main",
    commit: "ff00aa11",
    commitMsg: "fix: resolve env variable injection issue",
    status: "failed",
    duration: "2m 03s",
    triggeredBy: "CI/CD",
    triggerType: "push",
    createdAt: "2026-03-10T08:20:00Z",
    stages: [
      {
        id: "s1-1", name: "Checkout", status: "success", duration: "4s",
        logs: [
          "HEAD is now at ff00aa11 fix: resolve env variable injection issue",
        ],
      },
      {
        id: "s1-2", name: "Build", status: "success", duration: "1m 50s",
        logs: [
          "npm ci",
          "added 312 packages in 19s",
          "> next build",
          "  ✓ Compiled successfully",
        ],
      },
      {
        id: "s1-3", name: "Test", status: "failed", duration: "9s",
        logs: [
          "npm run test",
          "PASS src/__tests__/auth.test.ts",
          "FAIL src/__tests__/env.test.ts",
          "  ● Environment › should inject DATABASE_URL",
          "    Expected: \"postgresql://user:pass@db:5432/app\"",
          "    Received: undefined",
          "Test Suites: 1 failed, 1 passed, 2 total",
          "Tests:       1 failed, 13 passed, 14 total",
          "npm ERR! Test failed.",
        ],
      },
      {
        id: "s1-4", name: "Push Image", status: "skipped", duration: null, logs: [],
      },
      {
        id: "s1-5", name: "Deploy", status: "skipped", duration: null, logs: [],
      },
    ],
  },
  {
    id: "run-000",
    branch: "staging",
    commit: "bb334455",
    commitMsg: "ci: initial pipeline configuration",
    status: "success",
    duration: "3m 58s",
    triggeredBy: "james@innodeploy.com",
    triggerType: "manual",
    createdAt: "2026-03-09T14:10:00Z",
    stages: [
      { id: "s0-1", name: "Checkout",   status: "success", duration: "3s",    logs: ["HEAD is now at bb334455"] },
      { id: "s0-2", name: "Build",      status: "success", duration: "2m 10s", logs: ["Build successful."] },
      { id: "s0-3", name: "Test",       status: "success", duration: "55s",    logs: ["All tests passed."] },
      { id: "s0-4", name: "Push Image", status: "success", duration: "42s",    logs: ["Image pushed successfully."] },
      { id: "s0-5", name: "Deploy",     status: "success", duration: "8s",     logs: ["Deployment complete."] },
    ],
  },
];

const mockAlerts: AlertHistoryEntry[] = [
  {
    id: "a1",
    severity: "critical",
    message: "Memory usage exceeded 90% on web-2 container",
    triggeredAt: "2026-03-11T14:05:00Z",
    resolved: true,
    resolvedAt: "2026-03-11T14:22:00Z",
  },
  {
    id: "a2",
    severity: "warning",
    message: "p99 latency above 400 ms for 5 consecutive minutes",
    triggeredAt: "2026-03-10T09:30:00Z",
    resolved: true,
    resolvedAt: "2026-03-10T09:48:00Z",
  },
  {
    id: "a3",
    severity: "warning",
    message: "CPU spike detected: web-1 at 87%",
    triggeredAt: "2026-03-09T18:15:00Z",
    resolved: true,
    resolvedAt: "2026-03-09T18:20:00Z",
  },
  {
    id: "a4",
    severity: "info",
    message: "Deployment v2.4.1 completed successfully",
    triggeredAt: "2026-03-11T15:32:26Z",
    resolved: true,
    resolvedAt: "2026-03-11T15:32:26Z",
  },
  {
    id: "a5",
    severity: "critical",
    message: "Health check failed on /health — canary environment",
    triggeredAt: "2026-03-08T11:00:00Z",
    resolved: false,
    resolvedAt: null,
  },
];

// ─── Mock log entries ──────────────────────────────────────────────────────────
function makeLogs(): LogEntry[] {
  const CONTAINERS = ["web-1", "web-2", "web-3", "db", "redis"];
  const MESSAGES: Record<LogLevel, string[]> = {
    debug: [
      "Resolved query plan for table users in 2ms",
      "Cache HIT for key session:abc123",
      "Worker thread idle — waiting for task",
      "Connection pool: 3/20 active slots",
      "HTTP keep-alive timeout reset for 10.0.0.4",
    ],
    info: [
      "GET /api/projects 200 OK 12ms",
      "POST /api/auth/login 200 OK 35ms",
      "Deployment v2.4.1 completed successfully",
      "Health check passed on /health",
      "Pipeline run #run-002 triggered by sarah@innodeploy.com",
      "Container web-1 started successfully",
      "Blue-green swap complete — traffic routed to new pods",
    ],
    warn: [
      "Slow query detected: SELECT * FROM logs took 320ms",
      "Memory usage at 78% — approaching limit",
      "Retry #2 for downstream service /api/metrics",
      "JWT token expiring in 60 seconds for user sarah@innodeploy.com",
      "Response time above SLA threshold (>200ms)",
    ],
    error: [
      "ECONNREFUSED connecting to redis://redis:6379",
      "Unhandled promise rejection: TypeError: Cannot read properties of undefined",
      "HTTP 502 Bad Gateway from upstream /api/health",
      "Database migration failed: column 'org_id' already exists",
    ],
    fatal: [
      "OOM Killed — container web-2 exceeded memory limit 512MB",
      "Segmentation fault in native addon (worker thread crashed)",
    ],
  };

  const levels: LogLevel[] = ["debug", "info", "info", "info", "warn", "error", "fatal"];
  const now = Date.now();
  const entries: LogEntry[] = [];
  for (let i = 0; i < 120; i++) {
    const level = levels[Math.floor(Math.abs(Math.sin(i * 7 + 3)) * levels.length)] as LogLevel;
    const msgArr = MESSAGES[level];
    const msg = msgArr[Math.floor(Math.abs(Math.sin(i * 13 + 7)) * msgArr.length)];
    const container = CONTAINERS[Math.floor(Math.abs(Math.sin(i * 5 + 11)) * CONTAINERS.length)];
    const ts = new Date(now - (120 - i) * 8000).toISOString();
    entries.push({ id: `log-${i}`, timestamp: ts, level, container, message: msg });
  }
  return entries;
}

const mockLogEntries: LogEntry[] = makeLogs();
const LOG_CONTAINERS = ["web-1", "web-2", "web-3", "db", "redis"];

export default function ProjectDetailPage() {
  const isReady = useRequireAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const _projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<SubNavTab>("Overview");
  const [activeEnvId, setActiveEnvId] = useState(mockProject.environments[0].id);
  const [secrets, setSecrets] = useState<Secret[]>(mockProject.secrets);
  const [pipelineConfig, setPipelineConfig] = useState(mockProject.pipelineConfig);
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

  const filteredLogs = useMemo(() => {
    return mockLogEntries.filter((entry) => {
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
  }, [logSearch, logRegex, logLevels, logContainer]);

  const activeEnv = useMemo(
    () => mockProject.environments.find((e) => e.id === activeEnvId)!,
    [activeEnvId]
  );

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
        setPipelineError(axiosErr.response?.data?.message || "Failed to load pipeline runs");
        setPipelineRuns(mockPipelineRuns);
        setSelectedRun((prev) => prev || mockPipelineRuns[0] || null);
      } finally {
        setPipelineLoading(false);
      }
    };

    void loadRuns();
  }, [isReady, _projectId]);

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

  const handleDeploy = async () => {
    // TODO: call deploy API
    await new Promise((r) => setTimeout(r, 1500));
  };

  const handleRollback = async () => {
    // TODO: call rollback API
    await new Promise((r) => setTimeout(r, 1500));
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
      setPipelineError(axiosErr.response?.data?.message || "Failed to trigger pipeline");
    }
  };

  const handleCancelRun = async (runId: string) => {
    try {
      setPipelineError(null);
      await pipelineApi.cancelRun(runId);
      await fetchRunById(runId);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      setPipelineError(axiosErr.response?.data?.message || "Failed to cancel pipeline run");
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
          <ProjectHeader project={mockProject} />
          <SubNavTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === "Overview" && (
            <div className="space-y-6">
              <EnvironmentTabs
                environments={mockProject.environments}
                activeId={activeEnvId}
                onChange={setActiveEnvId}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <EnvironmentPanel environment={activeEnv} />
                <div className="flex flex-col gap-3">
                  <DeployButton
                    environmentName={activeEnv.name}
                    onDeploy={handleDeploy}
                  />
                  <RollbackButton onRollback={handleRollback} />
                </div>
              </div>

              <MetricsSummaryCards metrics={mockProject.metrics} />
              <RecentDeploysTable deployments={mockProject.deployments} />
            </div>
          )}

          {activeTab === "Pipelines" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {pipelineRuns.length} run{pipelineRuns.length !== 1 ? "s" : ""}
                </h2>
                <TriggerPipelineButton onTrigger={handleTriggerPipeline} />
              </div>

              {pipelineLoading && (
                <p className="text-xs text-muted-foreground">Loading pipeline runs...</p>
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
                  status="healthy"
                  lastCheckedAt="2026-03-13T09:44:00Z"
                />
                <div className="rounded-lg border bg-card shadow-sm p-5">
                  <p className="text-sm font-semibold mb-3">30-Day Uptime</p>
                  <UptimeBar />
                </div>
              </div>

              {/* Charts row 1 */}
              <div className="grid gap-4 lg:grid-cols-2">
                <CPUChart timeRange={monitoringRange} />
                <MemoryChart timeRange={monitoringRange} />
              </div>

              {/* Charts row 2 */}
              <div className="grid gap-4 lg:grid-cols-2">
                <LatencyChart timeRange={monitoringRange} />
                <NetworkChart timeRange={monitoringRange} />
              </div>

              {/* Alert history */}
              <AlertHistoryTable alerts={mockAlerts} />
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
                    containers={LOG_CONTAINERS}
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
                Showing <span className="font-semibold text-foreground">{filteredLogs.length}</span> of {mockLogEntries.length} entries
                {logMode === "live" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Live stream active
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
                      Auto-scroll
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
