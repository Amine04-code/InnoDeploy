const nodemailer = require("nodemailer");

const Organisation = require("../models/Organisation");
const Project = require("../models/Project");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const NOTIFICATION_TIMEOUT_MS = Math.max(1000, Number(process.env.NOTIFICATION_TIMEOUT_MS) || 5000);
const EXPO_PUSH_ENDPOINT = String(process.env.EXPO_PUSH_ENDPOINT || "https://exp.host/--/api/v2/push/send");

const severityPalette = {
  info: "#2563eb",
  warning: "#d97706",
  critical: "#dc2626",
};

let smtpTransportCache = new Map();

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return TRUE_VALUES.has(String(value).trim().toLowerCase());
};

const toPlainObject = (value, fallback = {}) => {
  if (!value) {
    return { ...fallback };
  }

  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return { ...fallback };
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const severityToDiscordColor = (hex) => parseInt(String(hex || "#2563eb").replace("#", ""), 16);

const createPayload = ({ organisation, project, event }) => {
  const severity = String(event.severity || "info").toLowerCase();
  const color = severityPalette[severity] || severityPalette.info;

  return {
    organisationId: String(organisation._id),
    organisationName: organisation.name,
    projectId: project?._id ? String(project._id) : null,
    projectName: project?.name || event.serviceName || "service",
    severity,
    title: String(event.title || "InnoDeploy notification"),
    message: String(event.message || ""),
    metricAtTrigger: Array.isArray(event.metricAtTrigger) ? event.metricAtTrigger : [],
    metadata: toPlainObject(event.metadata),
    color,
    createdAt: new Date().toISOString(),
  };
};

const resolveEnabledChannels = ({ channels, overrides }) => {
  const emailEnabled = toBoolean(overrides?.email, toBoolean(channels.emailEnabled, true));
  const slackEnabled = toBoolean(overrides?.slack, toBoolean(channels.slackEnabled, false));
  const discordEnabled = toBoolean(overrides?.discord, toBoolean(channels.discordEnabled, false));
  const expoEnabled = toBoolean(overrides?.expo, toBoolean(channels.expoEnabled, false));
  const webhookEnabled = toBoolean(overrides?.webhook, toBoolean(channels.webhookEnabled, false));

  return {
    email: emailEnabled,
    slack: slackEnabled,
    discord: discordEnabled,
    expo: expoEnabled,
    webhook: webhookEnabled,
  };
};

const getEmailRecipients = (organisation, channels) => {
  const configuredRecipients = toArray(channels.emailRecipients);
  if (configuredRecipients.length > 0) {
    return configuredRecipients;
  }

  const billingContact = String(organisation?.billingInfo?.contactEmail || "").trim();
  if (billingContact) {
    return [billingContact];
  }

  const memberEmails = Array.isArray(organisation.members)
    ? organisation.members
        .map((member) => String(member?.userId?.email || "").trim())
        .filter(Boolean)
    : [];

  return memberEmails;
};

const getSmtpTransport = (channels) => {
  const host = String(channels.smtpHost || "").trim();
  const username = String(channels.smtpUsername || "").trim();
  const password = String(channels.smtpPassword || "");
  const port = Math.max(1, Number(channels.smtpPort) || 587);
  const secure = port === 465;

  const cacheKey = `${host}:${port}:${username}`;
  if (smtpTransportCache.has(cacheKey)) {
    return smtpTransportCache.get(cacheKey);
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: username && password ? { user: username, pass: password } : undefined,
    connectionTimeout: NOTIFICATION_TIMEOUT_MS,
    greetingTimeout: NOTIFICATION_TIMEOUT_MS,
    socketTimeout: NOTIFICATION_TIMEOUT_MS,
  });

  smtpTransportCache.set(cacheKey, transport);
  return transport;
};

const postJson = async (url, body, headers = {}) => {
  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
};

const sendEmail = async ({ organisation, channels, payload }) => {
  const recipients = getEmailRecipients(organisation, channels);
  if (!channels.smtpHost || !channels.smtpFromEmail || recipients.length === 0) {
    return { status: "skipped", reason: "smtp-not-configured" };
  }

  const transporter = getSmtpTransport(channels);
  const subject = `[${payload.severity.toUpperCase()}] ${payload.title}`;
  const metricLines = payload.metricAtTrigger
    .map((metric) => `${metric.label}: ${metric.value}${metric.unit || ""}`)
    .join("\n");

  const text = [
    payload.message,
    `Service: ${payload.projectName}`,
    metricLines ? `Metrics:\n${metricLines}` : "",
    `Time: ${payload.createdAt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  await transporter.sendMail({
    from: channels.smtpFromEmail,
    to: recipients.join(","),
    subject,
    text,
  });

  return { status: "sent", recipients };
};

const sendSlack = async ({ channels, payload }) => {
  const webhook = String(channels.slackWebhook || "").trim();
  if (!webhook) {
    return { status: "skipped", reason: "missing-slack-webhook" };
  }

  await postJson(webhook, {
    attachments: [
      {
        color: payload.color,
        title: payload.title,
        text: payload.message,
        fields: [
          { title: "Service", value: payload.projectName, short: true },
          { title: "Severity", value: payload.severity, short: true },
        ],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  });

  return { status: "sent" };
};

const sendDiscord = async ({ channels, payload }) => {
  const webhook = String(channels.discordWebhook || "").trim();
  if (!webhook) {
    return { status: "skipped", reason: "missing-discord-webhook" };
  }

  await postJson(webhook, {
    embeds: [
      {
        title: payload.title,
        description: payload.message,
        color: severityToDiscordColor(payload.color),
        fields: [
          { name: "Service", value: payload.projectName, inline: true },
          { name: "Severity", value: payload.severity, inline: true },
        ],
        timestamp: payload.createdAt,
      },
    ],
  });

  return { status: "sent" };
};

const sendExpoPush = async ({ channels, payload }) => {
  const tokens = toArray(channels.expoPushTokens);
  if (tokens.length === 0) {
    return { status: "skipped", reason: "missing-expo-tokens" };
  }

  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: payload.title,
    body: payload.message,
    data: {
      severity: payload.severity,
      service: payload.projectName,
      projectId: payload.projectId,
    },
  }));

  const headers = {};
  if (channels.expoAccessToken) {
    headers.Authorization = `Bearer ${channels.expoAccessToken}`;
  }

  await postJson(EXPO_PUSH_ENDPOINT, messages, headers);
  return { status: "sent", tokens: tokens.length };
};

const sendGenericWebhook = async ({ channels, payload }) => {
  const webhookUrl = String(channels.webhookUrl || "").trim();
  if (!webhookUrl) {
    return { status: "skipped", reason: "missing-generic-webhook" };
  }

  const webhookHeaders = toPlainObject(channels.webhookHeaders);
  await postJson(webhookUrl, payload, webhookHeaders);
  return { status: "sent" };
};

const dispatchOrganisationNotification = async ({ organisation, project = null, event, requestedChannels = null }) => {
  const channels = toPlainObject(organisation.notificationChannels);
  const enabled = resolveEnabledChannels({ channels, overrides: requestedChannels });
  const payload = createPayload({ organisation, project, event });

  const result = {
    sentAt: new Date().toISOString(),
    severity: payload.severity,
    channels: {},
  };

  const senders = {
    email: () => sendEmail({ organisation, channels, payload }),
    slack: () => sendSlack({ channels, payload }),
    discord: () => sendDiscord({ channels, payload }),
    expo: () => sendExpoPush({ channels, payload }),
    webhook: () => sendGenericWebhook({ channels, payload }),
  };

  for (const [channel, sender] of Object.entries(senders)) {
    if (!enabled[channel]) {
      result.channels[channel] = { status: "skipped", reason: "disabled" };
      continue;
    }

    try {
      result.channels[channel] = await sender();
    } catch (error) {
      result.channels[channel] = { status: "failed", reason: error.message };
    }
  }

  return result;
};

const dispatchProjectNotification = async ({ projectId, event, requestedChannels = null }) => {
  const project = await Project.findById(projectId).select("_id name organisationId");
  if (!project?.organisationId) {
    return {
      sentAt: new Date().toISOString(),
      severity: String(event.severity || "info"),
      channels: {
        email: { status: "skipped", reason: "project-or-organisation-missing" },
      },
    };
  }

  const organisation = await Organisation.findById(project.organisationId).populate({
    path: "members.userId",
    select: "email",
  });

  if (!organisation) {
    return {
      sentAt: new Date().toISOString(),
      severity: String(event.severity || "info"),
      channels: {
        email: { status: "skipped", reason: "organisation-missing" },
      },
    };
  }

  return dispatchOrganisationNotification({ organisation, project, event, requestedChannels });
};

module.exports = {
  dispatchOrganisationNotification,
  dispatchProjectNotification,
};