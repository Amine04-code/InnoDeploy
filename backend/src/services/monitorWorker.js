const Docker = require("dockerode");
const { statfs } = require("fs/promises");
const net = require("net");

const Log = require("../models/Log");
const Metric = require("../models/Metric");
const Project = require("../models/Project");
const { evaluateMonitoringAlertRules } = require("./alertRulesEngine");
const { dispatchProjectNotification } = require("./notificationDispatcher");
const { redisClient } = require("../config/redis");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

const MONITOR_WORKER_ENABLED = TRUE_VALUES.has(
  String(process.env.MONITOR_WORKER_ENABLED || "false").toLowerCase()
);
const MONITOR_INTERVAL_MS = Math.max(5000, Number(process.env.MONITOR_INTERVAL_MS) || 15000);
const MONITOR_HTTP_TIMEOUT_MS = Math.max(500, Number(process.env.MONITOR_HTTP_TIMEOUT_MS) || 5000);
const MONITOR_TCP_TIMEOUT_MS = Math.max(500, Number(process.env.MONITOR_TCP_TIMEOUT_MS) || 5000);
const MONITOR_DOCKER_STATS_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.MONITOR_DOCKER_STATS_TIMEOUT_MS) || 5000
);
const MONITOR_LOG_TAIL_LINES = Math.max(1, Number(process.env.MONITOR_LOG_TAIL_LINES) || 20);
const MONITOR_DEFAULT_HEALTH_PATH = String(process.env.MONITOR_DEFAULT_HEALTH_PATH || "/health");
const MONITOR_STREAM_CHANNEL = String(process.env.MONITOR_STREAM_CHANNEL || "monitoring:stream");
const MONITOR_PROJECT_CHANNEL_PREFIX = String(
  process.env.MONITOR_PROJECT_CHANNEL_PREFIX || "monitoring:project:"
);
const MONITOR_DEGRADED_AFTER_FAILURES = Math.max(2, Number(process.env.MONITOR_DEGRADED_AFTER_FAILURES) || 2);
const MONITOR_DOWN_AFTER_FAILURES = Math.max(
  MONITOR_DEGRADED_AFTER_FAILURES + 1,
  Number(process.env.MONITOR_DOWN_AFTER_FAILURES) || 5
);

let dockerClient = null;
let workerTimer = null;
let workerStarted = false;
let tickInProgress = false;
let lastTickStartedAt = null;
let lastTickFinishedAt = null;
let lastTickDurationMs = null;
let lastTickProjectCount = 0;
let lastTickError = null;
let lastPublishedAt = null;
const healthStateByProject = new Map();

const createDockerClient = () => {
  if (process.env.DOCKER_SOCKET_PATH) {
    return new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH });
  }

  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }

  return new Docker({ socketPath: "/var/run/docker.sock" });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async (promiseFactory, timeoutMs, timeoutMessage) => {
  let timer = null;

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return await Promise.race([promiseFactory(), timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const toPercent = (numerator, denominator) => {
  if (!denominator || denominator <= 0) return 0;
  return Math.max(0, Math.min((numerator / denominator) * 100, 100));
};

const toMb = (bytes) => Number((Number(bytes || 0) / (1024 * 1024)).toFixed(2));

const calcCpuPercent = (stats) => {
  const currentCpuTotal = Number(stats?.cpu_stats?.cpu_usage?.total_usage || 0);
  const previousCpuTotal = Number(stats?.precpu_stats?.cpu_usage?.total_usage || 0);
  const currentSystem = Number(stats?.cpu_stats?.system_cpu_usage || 0);
  const previousSystem = Number(stats?.precpu_stats?.system_cpu_usage || 0);

  const cpuDelta = currentCpuTotal - previousCpuTotal;
  const systemDelta = currentSystem - previousSystem;
  const cpuCount = Number(stats?.cpu_stats?.online_cpus || 1);

  if (cpuDelta <= 0 || systemDelta <= 0 || cpuCount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min((cpuDelta / systemDelta) * cpuCount * 100, 100));
};

const parseHealthUrl = (project) => {
  for (const environment of project.environments || []) {
    const cfg = environment?.config || {};

    const candidates = [
      cfg.healthUrl,
      cfg.healthCheckUrl,
      cfg.healthEndpoint,
      cfg.url,
      cfg.baseUrl,
      cfg.serviceUrl,
    ];

    const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
    if (value) {
      return value.trim();
    }
  }

  const projectUrl = typeof project.repoUrl === "string" ? project.repoUrl.trim() : "";
  if (/^https?:\/\//i.test(projectUrl) && !projectUrl.includes("github.com") && !projectUrl.includes("gitlab.com")) {
    return projectUrl.replace(/\/$/, "") + MONITOR_DEFAULT_HEALTH_PATH;
  }

  return null;
};

const parseTcpTarget = (project) => {
  for (const environment of project.environments || []) {
    const cfg = environment?.config || {};

    const hostCandidates = [cfg.tcpHost, cfg.host, cfg.serviceHost, cfg.redisHost, cfg.dbHost, cfg.hostname];
    const portCandidates = [cfg.tcpPort, cfg.port, cfg.servicePort, cfg.redisPort, cfg.dbPort];

    const host = hostCandidates.find((candidate) => typeof candidate === "string" && candidate.trim());
    const rawPort = portCandidates.find((candidate) => Number.isFinite(Number(candidate)));
    const port = Number(rawPort || 0);

    if (host && port > 0 && port <= 65535) {
      return { host: host.trim(), port };
    }
  }

  return null;
};

const probeHttpHealth = async (url) => {
  const start = process.hrtime.bigint();

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(MONITOR_HTTP_TIMEOUT_MS),
      headers: {
        Accept: "application/json,text/plain,*/*",
      },
    });

    const end = process.hrtime.bigint();
    const latencyMs = Number(end - start) / 1e6;

    return {
      ok: response.ok,
      latency: Math.round(latencyMs),
      statusCode: response.status,
    };
  } catch (_error) {
    return {
      ok: false,
      latency: 0,
      statusCode: 0,
    };
  }
};

const probeTcpHealth = ({ host, port }) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const startedAt = process.hrtime.bigint();
    let settled = false;

    const finish = (ok) => {
      if (settled) {
        return;
      }

      settled = true;
      const endedAt = process.hrtime.bigint();
      const latencyMs = Number(endedAt - startedAt) / 1e6;
      socket.destroy();
      resolve({ ok, latency: Math.round(latencyMs), statusCode: ok ? 200 : 0 });
    };

    socket.setTimeout(MONITOR_TCP_TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });

const updateProbeHealthState = ({ projectId, probeOk }) => {
  const key = String(projectId);
  const previous = healthStateByProject.get(key) || { failedProbes: 0, state: "up" };
  const failedProbes = probeOk ? 0 : previous.failedProbes + 1;

  let state = "up";
  if (failedProbes >= MONITOR_DOWN_AFTER_FAILURES) {
    state = "down";
  } else if (failedProbes >= MONITOR_DEGRADED_AFTER_FAILURES) {
    state = "degraded";
  }

  const next = { failedProbes, state, updatedAt: new Date() };
  healthStateByProject.set(key, next);
  return {
    ...next,
    previousState: previous.state,
    changed: previous.state !== state,
  };
};

const notifyHealthTransition = async ({ project, healthState, probeMode, healthUrl, tcpTarget, containerState }) => {
  if (!healthState.changed) {
    return;
  }

  const severity = healthState.state === "down" ? "critical" : healthState.state === "degraded" ? "warning" : "info";
  const transition = `${healthState.previousState} -> ${healthState.state}`;

  try {
    await dispatchProjectNotification({
      projectId: String(project._id),
      event: {
        severity,
        title: `Service health ${healthState.state}`,
        message: `${project.name} health changed (${transition}) after ${healthState.failedProbes} failed probe(s).`,
        serviceName: project.name,
        metricAtTrigger: [
          { label: "failed_probes", value: healthState.failedProbes, unit: "" },
        ],
        metadata: {
          source: "monitor-worker",
          probeMode,
          healthUrl,
          tcpTarget,
          containerState,
          transition,
        },
      },
    });
  } catch (_error) {
    // Notification failures should not affect monitoring loop.
  }
};

const getProjectContainer = async (project) => {
  if (!dockerClient) return null;

  const labeledContainers = await dockerClient.listContainers({
    all: false,
    filters: JSON.stringify({
      label: [`innodeploy.projectId=${String(project._id)}`, `com.innodeploy.projectId=${String(project._id)}`],
    }),
  });

  if (labeledContainers.length > 0) {
    return dockerClient.getContainer(labeledContainers[0].Id);
  }

  const runningContainers = await dockerClient.listContainers({ all: false });
  const projectName = String(project.name || "").toLowerCase();

  const nameMatch = runningContainers.find((containerInfo) =>
    (containerInfo.Names || []).some((name) => String(name).toLowerCase().includes(projectName))
  );

  return nameMatch ? dockerClient.getContainer(nameMatch.Id) : null;
};

const getContainerStats = async (container) => {
  if (!container) {
    return {
      cpuPercent: 0,
      memoryMb: 0,
      memoryPercent: 0,
      netRxBytes: 0,
      netTxBytes: 0,
      restartCount: 0,
      uptimeSeconds: 0,
      hasContainer: false,
      containerState: "missing",
      containerName: "",
      containerId: "",
    };
  }

  const [stats, inspect] = await Promise.all([
    withTimeout(() => container.stats({ stream: false }), MONITOR_DOCKER_STATS_TIMEOUT_MS, "Docker stats timeout"),
    withTimeout(() => container.inspect(), MONITOR_DOCKER_STATS_TIMEOUT_MS, "Docker inspect timeout"),
  ]);

  const memoryUsage = Number(stats?.memory_stats?.usage || 0);
  const memoryLimit = Number(stats?.memory_stats?.limit || 0);
  const networks = stats?.networks && typeof stats.networks === "object" ? Object.values(stats.networks) : [];
  const netRxBytes = networks.reduce((sum, network) => sum + Number(network?.rx_bytes || 0), 0);
  const netTxBytes = networks.reduce((sum, network) => sum + Number(network?.tx_bytes || 0), 0);

  const startedAt = inspect?.State?.StartedAt ? new Date(inspect.State.StartedAt) : null;
  const uptimeSeconds = startedAt && Number.isFinite(startedAt.getTime())
    ? Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000))
    : 0;

  return {
    cpuPercent: Number(calcCpuPercent(stats).toFixed(2)),
    memoryMb: toMb(memoryUsage),
    memoryPercent: Number(toPercent(memoryUsage, memoryLimit).toFixed(2)),
    netRxBytes,
    netTxBytes,
    restartCount: Number(inspect?.RestartCount || 0),
    uptimeSeconds,
    hasContainer: true,
    containerState: String(inspect?.State?.Status || "unknown").toLowerCase(),
    containerName: String(inspect?.Name || "").replace(/^\//, ""),
    containerId: String(inspect?.Id || ""),
  };
};

const getHostDiskUsage = async () => {
  try {
    const stats = await withTimeout(
      () => statfs(process.cwd()),
      MONITOR_DOCKER_STATS_TIMEOUT_MS,
      "Host disk usage probe timeout"
    );

    const blockSize = Number(stats?.bsize || 0);
    const totalBlocks = Number(stats?.blocks || 0);
    const freeBlocks = Number(stats?.bfree || 0);
    if (blockSize <= 0 || totalBlocks <= 0) {
      return { mb: 0, percent: 0 };
    }

    const usedBytes = Math.max(0, (totalBlocks - freeBlocks) * blockSize);
    const totalBytes = totalBlocks * blockSize;
    const percent = totalBytes > 0 ? Math.min(100, Math.max(0, (usedBytes / totalBytes) * 100)) : 0;

    return {
      mb: toMb(usedBytes),
      percent: Number(percent.toFixed(2)),
    };
  } catch (_error) {
    return { mb: 0, percent: 0 };
  }
};

const getContainerLogSignals = async (container) => {
  if (!container) {
    return { errors: 0, warns: 0 };
  }

  const logBuffer = await withTimeout(
    () =>
      container.logs({
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: MONITOR_LOG_TAIL_LINES,
      }),
    MONITOR_DOCKER_STATS_TIMEOUT_MS,
    "Docker logs timeout"
  );

  const lines = String(logBuffer || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let errors = 0;
  let warns = 0;

  for (const line of lines) {
    if (/\berror\b|\bfail(ed|ure)?\b/i.test(line)) errors += 1;
    if (/\bwarn(ing)?\b/i.test(line)) warns += 1;
  }

  return { errors, warns };
};

const publishDelta = async (payload) => {
  if (!redisClient?.isOpen) {
    return;
  }

  const serialized = JSON.stringify(payload);

  await Promise.all([
    redisClient.publish(`${MONITOR_PROJECT_CHANNEL_PREFIX}${payload.projectId}`, serialized),
    redisClient.publish(MONITOR_STREAM_CHANNEL, serialized),
  ]);

  lastPublishedAt = new Date();
};

const createMetricRecord = async ({
  projectId,
  environment,
  cpuPercent,
  memoryMb,
  memoryPercent,
  netRxBytes,
  netTxBytes,
  httpStatus,
  httpLatencyMs,
  restartCount,
  uptimeSeconds,
  diskUsageMb,
  diskUsagePercent,
  healthState,
  failedProbes,
  probeMode,
  uptime,
}) => {
  return Metric.create({
    projectId,
    hostId: null,
    environment,
    cpu: cpuPercent,
    cpu_percent: cpuPercent,
    memory: memoryPercent,
    memory_mb: memoryMb,
    memory_percent: memoryPercent,
    net_rx_bytes: netRxBytes,
    net_tx_bytes: netTxBytes,
    http_status: httpStatus,
    latency: httpLatencyMs,
    http_latency_ms: httpLatencyMs,
    restart_count: restartCount,
    uptime,
    uptime_s: uptimeSeconds,
    disk_usage_mb: diskUsageMb,
    disk_usage_percent: diskUsagePercent,
    health_state: healthState,
    failed_probes: failedProbes,
    probe_mode: probeMode,
    recordedAt: new Date(),
  });
};

const maybeLogWorkerSignal = async ({ projectId, environment, signal }) => {
  if (signal.errors === 0 && signal.warns === 0) {
    return;
  }

  await Log.create({
    projectId,
    level: signal.errors > 0 ? "error" : "warn",
    message: `Monitor Worker detected ${signal.errors} error line(s) and ${signal.warns} warning line(s) in container logs`,
    environment,
    source: "monitor-worker",
    stream: "system",
    metadata: signal,
    eventAt: new Date(),
  });
};

const resolveEnvironmentName = (project) => {
  const firstEnvironment = project.environments?.[0]?.name;
  return typeof firstEnvironment === "string" && firstEnvironment.trim()
    ? firstEnvironment.trim().toLowerCase()
    : "default";
};

const evaluateProject = async (project) => {
  const environment = resolveEnvironmentName(project);
  const healthUrl = parseHealthUrl(project);
  const tcpTarget = parseTcpTarget(project);
  const probeMode = healthUrl ? "http" : tcpTarget ? "tcp" : "container";

  const [healthResult, containerResult, diskUsage] = await Promise.all([
    healthUrl
      ? probeHttpHealth(healthUrl)
      : tcpTarget
        ? probeTcpHealth(tcpTarget)
        : Promise.resolve({ ok: false, latency: 0, statusCode: 0 }),
    (async () => {
      try {
        const container = await getProjectContainer(project);
        const stats = await getContainerStats(container);
        const signal = await getContainerLogSignals(container);
        return { ...stats, signal };
      } catch (_error) {
        return {
          cpuPercent: 0,
          memoryMb: 0,
          memoryPercent: 0,
          netRxBytes: 0,
          netTxBytes: 0,
          restartCount: 0,
          uptimeSeconds: 0,
          hasContainer: false,
          containerState: "missing",
          containerName: "",
          containerId: "",
          signal: { errors: 0, warns: 0 },
        };
      }
    })(),
    getHostDiskUsage(),
  ]);

  const probeOk = probeMode === "container"
    ? containerResult.hasContainer && containerResult.containerState === "running"
    : healthResult.ok;
  const healthState = updateProbeHealthState({ projectId: project._id, probeOk });

  const uptime = probeOk ? 100 : 0;
  const httpStatus = healthResult.statusCode;
  const httpLatencyMs = healthResult.latency;
  const cpuPercent = containerResult.cpuPercent;
  const memoryMb = containerResult.memoryMb;
  const memoryPercent = containerResult.memoryPercent;
  const netRxBytes = containerResult.netRxBytes;
  const netTxBytes = containerResult.netTxBytes;
  const restartCount = containerResult.restartCount;
  const uptimeSeconds = containerResult.uptimeSeconds;

  const diskUsageMb = Number(diskUsage?.mb || 0);
  const diskUsagePercent = Number(diskUsage?.percent || 0);

  const metric = await createMetricRecord({
    projectId: project._id,
    environment,
    cpuPercent,
    memoryMb,
    memoryPercent,
    netRxBytes,
    netTxBytes,
    httpStatus,
    httpLatencyMs,
    restartCount,
    uptimeSeconds,
    diskUsageMb,
    diskUsagePercent,
    healthState: healthState.state,
    failedProbes: healthState.failedProbes,
    probeMode,
    uptime,
  });

  await maybeLogWorkerSignal({
    projectId: project._id,
    environment,
    signal: containerResult.signal,
  });

  await notifyHealthTransition({
    project,
    healthState,
    probeMode,
    healthUrl,
    tcpTarget,
    containerState: containerResult.containerState,
  });

  await evaluateMonitoringAlertRules({ project, metric });

  const deltaPayload = {
    type: "metric.delta",
    projectId: String(project._id),
    projectName: project.name,
    environment,
    metric: {
      id: String(metric._id),
      cpu: cpuPercent,
      cpu_percent: cpuPercent,
      memory: memoryPercent,
      memory_mb: memoryMb,
      memory_percent: memoryPercent,
      net_rx_bytes: netRxBytes,
      net_tx_bytes: netTxBytes,
      http_status: httpStatus,
      latency: httpLatencyMs,
      http_latency_ms: httpLatencyMs,
      restart_count: restartCount,
      uptime,
      uptime_s: uptimeSeconds,
      disk_usage_mb: diskUsageMb,
      disk_usage_percent: diskUsagePercent,
      health_state: healthState.state,
      failed_probes: healthState.failedProbes,
      probe_mode: probeMode,
      recordedAt: metric.recordedAt,
    },
    health: {
      url: healthUrl,
      tcp: tcpTarget,
      mode: probeMode,
      statusCode: healthResult.statusCode,
      ok: probeOk,
      state: healthState.state,
      failedProbes: healthState.failedProbes,
    },
    container: {
      id: containerResult.containerId,
      name: containerResult.containerName,
      hasContainer: containerResult.hasContainer,
      state: containerResult.containerState,
      signal: containerResult.signal,
    },
    createdAt: new Date().toISOString(),
  };

  await publishDelta(deltaPayload);
};

const monitorTick = async () => {
  if (tickInProgress) {
    return;
  }

  tickInProgress = true;
  lastTickStartedAt = new Date();
  const startedAtMs = Date.now();

  try {
    const projects = await Project.find({ status: "running" }).select("_id name repoUrl environments status organisationId branch");
    lastTickProjectCount = projects.length;
    lastTickError = null;

    for (const project of projects) {
      try {
        await evaluateProject(project);
      } catch (error) {
        console.warn(`[monitor-worker] Failed project tick ${project.name}:`, error.message);
      }

      await sleep(10);
    }
  } catch (error) {
    lastTickError = error.message;
    console.warn("[monitor-worker] Tick failed:", error.message);
  } finally {
    lastTickFinishedAt = new Date();
    lastTickDurationMs = Date.now() - startedAtMs;
    tickInProgress = false;
  }
};

const ensureMetricCollectionPrepared = async () => {
  const db = Metric.db.db;
  if (!db) {
    return;
  }

  const collectionName = Metric.collection.collectionName || "metrics";
  const collections = await db.listCollections({ name: collectionName }).toArray();

  if (collections.length > 0) {
    return;
  }

  try {
    await db.createCollection(collectionName, {
      timeseries: {
        timeField: "recordedAt",
        metaField: "projectId",
        granularity: "minutes",
      },
    });
    console.log(`[monitor-worker] Created time-series collection '${collectionName}'`);
  } catch (error) {
    console.warn("[monitor-worker] Could not create time-series collection", error.message);
  }
};

const startMonitorWorker = async () => {
  if (!MONITOR_WORKER_ENABLED || workerStarted) {
    return;
  }

  try {
    dockerClient = createDockerClient();
    await dockerClient.ping();
  } catch (error) {
    dockerClient = null;
    console.warn("[monitor-worker] Docker unavailable, continuing with HTTP-only probes", error.message);
  }

  await ensureMetricCollectionPrepared();
  await monitorTick();

  workerTimer = setInterval(() => {
    monitorTick().catch((error) => {
      console.warn("[monitor-worker] Interval execution failure", error.message);
    });
  }, MONITOR_INTERVAL_MS);

  workerStarted = true;
  console.log(`[monitor-worker] Started (interval ${MONITOR_INTERVAL_MS}ms)`);
};

const getMonitorWorkerStatus = () => ({
  enabled: MONITOR_WORKER_ENABLED,
  started: workerStarted,
  tickInProgress,
  intervalMs: MONITOR_INTERVAL_MS,
  httpTimeoutMs: MONITOR_HTTP_TIMEOUT_MS,
  tcpTimeoutMs: MONITOR_TCP_TIMEOUT_MS,
  degradedAfterFailures: MONITOR_DEGRADED_AFTER_FAILURES,
  downAfterFailures: MONITOR_DOWN_AFTER_FAILURES,
  dockerStatsTimeoutMs: MONITOR_DOCKER_STATS_TIMEOUT_MS,
  logTailLines: MONITOR_LOG_TAIL_LINES,
  defaultHealthPath: MONITOR_DEFAULT_HEALTH_PATH,
  lastTickStartedAt,
  lastTickFinishedAt,
  lastTickDurationMs,
  lastTickProjectCount,
  lastTickError,
  lastPublishedAt,
  dockerAvailable: Boolean(dockerClient),
  redisConnected: Boolean(redisClient?.isOpen),
  channels: {
    stream: MONITOR_STREAM_CHANNEL,
    projectPrefix: MONITOR_PROJECT_CHANNEL_PREFIX,
  },
});

module.exports = {
  startMonitorWorker,
  getMonitorWorkerStatus,
};
