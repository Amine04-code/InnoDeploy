const Pipeline = require("../models/Pipeline");
const Project = require("../models/Project");
const Log = require("../models/Log");
const { enqueuePipelineJob } = require("../services/jobQueue");
const { resolvePipelineConfig } = require("../services/pipelineConfig");

const parseRepositoryUrl = (provider, payload) => {
  if (provider === "github") {
    return payload?.repository?.html_url || payload?.repository?.clone_url || null;
  }

  if (provider === "gitlab") {
    return payload?.project?.web_url || payload?.project?.git_http_url || null;
  }

  if (provider === "bitbucket") {
    return payload?.repository?.links?.html?.href || payload?.repository?.links?.clone?.[0]?.href || null;
  }

  return null;
};

const parseBranch = (payload) => {
  const ref = payload?.ref || payload?.push?.changes?.[0]?.new?.name || "main";
  return String(ref).replace("refs/heads/", "");
};

const receiveWebhook = (provider) => async (req, res, next) => {
  try {
    const payload = req.body || {};
    const repoUrl = parseRepositoryUrl(provider, payload);

    if (!repoUrl) {
      return res.status(400).json({ message: "Repository URL could not be extracted from webhook payload" });
    }

    const project = await Project.findOne({ repoUrl });
    if (!project) {
      return res.status(202).json({ message: "Webhook accepted but no matching project found" });
    }

    const branch = parseBranch(payload);
    const resolvedConfig = await resolvePipelineConfig({
      repoUrl: project.repoUrl,
      branch,
      inlineConfig: payload?.pipelineConfig,
    });

    const run = await Pipeline.create({
      projectId: project._id,
      version: String(payload?.after || payload?.checkout_sha || Date.now()),
      strategy: resolvedConfig.strategy || "rolling",
      runType: "pipeline",
      status: "pending",
      branch,
      triggeredBy: `${provider}-webhook`,
      environment: resolvedConfig.environment || "staging",
      steps: resolvedConfig.steps.map((step) => ({
        name: String(step.name || "stage"),
        command: String(step.command || "echo noop"),
        status: "pending",
        duration: 0,
        output: "",
      })),
      config: JSON.stringify({
        provider,
        event: req.headers["x-github-event"] || req.headers["x-gitlab-event"] || "push",
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

    await Log.create({
      projectId: project._id,
      pipelineId: run._id,
      level: "info",
      message: `${provider} webhook received for ${project.name}`,
      environment: "staging",
      source: "webhook",
    });

    res.status(202).json({ message: "Webhook accepted", runId: String(run._id), queueJobId: String(queueJob.id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  githubWebhook: receiveWebhook("github"),
  gitlabWebhook: receiveWebhook("gitlab"),
  bitbucketWebhook: receiveWebhook("bitbucket"),
};
