const mongoose = require("mongoose");

const Pipeline = require("../models/Pipeline");
const Project = require("../models/Project");
const User = require("../models/User");
const {
  parseInnoDeployConfig,
  validateInnoDeployConfig,
  buildStepsFromConfig,
} = require("../utils/pipelineConfig");
const { enqueuePipelineRun } = require("../services/pipelineQueue");
const { onPipelineUpdate } = require("../services/pipelineEvents");

const DEFAULT_STEP_IMAGE = "node:20-alpine";
const DEFAULT_STEP_TIMEOUT_MS = 10 * 60 * 1000;

const normalizeStep = (step) => ({
  name: String(step?.name || "step").trim(),
  command: String(step?.command || "").trim(),
  image: String(step?.image || DEFAULT_STEP_IMAGE).trim() || DEFAULT_STEP_IMAGE,
  retries: Math.max(0, Number(step?.retries || 0)),
  timeoutMs: Math.max(1000, Number(step?.timeoutMs || DEFAULT_STEP_TIMEOUT_MS)),
  attempt: 0,
  status: step?.status || "pending",
  duration: Number(step?.duration || 0),
  output: String(step?.output || ""),
});

const getOrganisationId = async (userId) => {
  const user = await User.findById(userId).select("organisationId");
  return user?.organisationId ?? null;
};

const getProjectForOrganisation = async (projectId, organisationId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return null;
  }

  return Project.findOne({ _id: projectId, organisationId });
};

const getRunById = async (runId) => {
  if (!mongoose.Types.ObjectId.isValid(runId)) {
    return null;
  }
  return Pipeline.findById(runId);
};

const mapRun = (run) => ({
  id: String(run._id),
  projectId: String(run.projectId),
  version: run.version,
  strategy: run.strategy,
  runType: run.runType,
  status: run.status,
  branch: run.branch,
  triggeredBy: run.triggeredBy,
  environment: run.environment,
  duration: run.duration,
  steps: run.steps,
  createdAt: run.createdAt,
  updatedAt: run.updatedAt,
});

const getDefaultSteps = () => ([
  normalizeStep({ name: "checkout", command: "git checkout" }),
  normalizeStep({ name: "build", command: "npm run build" }),
  normalizeStep({ name: "deploy", command: "npm run deploy" }),
]);

const triggerPipelineRun = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    let parsedConfig = null;
    if (req.body.config !== undefined && req.body.config !== null && String(req.body.config).trim() !== "") {
      try {
        parsedConfig = parseInnoDeployConfig(req.body.config);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid .innodeploy.yml format",
          errors: [error.message],
        });
      }

      const validation = validateInnoDeployConfig(parsedConfig);
      if (!validation.isValid) {
        return res.status(400).json({
          message: "Invalid .innodeploy.yml content",
          errors: validation.errors,
        });
      }
    }

    const configSteps = parsedConfig ? buildStepsFromConfig(parsedConfig) : [];
    const requestSteps = Array.isArray(req.body.steps) && req.body.steps.length > 0 ? req.body.steps : [];
    const selectedSteps = requestSteps.length > 0
      ? requestSteps.map(normalizeStep).filter((step) => step.command)
      : (configSteps.length > 0 ? configSteps.map(normalizeStep) : getDefaultSteps());

    const run = await Pipeline.create({
      projectId: project._id,
      version: String(req.body.version || parsedConfig?.name || `v${Date.now()}`),
      strategy: String(req.body.strategy || parsedConfig?.strategy || "rolling"),
      runType: "pipeline",
      status: "pending",
      branch: String(req.body.branch || parsedConfig?.trigger?.branch || project.branch || "main"),
      triggeredBy: req.user.email || req.user.id,
      environment: String(req.body.environment || parsedConfig?.environment || "staging"),
      steps: selectedSteps,
      config: parsedConfig ? JSON.stringify(parsedConfig) : String(req.body.config || ""),
    });

    await enqueuePipelineRun(run._id);

    res.status(201).json({ message: "Pipeline run triggered", run: mapRun(run) });
  } catch (error) {
    next(error);
  }
};

const listProjectPipelineRuns = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const runs = await Pipeline.find({ projectId: project._id }).sort({ createdAt: -1 });
    res.json({ runs: runs.map(mapRun) });
  } catch (error) {
    next(error);
  }
};

const getPipelineRun = async (req, res, next) => {
  try {
    const run = await getRunById(req.params.runId);
    if (!run) {
      return res.status(404).json({ message: "Pipeline run not found" });
    }

    const organisationId = await getOrganisationId(req.user.id);
    const project = await getProjectForOrganisation(run.projectId, organisationId);
    if (!project) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    res.json({ run: mapRun(run) });
  } catch (error) {
    next(error);
  }
};

const cancelPipelineRun = async (req, res, next) => {
  try {
    const run = await getRunById(req.params.runId);
    if (!run) {
      return res.status(404).json({ message: "Pipeline run not found" });
    }

    const organisationId = await getOrganisationId(req.user.id);
    const project = await getProjectForOrganisation(run.projectId, organisationId);
    if (!project) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    if (["success", "failed", "cancelled"].includes(run.status)) {
      return res.status(400).json({ message: "Pipeline run is already completed" });
    }

    run.status = "cancelled";
    run.cancelledAt = new Date();
    run.steps = run.steps.map((step) => {
      if (step.status === "running" || step.status === "pending") {
        return { ...step.toObject(), status: "skipped" };
      }
      return step;
    });

    await run.save();
    res.json({ message: "Pipeline run cancelled", run: mapRun(run) });
  } catch (error) {
    next(error);
  }
};

const getStageLog = async (req, res, next) => {
  try {
    const run = await getRunById(req.params.runId);
    if (!run) {
      return res.status(404).json({ message: "Pipeline run not found" });
    }

    const organisationId = await getOrganisationId(req.user.id);
    const project = await getProjectForOrganisation(run.projectId, organisationId);
    if (!project) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const stageName = String(req.params.stage || "").trim().toLowerCase();
    const stage = run.steps.find((step) => String(step.name).trim().toLowerCase() === stageName);

    if (!stage) {
      return res.status(404).json({ message: "Pipeline stage not found" });
    }

    const accept = String(req.headers.accept || "");
    if (accept.includes("text/plain")) {
      res.type("text/plain").send(stage.output || "");
      return;
    }

    res.json({
      runId: String(run._id),
      stage: {
        name: stage.name,
        status: stage.status,
        command: stage.command,
        duration: stage.duration,
        output: stage.output,
      },
    });
  } catch (error) {
    next(error);
  }
};

const streamPipelineRun = async (req, res, next) => {
  try {
    const run = await getRunById(req.params.runId);
    if (!run) {
      return res.status(404).json({ message: "Pipeline run not found" });
    }

    const organisationId = await getOrganisationId(req.user.id);
    const project = await getProjectForOrganisation(run.projectId, organisationId);
    if (!project) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (event, payload) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const sendSnapshot = async () => {
      const latest = await getRunById(req.params.runId);
      if (!latest) return;
      sendEvent("snapshot", { run: mapRun(latest) });
    };

    await sendSnapshot();

    const unsubscribe = onPipelineUpdate((payload) => {
      if (String(payload?.runId || "") !== String(req.params.runId)) {
        return;
      }
      sendEvent("update", payload);
    });

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerPipelineRun,
  listProjectPipelineRuns,
  getPipelineRun,
  cancelPipelineRun,
  getStageLog,
  streamPipelineRun,
};
