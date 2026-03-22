const Docker = require("dockerode");

const Log = require("../models/Log");
const Metric = require("../models/Metric");
const Project = require("../models/Project");
const { redisClient } = require("../config/redis");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

const MONITOR_WORKER_ENABLED = TRUE_VALUES.has(
  String(process.env.MONITOR_WORKER_ENABLED || "false").toLowerCase()
);
const MONITOR_INTERVAL_MS = Math.max(5000, Number(process.env.MONITOR_INTERVAL_MS) || 15000);
const MONITOR_HTTP_TIMEOUT_MS = Math.max(500, Number(process.env.MONITOR_HTTP_TIMEOUT_MS) || 4000);
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
      cpu: 0,
      memory: 0,
      hasContainer: false,
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

  return {
    cpu: Number(calcCpuPercent(stats).toFixed(2)),
    memory: Number(toPercent(memoryUsage, memoryLimit).toFixed(2)),
    hasContainer: true,
    containerName: String(inspect?.Name || "").replace(/^\//, ""),
    containerId: String(inspect?.Id || ""),
  };
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

const createMetricRecord = async ({ projectId, environment, cpu, memory, latency, uptime }) => {
  return Metric.create({
    projectId,
    hostId: null,
    environment,
    cpu,
    memory,
    latency,
    uptime,
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

  const [healthResult, containerResult] = await Promise.all([
    healthUrl ? probeHttpHealth(healthUrl) : Promise.resolve({ ok: false, latency: 0, statusCode: 0 }),
    (async () => {
      try {
        const container = await getProjectContainer(project);
        const stats = await getContainerStats(container);
        const signal = await getContainerLogSignals(container);
        return { ...stats, signal };
      } catch (_error) {
        return {
          cpu: 0,
          memory: 0,
          hasContainer: false,
          containerName: "",
          containerId: "",
          signal: { errors: 0, warns: 0 },
        };
      }
    })(),
  ]);

  const uptime = healthUrl ? (healthResult.ok ? 100 : 0) : containerResult.hasContainer ? 100 : 0;
  const latency = healthResult.latency;
  const cpu = containerResult.cpu;
  const memory = containerResult.memory;

  const metric = await createMetricRecord({
    projectId: project._id,
    environment,
    cpu,
    memory,
    latency,
    uptime,
  });

  await maybeLogWorkerSignal({
    projectId: project._id,
    environment,
    signal: containerResult.signal,
  });

  const deltaPayload = {
    type: "metric.delta",
    projectId: String(project._id),
    projectName: project.name,
    environment,
    metric: {
      id: String(metric._id),
      cpu,
      memory,
      latency,
      uptime,
      recordedAt: metric.recordedAt,
    },
    health: {
      url: healthUrl,
      statusCode: healthResult.statusCode,
      ok: healthResult.ok,
    },
    container: {
      id: containerResult.containerId,
      name: containerResult.containerName,
      hasContainer: containerResult.hasContainer,
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
    const projects = await Project.find({ status: "running" }).select("_id name repoUrl environments status");
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
