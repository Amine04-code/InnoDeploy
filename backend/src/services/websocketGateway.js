require("dotenv").config();

const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");
const { createClient } = require("redis");

const WS_PORT = Number(process.env.WS_PORT || 7070);
const WS_PATH = String(process.env.WS_PATH || "/ws");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const MONITOR_STREAM_CHANNEL = String(process.env.MONITOR_STREAM_CHANNEL || "monitoring:stream");
const MONITOR_PROJECT_CHANNEL_PREFIX = String(
  process.env.MONITOR_PROJECT_CHANNEL_PREFIX || "monitoring:project:"
);
const PIPELINE_EVENTS_CHANNEL = String(process.env.PIPELINE_EVENTS_CHANNEL || "pipeline:events");
const PIPELINE_LOGS_CHANNEL = String(process.env.PIPELINE_LOGS_CHANNEL || "pipeline:logs");
const PIPELINE_LOGS_CHANNEL_PREFIX = String(process.env.PIPELINE_LOGS_CHANNEL_PREFIX || "pipeline:logs:");
const DEPLOY_EVENTS_CHANNEL = String(process.env.DEPLOY_EVENTS_CHANNEL || "deploy:events");

const app = express();
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "websocket-gateway", timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: WS_PATH });

const subscriptions = new Map();

const safeSend = (ws, payload) => {
  if (ws.readyState !== ws.OPEN) {
    return;
  }
  ws.send(JSON.stringify(payload));
};

const parseMaybeJson = (value) => {
  try {
    return JSON.parse(String(value));
  } catch (_error) {
    return null;
  }
};

const shouldReceiveProjectEvent = (ws, channel) => {
  const subscription = subscriptions.get(ws);
  const wantedProjects = subscription?.projects;
  if (!wantedProjects || wantedProjects.size === 0) {
    return true;
  }

  const projectId = channel.replace(MONITOR_PROJECT_CHANNEL_PREFIX, "");
  return wantedProjects.has(projectId);
};

const shouldReceivePipelineEvent = (ws, channel) => {
  const subscription = subscriptions.get(ws);
  const wantedPipelines = subscription?.pipelines;
  if (!wantedPipelines || wantedPipelines.size === 0) {
    return true;
  }

  const pipelineId = channel.replace(PIPELINE_LOGS_CHANNEL_PREFIX, "");
  return wantedPipelines.has(pipelineId);
};

wss.on("connection", (ws) => {
  subscriptions.set(ws, { projects: new Set(), pipelines: new Set() });

  safeSend(ws, {
    type: "gateway.connected",
    message: "Connected to websocket gateway",
    channels: {
      stream: MONITOR_STREAM_CHANNEL,
      projectPrefix: MONITOR_PROJECT_CHANNEL_PREFIX,
      pipelineEvents: PIPELINE_EVENTS_CHANNEL,
      pipelineLogs: PIPELINE_LOGS_CHANNEL,
      pipelineLogsPrefix: PIPELINE_LOGS_CHANNEL_PREFIX,
      deployEvents: DEPLOY_EVENTS_CHANNEL,
    },
    createdAt: new Date().toISOString(),
  });

  ws.on("message", (raw) => {
    const parsed = parseMaybeJson(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }

    if (parsed.type === "subscribe" && parsed.projectId) {
      const wantedProjects = subscriptions.get(ws).projects;
      wantedProjects.add(String(parsed.projectId));
      safeSend(ws, { type: "gateway.subscribed", projectId: String(parsed.projectId) });
      return;
    }

    if (parsed.type === "unsubscribe" && parsed.projectId) {
      const wantedProjects = subscriptions.get(ws).projects;
      wantedProjects.delete(String(parsed.projectId));
      safeSend(ws, { type: "gateway.unsubscribed", projectId: String(parsed.projectId) });
      return;
    }

    if (parsed.type === "subscribePipeline" && parsed.pipelineId) {
      const wantedPipelines = subscriptions.get(ws).pipelines;
      wantedPipelines.add(String(parsed.pipelineId));
      safeSend(ws, { type: "gateway.subscribedPipeline", pipelineId: String(parsed.pipelineId) });
      return;
    }

    if (parsed.type === "unsubscribePipeline" && parsed.pipelineId) {
      const wantedPipelines = subscriptions.get(ws).pipelines;
      wantedPipelines.delete(String(parsed.pipelineId));
      safeSend(ws, { type: "gateway.unsubscribedPipeline", pipelineId: String(parsed.pipelineId) });
      return;
    }

    if (parsed.type === "ping") {
      safeSend(ws, { type: "pong", createdAt: new Date().toISOString() });
    }
  });

  ws.on("close", () => {
    subscriptions.delete(ws);
  });
});

const redisSub = createClient({ url: REDIS_URL });

redisSub.on("error", (error) => {
  console.error("[websocket-gateway] redis error", error.message);
});

const broadcast = (payload, channel) => {
  for (const ws of wss.clients) {
    if (channel.startsWith(MONITOR_PROJECT_CHANNEL_PREFIX) && !shouldReceiveProjectEvent(ws, channel)) {
      continue;
    }
    if (channel.startsWith(PIPELINE_LOGS_CHANNEL_PREFIX) && !shouldReceivePipelineEvent(ws, channel)) {
      continue;
    }

    safeSend(ws, payload);
  }
};

const startGateway = async () => {
  await redisSub.connect();

  await redisSub.subscribe(MONITOR_STREAM_CHANNEL, (message) => {
    const payload = parseMaybeJson(message) || { type: "monitoring.stream", raw: String(message) };
    payload.channel = MONITOR_STREAM_CHANNEL;
    broadcast(payload, MONITOR_STREAM_CHANNEL);
  });

  await redisSub.subscribe(PIPELINE_EVENTS_CHANNEL, (message) => {
    const payload = parseMaybeJson(message) || { type: "pipeline.event", raw: String(message) };
    payload.channel = PIPELINE_EVENTS_CHANNEL;
    broadcast(payload, PIPELINE_EVENTS_CHANNEL);
  });

  await redisSub.subscribe(PIPELINE_LOGS_CHANNEL, (message) => {
    const payload = parseMaybeJson(message) || { type: "pipeline.log", raw: String(message) };
    payload.channel = PIPELINE_LOGS_CHANNEL;
    broadcast(payload, PIPELINE_LOGS_CHANNEL);
  });

  await redisSub.subscribe(DEPLOY_EVENTS_CHANNEL, (message) => {
    const payload = parseMaybeJson(message) || { type: "deploy.event", raw: String(message) };
    payload.channel = DEPLOY_EVENTS_CHANNEL;
    broadcast(payload, DEPLOY_EVENTS_CHANNEL);
  });

  await redisSub.pSubscribe(`${MONITOR_PROJECT_CHANNEL_PREFIX}*`, (message, channel) => {
    const payload = parseMaybeJson(message) || { type: "monitoring.project", raw: String(message) };
    payload.channel = channel;
    broadcast(payload, channel);
  });

  await redisSub.pSubscribe(`${PIPELINE_LOGS_CHANNEL_PREFIX}*`, (message, channel) => {
    const payload = parseMaybeJson(message) || { type: "pipeline.log", raw: String(message) };
    payload.channel = channel;
    broadcast(payload, channel);
  });

  server.listen(WS_PORT, () => {
    console.log(`[websocket-gateway] listening on :${WS_PORT}${WS_PATH}`);
  });
};

startGateway().catch((error) => {
  console.error("[websocket-gateway] failed to start", error.message);
  process.exit(1);
});
