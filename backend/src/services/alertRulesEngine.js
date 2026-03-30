const Alert = require("../models/Alert");
const Metric = require("../models/Metric");
const Organisation = require("../models/Organisation");
const Project = require("../models/Project");
const { dispatchProjectNotification } = require("./notificationDispatcher");
const { enqueueDeployJob } = require("./jobQueue");

const MONITOR_INTERVAL_SECONDS = Math.max(5, Number(process.env.MONITOR_INTERVAL_MS || 15000) / 1000);
const AUTO_RESTART_ON_MEMORY = String(process.env.ALERT_AUTO_RESTART_ON_MEMORY_EXHAUSTION || "true").toLowerCase() === "true";

const DEFAULT_RULES = {
  cpuThreshold: 90,
  memoryThreshold: 95,
  latencyThreshold: 2000,
  serviceDownFailures: 5,
  diskThreshold: 85,
  certExpiryDays: 14,
};

const safeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const loadOrganisationConfig = async (organisationId) => {
  if (!organisationId) {
    return { ...DEFAULT_RULES, emailNotifications: true, slackNotifications: true };
  }

  const organisation = await Organisation.findById(organisationId).select("alertRules");
  const rules = organisation?.alertRules || {};

  return {
    cpuThreshold: safeNumber(rules.cpuThreshold, DEFAULT_RULES.cpuThreshold),
    memoryThreshold: safeNumber(rules.memoryThreshold, DEFAULT_RULES.memoryThreshold),
    latencyThreshold: safeNumber(rules.latencyThreshold, DEFAULT_RULES.latencyThreshold),
    serviceDownFailures: safeNumber(rules.serviceDownFailures, DEFAULT_RULES.serviceDownFailures),
    diskThreshold: safeNumber(rules.diskThreshold, DEFAULT_RULES.diskThreshold),
    certExpiryDays: safeNumber(rules.certExpiryDays, DEFAULT_RULES.certExpiryDays),
    emailNotifications: rules.emailNotifications !== false,
    slackNotifications: rules.slackNotifications !== false,
  };
};

const toRequestedChannels = ({ email = false, slack = false, page = false }) => ({
  email,
  slack,
  expo: page,
  webhook: page,
});

const p95 = (values) => {
  const sorted = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);

  if (sorted.length === 0) return 0;

  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(0.95 * sorted.length) - 1));
  return sorted[index];
};

const resolveRuleType = (ruleType) => {
  if (ruleType === "disk") return "disk";
  if (ruleType === "certificate") return "certificate";
  if (ruleType === "availability") return "availability";
  if (ruleType === "deployment") return "deployment";
  if (ruleType === "memory") return "memory";
  if (ruleType === "latency") return "latency";
  return "cpu";
};

const findActiveRuleAlert = async ({ projectId, ruleType, message }) => {
  return Alert.findOne({
    projectId,
    ruleType,
    message,
    status: { $in: ["open", "acknowledged"] },
  }).select("_id");
};

const createRuleAlert = async ({
  project,
  ruleType,
  severity,
  message,
  metricAtTrigger,
  requestedChannels,
  restart,
}) => {
  const normalizedRuleType = resolveRuleType(ruleType);
  const existing = await findActiveRuleAlert({
    projectId: project._id,
    ruleType: normalizedRuleType,
    message,
  });

  if (existing) {
    return { created: false, alertId: String(existing._id) };
  }

  const alert = await Alert.create({
    projectId: project._id,
    severity,
    message,
    ruleType: normalizedRuleType,
    metricAtTrigger,
    status: "open",
    acknowledged: false,
  });

  await dispatchProjectNotification({
    projectId: String(project._id),
    event: {
      severity,
      title: `${project.name} alert: ${ruleType}`,
      message,
      serviceName: project.name,
      metricAtTrigger,
      metadata: {
        source: "alert-rules-engine",
        alertId: String(alert._id),
        ruleType: normalizedRuleType,
      },
    },
    requestedChannels,
  });

  if (restart && AUTO_RESTART_ON_MEMORY) {
    await enqueueDeployJob({
      projectId: String(project._id),
      version: `auto-restart-${Date.now()}`,
      strategy: "rolling",
      branch: String(project.branch || "main"),
      triggeredBy: "alert-rules-engine",
      environment: String(project.environments?.[0]?.name || "production"),
    });
  }

  return { created: true, alertId: String(alert._id) };
};

const getRecentMetrics = async ({ projectId, minutes }) => {
  const expectedSamples = Math.max(1, Math.ceil((minutes * 60) / MONITOR_INTERVAL_SECONDS));
  const since = new Date(Date.now() - minutes * 60 * 1000);

  return Metric.find({ projectId, recordedAt: { $gte: since } })
    .sort({ recordedAt: -1 })
    .limit(expectedSamples)
    .select("cpu_percent memory_percent http_latency_ms disk_usage_percent disk_usage_mb");
};

const resolveCertificateDaysLeft = (project) => {
  for (const environment of project.environments || []) {
    const cfg = environment?.config || {};
    const explicitDays = safeNumber(cfg.certificateExpiryDays, NaN);
    if (Number.isFinite(explicitDays)) {
      return explicitDays;
    }

    const expiresAt = cfg.certificateExpiresAt || cfg.tlsExpiresAt || cfg.certExpiresAt;
    if (!expiresAt) continue;

    const expiryDate = new Date(String(expiresAt));
    if (Number.isNaN(expiryDate.getTime())) continue;

    return Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  }

  return null;
};

const evaluateMonitoringAlertRules = async ({ project, metric }) => {
  if (!project?._id || !metric) {
    return;
  }

  const rules = await loadOrganisationConfig(project.organisationId);
  const actions = {
    slackEmail: toRequestedChannels({
      slack: rules.slackNotifications,
      email: rules.emailNotifications,
    }),
    slackOnly: toRequestedChannels({ slack: rules.slackNotifications }),
    emailOnly: toRequestedChannels({ email: rules.emailNotifications }),
    page: toRequestedChannels({
      slack: rules.slackNotifications,
      email: rules.emailNotifications,
      page: true,
    }),
  };

  const recentCpu = await getRecentMetrics({ projectId: project._id, minutes: 2 });
  const cpuBreached = recentCpu.length > 0 && recentCpu.every((item) => Number(item.cpu_percent || 0) > rules.cpuThreshold);
  if (cpuBreached) {
    await createRuleAlert({
      project,
      ruleType: "cpu",
      severity: "warning",
      message: `High CPU: > ${rules.cpuThreshold}% for 2 minutes`,
      metricAtTrigger: [{ label: "cpu_percent", value: Number(metric.cpu_percent || 0), unit: "%" }],
      requestedChannels: actions.slackEmail,
    });
  }

  const memoryPercent = Number(metric.memory_percent || 0);
  if (memoryPercent > rules.memoryThreshold) {
    await createRuleAlert({
      project,
      ruleType: "memory",
      severity: "critical",
      message: `Memory exhaustion: > ${rules.memoryThreshold}% of limit`,
      metricAtTrigger: [
        { label: "memory_percent", value: memoryPercent, unit: "%" },
        { label: "memory_mb", value: Number(metric.memory_mb || 0), unit: "MB" },
      ],
      requestedChannels: actions.slackEmail,
      restart: true,
    });
  }

  const failedProbes = Number(metric.failed_probes || 0);
  if (failedProbes >= rules.serviceDownFailures) {
    await createRuleAlert({
      project,
      ruleType: "availability",
      severity: "critical",
      message: `Service down: ${failedProbes} consecutive probe failures`,
      metricAtTrigger: [{ label: "failed_probes", value: failedProbes, unit: "" }],
      requestedChannels: actions.page,
    });
  }

  const recentLatency = await getRecentMetrics({ projectId: project._id, minutes: 5 });
  const latencyP95 = p95(recentLatency.map((item) => Number(item.http_latency_ms || 0)));
  if (latencyP95 > rules.latencyThreshold) {
    await createRuleAlert({
      project,
      ruleType: "latency",
      severity: "warning",
      message: `High latency: p95 > ${rules.latencyThreshold}ms for 5 minutes`,
      metricAtTrigger: [{ label: "http_latency_ms_p95", value: latencyP95, unit: "ms" }],
      requestedChannels: actions.slackOnly,
    });
  }

  const diskUsagePercent = Number(metric.disk_usage_percent || 0);
  if (diskUsagePercent > rules.diskThreshold) {
    await createRuleAlert({
      project,
      ruleType: "disk",
      severity: "warning",
      message: `Disk usage high: > ${rules.diskThreshold}%`,
      metricAtTrigger: [
        { label: "disk_usage_percent", value: diskUsagePercent, unit: "%" },
        { label: "disk_usage_mb", value: Number(metric.disk_usage_mb || 0), unit: "MB" },
      ],
      requestedChannels: actions.emailOnly,
    });
  }

  const certDaysLeft = resolveCertificateDaysLeft(project);
  if (certDaysLeft !== null && certDaysLeft < rules.certExpiryDays) {
    await createRuleAlert({
      project,
      ruleType: "certificate",
      severity: "info",
      message: `Certificate expiry warning: ${certDaysLeft} day(s) remaining`,
      metricAtTrigger: [{ label: "certificate_days_left", value: certDaysLeft, unit: "days" }],
      requestedChannels: actions.emailOnly,
    });
  }
};

const reportDeploymentFailureAlert = async ({ projectId, stageName, exitCode, errorMessage }) => {
  if (!projectId) {
    return;
  }

  const project = await Project.findById(projectId).select("_id name branch environments organisationId");
  if (!project) {
    return;
  }

  const rules = await loadOrganisationConfig(project.organisationId);
  await createRuleAlert({
    project,
    ruleType: "deployment",
    severity: "critical",
    message: `Deployment failed: stage '${stageName}' exited with code ${exitCode}`,
    metricAtTrigger: [
      { label: "exit_code", value: Number(exitCode || 1), unit: "" },
    ],
    requestedChannels: toRequestedChannels({
      slack: rules.slackNotifications,
      email: rules.emailNotifications,
    }),
  });
};

module.exports = {
  evaluateMonitoringAlertRules,
  reportDeploymentFailureAlert,
};