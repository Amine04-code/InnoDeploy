const IORedis = require("ioredis");
const { Worker } = require("bullmq");
const mongoose = require("mongoose");

const { redisClient } = require("../config/redis");
const Log = require("../models/Log");
const Pipeline = require("../models/Pipeline");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const DEPLOY_WORKER_ENABLED = TRUE_VALUES.has(
  String(process.env.DEPLOY_WORKER_ENABLED || "false").toLowerCase()
);
const DEPLOY_WORKER_CONCURRENCY = Math.max(1, Number(process.env.DEPLOY_WORKER_CONCURRENCY) || 1);
const DEPLOY_QUEUE_NAME = String(process.env.DEPLOY_QUEUE_NAME || process.env.DEPLOY_QUEUE_KEY || "deploy-jobs");
const DEPLOY_EVENTS_CHANNEL = String(process.env.DEPLOY_EVENTS_CHANNEL || "deploy:events");
const DEPLOY_CANARY_TRAFFIC_PERCENT = Math.max(1, Math.min(Number(process.env.DEPLOY_CANARY_TRAFFIC_PERCENT) || 10, 100));
const DEPLOY_CANARY_WINDOW_MS = Math.max(5000, Number(process.env.DEPLOY_CANARY_WINDOW_MS) || 300000);
const DEPLOY_CANARY_ERROR_RATE_THRESHOLD = Math.max(
  0,
  Math.min(Number(process.env.DEPLOY_CANARY_ERROR_RATE_THRESHOLD) || 0.02, 1)
);
const DEPLOY_BLUE_GREEN_DRAIN_MS = Math.max(1000, Number(process.env.DEPLOY_BLUE_GREEN_DRAIN_MS) || 60000);
const DEPLOY_HEALTHCHECK_INTERVAL_MS = Math.max(1000, Number(process.env.DEPLOY_HEALTHCHECK_INTERVAL_MS) || 5000);
const DEPLOY_HEALTHCHECK_ATTEMPTS = Math.max(1, Number(process.env.DEPLOY_HEALTHCHECK_ATTEMPTS) || 5);
const TRAEFIK_ROUTE_EVENTS_CHANNEL = String(process.env.TRAEFIK_ROUTE_EVENTS_CHANNEL || "traefik:route-events");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let bullConnection = null;
let deployWorker = null;
let workerStarted = false;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const publishEvent = async (event) => {
  if (!redisClient?.isOpen) {
    return;
  }

  const serialized = JSON.stringify(event);
  await Promise.all([
    redisClient.publish(DEPLOY_EVENTS_CHANNEL, serialized),
    redisClient.publish(TRAEFIK_ROUTE_EVENTS_CHANNEL, serialized),
  ]);
};

const checkHealth = async (url) => {
  if (!url) {
    return true;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(Math.max(1000, DEPLOY_HEALTHCHECK_INTERVAL_MS - 500)),
    });
    return response.ok;
  } catch (_error) {
    return false;
  }
};

const waitForHealthGate = async (url) => {
  for (let attempt = 1; attempt <= DEPLOY_HEALTHCHECK_ATTEMPTS; attempt += 1) {
    if (await checkHealth(url)) {
      return true;
    }

    await sleep(DEPLOY_HEALTHCHECK_INTERVAL_MS);
  }

  return false;
};

const pushStep = (deployment, name, command, status, duration, output) => {
  deployment.steps.push({
    name,
    command,
    status,
    duration,
    output,
  });
};

const runRollingStrategy = async (deployment, job) => {
  const replicas = Math.max(1, Number(job.replicas) || 3);

  for (let replica = 1; replica <= replicas; replica += 1) {
    const startedAt = Date.now();

    await publishEvent({
      type: "deploy.rolling.replace",
      projectId: String(job.projectId),
      deploymentId: String(deployment._id),
      replica,
      replicas,
      createdAt: new Date().toISOString(),
    });

    const healthy = await waitForHealthGate(job.healthUrl);
    if (!healthy) {
      pushStep(
        deployment,
        `rolling-replica-${replica}`,
        "replace one replica and validate health",
        "failed",
        Date.now() - startedAt,
        "Health gate failed"
      );
      throw new Error(`rolling deployment failed health gate at replica ${replica}`);
    }

    pushStep(
      deployment,
      `rolling-replica-${replica}`,
      "replace one replica and validate health",
      "success",
      Date.now() - startedAt,
      "Replica replaced successfully"
    );
  }
};

const runBlueGreenStrategy = async (deployment, job) => {
  const spinUpStartedAt = Date.now();
  await publishEvent({
    type: "deploy.bluegreen.spinup",
    projectId: String(job.projectId),
    deploymentId: String(deployment._id),
    createdAt: new Date().toISOString(),
  });

  const healthy = await waitForHealthGate(job.healthUrl);
  if (!healthy) {
    pushStep(
      deployment,
      "blue-green-spinup",
      "spin up green stack and run health gate",
      "failed",
      Date.now() - spinUpStartedAt,
      "Green stack health gate failed"
    );
    throw new Error("blue-green deployment failed at health gate");
  }

  pushStep(
    deployment,
    "blue-green-spinup",
    "spin up green stack and run health gate",
    "success",
    Date.now() - spinUpStartedAt,
    "Green stack healthy"
  );

  const switchStartedAt = Date.now();
  await publishEvent({
    type: "deploy.bluegreen.switch-route",
    projectId: String(job.projectId),
    deploymentId: String(deployment._id),
    via: "traefik",
    createdAt: new Date().toISOString(),
  });
  pushStep(
    deployment,
    "blue-green-route-switch",
    "switch Traefik route to green stack",
    "success",
    Date.now() - switchStartedAt,
    "Traffic switched to green"
  );

  const drainStartedAt = Date.now();
  await sleep(DEPLOY_BLUE_GREEN_DRAIN_MS);
  pushStep(
    deployment,
    "blue-green-drain-old",
    `drain old stack for ${DEPLOY_BLUE_GREEN_DRAIN_MS}ms`,
    "success",
    Date.now() - drainStartedAt,
    "Old stack drained"
  );
};

const runCanaryStrategy = async (deployment, job) => {
  const canaryStartedAt = Date.now();
  await publishEvent({
    type: "deploy.canary.start",
    projectId: String(job.projectId),
    deploymentId: String(deployment._id),
    trafficPercent: DEPLOY_CANARY_TRAFFIC_PERCENT,
    createdAt: new Date().toISOString(),
  });

  pushStep(
    deployment,
    "canary-route",
    `route ${DEPLOY_CANARY_TRAFFIC_PERCENT}% traffic to canary`,
    "success",
    Date.now() - canaryStartedAt,
    "Canary traffic applied"
  );

  let checks = 0;
  let failedChecks = 0;
  const evaluationEnd = Date.now() + DEPLOY_CANARY_WINDOW_MS;

  while (Date.now() < evaluationEnd) {
    checks += 1;
    const healthy = await checkHealth(job.healthUrl);
    if (!healthy) {
      failedChecks += 1;
    }
    await sleep(DEPLOY_HEALTHCHECK_INTERVAL_MS);
  }

  const observedErrorRate = checks === 0 ? 0 : failedChecks / checks;

  if (observedErrorRate > DEPLOY_CANARY_ERROR_RATE_THRESHOLD) {
    pushStep(
      deployment,
      "canary-evaluate",
      `evaluate error rate threshold ${DEPLOY_CANARY_ERROR_RATE_THRESHOLD}`,
      "failed",
      DEPLOY_CANARY_WINDOW_MS,
      `Observed error rate ${observedErrorRate.toFixed(4)}`
    );
    throw new Error(`canary rejected: error rate ${observedErrorRate.toFixed(4)} exceeded threshold`);
  }

  await publishEvent({
    type: "deploy.canary.promote",
    projectId: String(job.projectId),
    deploymentId: String(deployment._id),
    errorRate: observedErrorRate,
    createdAt: new Date().toISOString(),
  });

  pushStep(
    deployment,
    "canary-evaluate",
    `evaluate error rate threshold ${DEPLOY_CANARY_ERROR_RATE_THRESHOLD}`,
    "success",
    DEPLOY_CANARY_WINDOW_MS,
    `Observed error rate ${observedErrorRate.toFixed(4)} and promoted`
  );
};

const processDeployJob = async (job) => {
  if (!isValidObjectId(job.projectId)) {
    throw new Error("deploy job missing a valid projectId");
  }

  const startedAt = Date.now();
  const strategy = String(job.strategy || "rolling").toLowerCase();
  if (!["rolling", "blue-green", "canary"].includes(strategy)) {
    throw new Error(`unsupported deployment strategy '${strategy}'`);
  }

  const deployment = await Pipeline.create({
    projectId: job.projectId,
    version: String(job.version || `deploy-${Date.now()}`),
    strategy,
    runType: "deployment",
    status: "in-progress",
    branch: String(job.branch || "main"),
    triggeredBy: String(job.triggeredBy || "system"),
    environment: String(job.environment || "production"),
    steps: [],
  });

  await publishEvent({
    type: "deploy.started",
    projectId: String(job.projectId),
    deploymentId: String(deployment._id),
    strategy,
    createdAt: new Date().toISOString(),
  });

  try {
    if (strategy === "rolling") {
      await runRollingStrategy(deployment, job);
    } else if (strategy === "blue-green") {
      await runBlueGreenStrategy(deployment, job);
    } else {
      await runCanaryStrategy(deployment, job);
    }

    deployment.status = "success";
    deployment.duration = Date.now() - startedAt;
    await deployment.save();

    await Log.create({
      projectId: job.projectId,
      pipelineId: deployment._id,
      level: "info",
      message: `Deploy worker completed ${deployment.version} using ${deployment.strategy}`,
      environment: deployment.environment,
      source: "deploy-worker",
      stream: "system",
    });

    await publishEvent({
      type: "deploy.completed",
      projectId: String(job.projectId),
      deploymentId: String(deployment._id),
      status: deployment.status,
      strategy: deployment.strategy,
      duration: deployment.duration,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    deployment.status = "failed";
    deployment.duration = Date.now() - startedAt;
    await deployment.save();

    await Log.create({
      projectId: job.projectId,
      pipelineId: deployment._id,
      level: "error",
      message: `Deploy worker failed (${strategy}): ${error.message}`,
      environment: deployment.environment,
      source: "deploy-worker",
      stream: "system",
    });

    await publishEvent({
      type: "deploy.failed",
      projectId: String(job.projectId),
      deploymentId: String(deployment._id),
      strategy,
      error: error.message,
      createdAt: new Date().toISOString(),
    });

    throw error;
  }
};

const startDeployWorker = async () => {
  if (!DEPLOY_WORKER_ENABLED || workerStarted) {
    return;
  }

  bullConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  deployWorker = new Worker(
    DEPLOY_QUEUE_NAME,
    async (job) => {
      await processDeployJob(job.data || {});
    },
    {
      connection: bullConnection,
      concurrency: DEPLOY_WORKER_CONCURRENCY,
    }
  );

  deployWorker.on("failed", (job, error) => {
    console.warn(`[deploy-worker] job failed (${job?.id || "unknown"})`, error.message);
  });

  deployWorker.on("completed", (job) => {
    console.log(`[deploy-worker] job completed (${job.id})`);
  });

  workerStarted = true;
  console.log(`[deploy-worker] started (queue=${DEPLOY_QUEUE_NAME}, concurrency=${DEPLOY_WORKER_CONCURRENCY})`);
};

module.exports = {
  startDeployWorker,
};
