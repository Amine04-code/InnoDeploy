const { PassThrough } = require("stream");

const Docker = require("dockerode");
const mongoose = require("mongoose");

const { redisClient } = require("../config/redis");
const Log = require("../models/Log");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const LOG_COLLECTOR_ENABLED = TRUE_VALUES.has(String(process.env.LOG_COLLECTOR_ENABLED || "false").toLowerCase());
const LOG_COLLECTOR_SOURCE = String(process.env.LOG_COLLECTOR_SOURCE || "docker");
const LOG_COLLECTOR_SINCE_SECONDS = Math.max(0, Number(process.env.LOG_COLLECTOR_SINCE_SECONDS) || 5);
const LOG_MAX_MESSAGE_LENGTH = Math.max(256, Number(process.env.LOG_MAX_MESSAGE_LENGTH) || 8000);
const LOG_STREAM_CHANNEL = String(process.env.LOG_STREAM_CHANNEL || "logs:stream");
const LOG_PROJECT_CHANNEL_PREFIX = String(process.env.LOG_PROJECT_CHANNEL_PREFIX || "logs:project:");
const LOG_COLLECTION_CAPPED_ENABLED = TRUE_VALUES.has(
  String(process.env.LOG_COLLECTION_CAPPED_ENABLED || "true").toLowerCase()
);
const LOG_COLLECTION_CAP_BYTES = Math.max(1024 * 1024, Number(process.env.LOG_COLLECTION_CAP_BYTES) || 100 * 1024 * 1024);

const containerLogStreams = new Map();

let dockerClient = null;
let dockerEventsStream = null;
let collectorStarted = false;
let collectorStarting = false;

const createDockerClient = () => {
  if (process.env.DOCKER_SOCKET_PATH) {
    return new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH });
  }

  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }

  return new Docker({ socketPath: "/var/run/docker.sock" });
};

const toSafeString = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
};

const normalizeLevel = (value, streamName) => {
  const candidate = toSafeString(value).toLowerCase();
  if (["debug", "info", "warn", "error"].includes(candidate)) {
    return candidate;
  }
  return streamName === "stderr" ? "error" : "info";
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parseDateCandidate = (value) => {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const extractProjectId = (parsedPayload, context) => {
  const labels = context.labels || {};

  const candidates = [
    parsedPayload?.projectId,
    labels["innodeploy.projectId"],
    labels["com.innodeploy.projectId"],
    labels["projectId"],
  ];

  const valid = candidates.find((candidate) => isValidObjectId(candidate));
  return valid ? String(valid) : null;
};

const extractPipelineId = (parsedPayload) => {
  if (!parsedPayload || !isValidObjectId(parsedPayload.pipelineId)) {
    return null;
  }
  return String(parsedPayload.pipelineId);
};

const parseLine = (rawLine) => {
  const line = toSafeString(rawLine).trim();
  if (!line) return null;

  const firstSpace = line.indexOf(" ");
  let eventAt = new Date();
  let messageSegment = line;

  if (firstSpace > 0) {
    const timestampCandidate = line.slice(0, firstSpace);
    const parsedTimestamp = new Date(timestampCandidate);

    if (!Number.isNaN(parsedTimestamp.getTime())) {
      eventAt = parsedTimestamp;
      messageSegment = line.slice(firstSpace + 1);
    }
  }

  let parsedPayload = null;
  try {
    parsedPayload = JSON.parse(messageSegment);
  } catch (_error) {
    parsedPayload = null;
  }

  if (parsedPayload && typeof parsedPayload === "object") {
    const payloadTimestamp =
      parseDateCandidate(parsedPayload.timestamp) ||
      parseDateCandidate(parsedPayload.time) ||
      parseDateCandidate(parsedPayload.ts) ||
      parseDateCandidate(parsedPayload.datetime);

    if (payloadTimestamp) {
      eventAt = payloadTimestamp;
    }
  }

  return { eventAt, messageSegment, parsedPayload };
};

const extractMessage = (parsedPayload, messageSegment) => {
  if (!parsedPayload || typeof parsedPayload !== "object") {
    return messageSegment;
  }

  const candidate =
    (typeof parsedPayload.message === "string" && parsedPayload.message) ||
    (typeof parsedPayload.msg === "string" && parsedPayload.msg) ||
    (typeof parsedPayload.log === "string" && parsedPayload.log) ||
    messageSegment;

  return candidate;
};

const extractLevel = (parsedPayload, streamName) => {
  if (!parsedPayload || typeof parsedPayload !== "object") {
    return normalizeLevel(null, streamName);
  }

  const candidate = parsedPayload.level || parsedPayload.severity || parsedPayload.lvl;
  return normalizeLevel(candidate, streamName);
};

const publishLogLine = async (payload) => {
  if (!redisClient?.isOpen) {
    return;
  }

  const serialized = JSON.stringify(payload);
  await Promise.all([
    redisClient.publish(LOG_STREAM_CHANNEL, serialized),
    redisClient.publish(`${LOG_PROJECT_CHANNEL_PREFIX}${payload.projectId}`, serialized),
  ]);
};

const persistLogLine = async ({ streamName, line, context }) => {
  const parsed = parseLine(line);
  if (!parsed) return;

  const { eventAt, messageSegment, parsedPayload } = parsed;
  const projectId = extractProjectId(parsedPayload, context);

  if (!projectId) {
    return;
  }

  const payloadMessage = extractMessage(parsedPayload, messageSegment);
  const message = payloadMessage.length > LOG_MAX_MESSAGE_LENGTH
    ? payloadMessage.slice(0, LOG_MAX_MESSAGE_LENGTH)
    : payloadMessage;

  const document = {
    projectId,
    pipelineId: extractPipelineId(parsedPayload),
    level: extractLevel(parsedPayload, streamName),
    message,
    environment: toSafeString(parsedPayload?.environment, ""),
    source: toSafeString(parsedPayload?.source, `${LOG_COLLECTOR_SOURCE}:${context.containerName}`),
    containerId: context.containerId,
    containerName: context.containerName,
    stream: streamName,
    timestamp: eventAt,
    eventAt,
    ingestionSource: "docker.logs",
    metadata: parsedPayload && typeof parsedPayload === "object" ? parsedPayload : null,
  };

  const saved = await Log.create(document);

  await publishLogLine({
    type: "log.line",
    id: String(saved._id),
    projectId,
    pipelineId: saved.pipelineId ? String(saved.pipelineId) : null,
    timestamp: saved.timestamp,
    level: saved.level,
    message: saved.message,
    containerId: saved.containerId,
    containerName: saved.containerName,
    stream: saved.stream,
    source: saved.source,
  });
};

const processBufferedLines = async ({ bufferState, streamName, chunk, context }) => {
  bufferState.value += chunk.toString("utf8");
  const lines = bufferState.value.split(/\r?\n/);
  bufferState.value = lines.pop() || "";

  for (const line of lines) {
    try {
      await persistLogLine({ streamName, line, context });
    } catch (error) {
      console.warn("[log-collector] Failed to persist log line", error.message);
    }
  }
};

const consumeLineStream = (stream, streamName, context) => {
  const bufferState = { value: "" };

  stream.on("data", async (chunk) => {
    stream.pause();
    await processBufferedLines({ bufferState, streamName, chunk, context });
    stream.resume();
  });

  stream.on("end", async () => {
    if (!bufferState.value) return;
    try {
      await persistLogLine({ streamName, line: bufferState.value, context });
    } catch (error) {
      console.warn("[log-collector] Failed to persist final log line", error.message);
    }
  });
};

const attachContainerLogs = async (containerId) => {
  if (!dockerClient || containerLogStreams.has(containerId)) {
    return;
  }

  const container = dockerClient.getContainer(containerId);
  const inspection = await container.inspect();

  if (!inspection?.State?.Running) {
    return;
  }

  const containerName = toSafeString(inspection.Name || "").replace(/^\//, "") || containerId.slice(0, 12);
  const context = {
    containerId,
    containerName,
    labels: {
      ...(inspection.Config?.Labels || {}),
      ...(inspection.ContainerConfig?.Labels || {}),
    },
  };

  const stream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    timestamps: true,
    since: Math.floor(Date.now() / 1000) - LOG_COLLECTOR_SINCE_SECONDS,
  });

  if (!stream || typeof stream.on !== "function") {
    return;
  }

  const stdoutPassThrough = new PassThrough();
  const stderrPassThrough = new PassThrough();

  try {
    dockerClient.modem.demuxStream(stream, stdoutPassThrough, stderrPassThrough);
    consumeLineStream(stdoutPassThrough, "stdout", context);
    consumeLineStream(stderrPassThrough, "stderr", context);
  } catch (_demuxError) {
    consumeLineStream(stream, "stdout", context);
  }

  stream.on("end", () => {
    containerLogStreams.delete(containerId);
  });

  stream.on("error", (error) => {
    containerLogStreams.delete(containerId);
    console.warn(`[log-collector] Container stream error (${containerName})`, error.message);
  });

  containerLogStreams.set(containerId, stream);
};

const detachContainerLogs = (containerId) => {
  const stream = containerLogStreams.get(containerId);
  if (!stream) return;

  try {
    stream.destroy();
  } catch (_error) {
    // Ignore cleanup errors.
  }

  containerLogStreams.delete(containerId);
};

const hydrateRunningContainers = async () => {
  const runningContainers = await dockerClient.listContainers({ all: false });
  await Promise.all(
    runningContainers.map(async (containerInfo) => {
      try {
        await attachContainerLogs(containerInfo.Id);
      } catch (error) {
        console.warn("[log-collector] Failed to attach container", error.message);
      }
    })
  );
};

const handleDockerEventLine = async (line) => {
  let event = null;

  try {
    event = JSON.parse(toSafeString(line));
  } catch (_error) {
    return;
  }

  const status = event?.status;
  const containerId = event?.id;

  if (!containerId || !status) {
    return;
  }

  if (status === "start" || status === "restart") {
    try {
      await attachContainerLogs(containerId);
    } catch (error) {
      console.warn("[log-collector] Failed to attach on event", error.message);
    }
  }

  if (status === "die" || status === "destroy" || status === "stop") {
    detachContainerLogs(containerId);
  }
};

const watchDockerEvents = async () => {
  dockerEventsStream = await dockerClient.getEvents({
    filters: JSON.stringify({
      type: ["container"],
      event: ["start", "restart", "stop", "die", "destroy"],
    }),
  });

  const bufferState = { value: "" };

  dockerEventsStream.on("data", async (chunk) => {
    dockerEventsStream.pause();
    bufferState.value += chunk.toString("utf8");

    const lines = bufferState.value.split(/\r?\n/);
    bufferState.value = lines.pop() || "";

    for (const line of lines) {
      await handleDockerEventLine(line);
    }

    dockerEventsStream.resume();
  });

  dockerEventsStream.on("error", (error) => {
    console.warn("[log-collector] Docker events stream stopped", error.message);
  });
};

const ensureLogCollectionPrepared = async () => {
  const db = Log.db.db;
  if (!db) {
    return;
  }

  const collectionName = Log.collection.collectionName || "logs";
  const collections = await db.listCollections({ name: collectionName }).toArray();

  if (collections.length === 0 && LOG_COLLECTION_CAPPED_ENABLED) {
    try {
      await db.createCollection(collectionName, {
        capped: true,
        size: LOG_COLLECTION_CAP_BYTES,
      });
      console.log(`[log-collector] Created capped collection '${collectionName}'`);
    } catch (error) {
      console.warn("[log-collector] Could not create capped collection", error.message);
    }
  }

  try {
    await Log.syncIndexes();
  } catch (error) {
    console.warn("[log-collector] Could not sync log indexes", error.message);
  }
};

const startLogCollector = async () => {
  if (!LOG_COLLECTOR_ENABLED || collectorStarted || collectorStarting) {
    return;
  }

  collectorStarting = true;

  try {
    dockerClient = createDockerClient();
    await dockerClient.ping();
    await ensureLogCollectionPrepared();
    await hydrateRunningContainers();
    await watchDockerEvents();

    collectorStarted = true;
    console.log("[log-collector] Started Docker log collector");
  } catch (error) {
    console.warn("[log-collector] Collector disabled because Docker is unavailable", error.message);
  } finally {
    collectorStarting = false;
  }
};

module.exports = {
  startLogCollector,
};
