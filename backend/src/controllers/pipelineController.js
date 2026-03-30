const mongoose = require("mongoose");

const { enqueuePipelineJob } = require("../services/jobQueue");
const Pipeline = require("../models/Pipeline");
const Project = require("../models/Project");
const User = require("../models/User");
const { resolvePipelineConfig } = require("../services/pipelineConfig");

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

    const branch = String(req.body.branch || project.branch || "main");
    let resolvedConfig;
    try {
      resolvedConfig = await resolvePipelineConfig({
        repoUrl: project.repoUrl,
        branch,
        inlineConfig: req.body.pipelineConfig || req.body.config,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to resolve pipeline configuration",
      });
    }

    const run = await Pipeline.create({
      projectId: project._id,
      version: String(req.body.version || `v${Date.now()}`),
      strategy: String(req.body.strategy || resolvedConfig.strategy || "rolling"),
      runType: "pipeline",
      status: "pending",
      branch,
      triggeredBy: req.user.email || req.user.id,
      environment: String(req.body.environment || resolvedConfig.environment || "staging"),
      steps: (Array.isArray(req.body.steps) && req.body.steps.length > 0 ? req.body.steps : resolvedConfig.steps).map((step) => ({
        name: String(step.name || "stage"),
        command: String(step.command || "echo noop"),
        status: "pending",
        duration: 0,
        output: "",
      })),
      config: JSON.stringify({
        repoUrl: String(project.repoUrl || ""),
        configSource: resolvedConfig.source,
        configPath: resolvedConfig.sourcePath,
      }),
    });

    const queueJob = await enqueuePipelineJob({
      pipelineId: String(run._id),
      projectId: String(project._id),
      version: run.version,
      strategy: run.strategy,
      branch: run.branch,
      triggeredBy: run.triggeredBy,
      environment: run.environment,
      repoUrl: project.repoUrl,
      notifications: resolvedConfig.notifications,
      steps: run.steps.map((step) => ({ name: step.name, command: step.command })),
    });

    res.status(201).json({
      message: "Pipeline run queued",
      queueJobId: String(queueJob.id),
      run: mapRun(run),
    });
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

module.exports = {
  triggerPipelineRun,
  listProjectPipelineRuns,
  getPipelineRun,
  cancelPipelineRun,
  getStageLog,
};
