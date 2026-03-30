<<<<<<< HEAD
const { PassThrough } = require("stream");

const Docker = require("dockerode");
const IORedis = require("ioredis");
const { Worker } = require("bullmq");
const mongoose = require("mongoose");

const { redisClient } = require("../config/redis");
const { reportDeploymentFailureAlert } = require("./alertRulesEngine");
const { enqueueDeployJob } = require("./jobQueue");
const { dispatchProjectNotification } = require("./notificationDispatcher");
const Log = require("../models/Log");
const Pipeline = require("../models/Pipeline");
const { uploadJsonArtifact } = require("./objectStore");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const PIPELINE_RUNNER_ENABLED = TRUE_VALUES.has(
  String(process.env.PIPELINE_RUNNER_ENABLED || "false").toLowerCase()
);
const PIPELINE_RUNNER_CONCURRENCY = Math.max(1, Number(process.env.PIPELINE_RUNNER_CONCURRENCY) || 1);
const PIPELINE_QUEUE_NAME = String(process.env.PIPELINE_QUEUE_NAME || process.env.PIPELINE_QUEUE_KEY || "pipeline-jobs");
const PIPELINE_EVENTS_CHANNEL = String(process.env.PIPELINE_EVENTS_CHANNEL || "pipeline:events");
const PIPELINE_LOGS_CHANNEL = String(process.env.PIPELINE_LOGS_CHANNEL || "pipeline:logs");
const PIPELINE_LOGS_CHANNEL_PREFIX = String(process.env.PIPELINE_LOGS_CHANNEL_PREFIX || "pipeline:logs:");
const PIPELINE_STAGE_IMAGE = String(process.env.PIPELINE_STAGE_IMAGE || "node:20-alpine");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let bullConnection = null;
let dockerClient = null;
let runnerWorker = null;
let runnerStarted = false;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parseConfigJson = (config) => {
  if (!config || typeof config !== "string") {
    return {};
  }

  try {
    return JSON.parse(config);
  } catch (_error) {
    return {};
  }
};

const notifyPipeline = async ({ pipeline, severity, title, message, requestedChannels }) => {
  try {
    await dispatchProjectNotification({
      projectId: String(pipeline.projectId),
      event: {
        severity,
        title,
        message,
        serviceName: "pipeline-runner",
        metadata: {
          pipelineId: String(pipeline._id),
          version: pipeline.version,
          branch: pipeline.branch,
          strategy: pipeline.strategy,
          status: pipeline.status,
        },
      },
      requestedChannels,
    });
  } catch (_error) {
    // Notification failures should not fail pipeline execution.
  }
};

const getDockerClient = () => {
  if (dockerClient) {
    return dockerClient;
  }

  if (process.env.DOCKER_SOCKET_PATH) {
    dockerClient = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH });
    return dockerClient;
  }

  dockerClient = process.platform === "win32"
    ? new Docker({ socketPath: "//./pipe/docker_engine" })
    : new Docker({ socketPath: "/var/run/docker.sock" });

  return dockerClient;
};

const publishEvent = async (event) => {
  if (!redisClient?.isOpen) {
    return;
  }

  await redisClient.publish(PIPELINE_EVENTS_CHANNEL, JSON.stringify(event));
};

const publishLog = async ({ pipelineId, projectId, stage, stream, line }) => {
  if (!redisClient?.isOpen) {
    return;
  }

  const payload = {
    type: "pipeline.log",
    pipelineId,
    projectId,
    stage,
    stream,
    line,
    createdAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(payload);

  await Promise.all([
    redisClient.publish(PIPELINE_LOGS_CHANNEL, serialized),
    redisClient.publish(`${PIPELINE_LOGS_CHANNEL_PREFIX}${pipelineId}`, serialized),
  ]);
};

const streamDemux = ({ stream, context, outputBucket }) => {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdoutBuffer = { value: "" };
  const stderrBuffer = { value: "" };

  const flushLines = async (bucket, streamName, chunk) => {
    bucket.value += chunk.toString("utf8");
    const lines = bucket.value.split(/\r?\n/);
    bucket.value = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      outputBucket.push(line);
      await publishLog({ ...context, stream: streamName, line });
    }
  };

  const flushRemainder = async (bucket, streamName) => {
    if (!bucket.value.trim()) return;
    outputBucket.push(bucket.value);
    await publishLog({ ...context, stream: streamName, line: bucket.value });
  };

  stdout.on("data", async (chunk) => {
    stdout.pause();
    await flushLines(stdoutBuffer, "stdout", chunk);
    stdout.resume();
  });

  stderr.on("data", async (chunk) => {
    stderr.pause();
    await flushLines(stderrBuffer, "stderr", chunk);
    stderr.resume();
  });

  const finalize = async () => {
    await flushRemainder(stdoutBuffer, "stdout");
    await flushRemainder(stderrBuffer, "stderr");
  };

  getDockerClient().modem.demuxStream(stream, stdout, stderr);

  return { finalize };
};

const executeStageInContainer = async ({ pipeline, stage }) => {
  const repoUrl = String(pipeline.repoUrl || "").trim();
  if (!repoUrl) {
    throw new Error("pipeline job must include repoUrl");
  }

  const stageCommand = String(stage.command || "echo noop");
  const branch = String(pipeline.branch || "main");
  const image = String(stage.image || PIPELINE_STAGE_IMAGE);

  const command = [
    "set -e",
    "apk add --no-cache git >/dev/null 2>&1 || true",
    "rm -rf /workspace/src",
    'git clone --depth 1 --branch "$PIPELINE_REPO_BRANCH" "$PIPELINE_REPO_URL" /workspace/src',
    "cd /workspace/src",
    stageCommand,
  ].join(" && ");

  const container = await getDockerClient().createContainer({
    Image: image,
    Cmd: ["sh", "-lc", command],
    Env: [`PIPELINE_REPO_URL=${repoUrl}`, `PIPELINE_REPO_BRANCH=${branch}`],
    WorkingDir: "/workspace",
    Tty: false,
  });

  const attachStream = await container.attach({ stream: true, stdout: true, stderr: true, logs: true });
  const output = [];
  const context = {
    pipelineId: String(pipeline._id),
    projectId: String(pipeline.projectId),
    stage: stage.name,
  };
  const demux = streamDemux({ stream: attachStream, context, outputBucket: output });

  const startedAt = Date.now();

  try {
    await container.start();
    const waitResult = await container.wait();
    await demux.finalize();

    if (waitResult.StatusCode !== 0) {
      throw new Error(`stage '${stage.name}' exited with code ${waitResult.StatusCode}`);
    }
  } finally {
    try {
      await container.remove({ force: true });
    } catch (_cleanupError) {
      // Ignore cleanup failures.
    }
  }

  return {
    duration: Date.now() - startedAt,
    output: output.slice(-200).join("\n"),
  };
};

const createPipelineFromJob = async (job) => {
  if (!isValidObjectId(job.projectId)) {
    throw new Error("pipeline job missing a valid projectId");
  }

  const steps = Array.isArray(job.steps) && job.steps.length > 0
    ? job.steps
    : [
        { name: "Install", command: "echo install" },
        { name: "Test", command: "echo test" },
        { name: "Build", command: "echo build" },
      ];

  return Pipeline.create({
    projectId: job.projectId,
    version: String(job.version || `build-${Date.now()}`),
    strategy: job.strategy || "rolling",
    runType: "pipeline",
    status: "in-progress",
    branch: String(job.branch || "main"),
    triggeredBy: String(job.triggeredBy || "system"),
    environment: String(job.environment || "production"),
    config: JSON.stringify({ repoUrl: String(job.repoUrl || ""), notifications: job.notifications || {} }),
    steps: steps.map((step) => ({
      name: String(step.name || "step"),
      command: String(step.command || "echo noop"),
      status: "pending",
      duration: 0,
      output: "",
    })),
  });
};

const resolvePipelineRun = async (job) => {
  if (isValidObjectId(job.pipelineId)) {
    const existing = await Pipeline.findById(job.pipelineId);
    if (existing) {
      return existing;
    }
  }

  return createPipelineFromJob(job);
};

const runPipelineJob = async (job) => {
  const pipeline = await resolvePipelineRun(job);
  const configBlob = parseConfigJson(pipeline.config);
  const jobNotifications = job.notifications && typeof job.notifications === "object" ? job.notifications : {};
  const configNotifications =
    configBlob.notifications && typeof configBlob.notifications === "object" ? configBlob.notifications : {};
  const notifications = {
    slack: jobNotifications.slack ?? configNotifications.slack ?? true,
    email: jobNotifications.email ?? configNotifications.email ?? true,
  };

  const repoUrl = String(job.repoUrl || configBlob.repoUrl || "");
  if (!repoUrl) {
    throw new Error("pipeline job must include repoUrl");
  }

  const startedAt = Date.now();

  pipeline.status = "in-progress";
  for (const step of pipeline.steps) {
    if (step.status === "running") {
      step.status = "pending";
    }
  }
  await pipeline.save();

  await Log.create({
    projectId: pipeline.projectId,
    pipelineId: pipeline._id,
    level: "info",
    message: `Pipeline runner picked job ${pipeline.version}`,
    environment: pipeline.environment,
    source: "pipeline-runner",
    stream: "system",
  });

  await publishEvent({
    type: "pipeline.started",
    projectId: String(pipeline.projectId),
    pipelineId: String(pipeline._id),
    version: pipeline.version,
    createdAt: new Date().toISOString(),
  });

  const stageInputs = Array.isArray(job.steps) && job.steps.length > 0
    ? job.steps
    : pipeline.steps.map((step) => ({ name: step.name, command: step.command }));

  for (let index = 0; index < stageInputs.length; index += 1) {
    const stage = stageInputs[index];
    pipeline.steps[index].status = "running";
    await pipeline.save();

    await publishEvent({
      type: "pipeline.stage.started",
      projectId: String(pipeline.projectId),
      pipelineId: String(pipeline._id),
      stage: stage.name,
      createdAt: new Date().toISOString(),
    });

    try {
      const stageResult = await executeStageInContainer({
        pipeline: {
          _id: pipeline._id,
          projectId: pipeline.projectId,
          repoUrl,
          branch: pipeline.branch,
        },
        stage,
      });

      pipeline.steps[index].status = "success";
      pipeline.steps[index].duration = stageResult.duration;
      pipeline.steps[index].output = stageResult.output;
      await pipeline.save();

      await publishEvent({
        type: "pipeline.stage.completed",
        projectId: String(pipeline.projectId),
        pipelineId: String(pipeline._id),
        stage: stage.name,
        duration: stageResult.duration,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      pipeline.steps[index].status = "failed";
      pipeline.steps[index].output = error.message;
      pipeline.status = "failed";
      pipeline.duration = Date.now() - startedAt;
      await pipeline.save();

      await Log.create({
        projectId: pipeline.projectId,
        pipelineId: pipeline._id,
        level: "error",
        message: `Pipeline stage failed (${stage.name}): ${error.message}`,
        environment: pipeline.environment,
        source: "pipeline-runner",
        stream: "system",
      });

      await publishEvent({
        type: "pipeline.failed",
        projectId: String(pipeline.projectId),
        pipelineId: String(pipeline._id),
        stage: stage.name,
        error: error.message,
        createdAt: new Date().toISOString(),
      });

      await reportDeploymentFailureAlert({
        projectId: String(pipeline.projectId),
        stageName: stage.name,
        exitCode: 1,
        errorMessage: `Pipeline ${pipeline.version} failed on stage '${stage.name}': ${error.message}`,
      });

      await notifyPipeline({
        pipeline,
        severity: "critical",
        title: "Pipeline execution failed",
        message: `Pipeline ${pipeline.version} failed on stage '${stage.name}': ${error.message}`,
        requestedChannels: notifications,
      });

      throw error;
    }
  }

  const deployJob = await enqueueDeployJob({
    projectId: String(pipeline.projectId),
    pipelineId: String(pipeline._id),
    version: pipeline.version,
    strategy: pipeline.strategy,
    branch: pipeline.branch,
    triggeredBy: pipeline.triggeredBy,
    environment: pipeline.environment,
  });

  await publishEvent({
    type: "pipeline.deploy.queued",
    projectId: String(pipeline.projectId),
    pipelineId: String(pipeline._id),
    strategy: pipeline.strategy,
    deployJobId: String(deployJob.id),
    createdAt: new Date().toISOString(),
  });

  await publishEvent({
    type: "pipeline.notifications.sent",
    projectId: String(pipeline.projectId),
    pipelineId: String(pipeline._id),
    channels: notifications,
    createdAt: new Date().toISOString(),
  });

  await notifyPipeline({
    pipeline,
    severity: "info",
    title: "Pipeline execution completed",
    message: `Pipeline ${pipeline.version} completed successfully and deployment job ${deployJob.id} was queued.`,
    requestedChannels: notifications,
  });

  pipeline.status = "success";
  pipeline.duration = Date.now() - startedAt;
  await pipeline.save();

  const artifact = await uploadJsonArtifact({
    key: `pipelines/${pipeline.projectId}/${pipeline._id}/summary`,
    payload: {
      projectId: String(pipeline.projectId),
      pipelineId: String(pipeline._id),
      version: pipeline.version,
      branch: pipeline.branch,
      status: pipeline.status,
      duration: pipeline.duration,
      steps: pipeline.steps,
    },
  });

  await publishEvent({
    type: "pipeline.completed",
    projectId: String(pipeline.projectId),
    pipelineId: String(pipeline._id),
    status: pipeline.status,
    duration: pipeline.duration,
    artifact,
    createdAt: new Date().toISOString(),
  });

  await publishEvent({
    type: "pipeline.archived",
    projectId: String(pipeline.projectId),
    pipelineId: String(pipeline._id),
    artifact,
    createdAt: new Date().toISOString(),
  });
};

const startPipelineRunner = async () => {
  if (!PIPELINE_RUNNER_ENABLED || runnerStarted) {
    return;
  }

  bullConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  runnerWorker = new Worker(
    PIPELINE_QUEUE_NAME,
    async (job) => {
      await runPipelineJob(job.data || {});
    },
    {
      connection: bullConnection,
      concurrency: PIPELINE_RUNNER_CONCURRENCY,
    }
  );

  runnerWorker.on("failed", (job, error) => {
    console.warn(`[pipeline-runner] job failed (${job?.id || "unknown"})`, error.message);
  });

  runnerWorker.on("completed", (job) => {
    console.log(`[pipeline-runner] job completed (${job.id})`);
  });

  runnerStarted = true;
  console.log(`[pipeline-runner] started (queue=${PIPELINE_QUEUE_NAME}, concurrency=${PIPELINE_RUNNER_CONCURRENCY})`);
=======
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const Pipeline = require("../models/Pipeline");
const Project = require("../models/Project");
const { dequeuePipelineRun, bootstrapPendingRuns } = require("./pipelineQueue");
const { emitPipelineUpdate } = require("./pipelineEvents");

const MAX_STEP_OUTPUT_LENGTH = 60_000;
const RUNNER_DEFAULT_CONCURRENCY = Math.max(1, Number(process.env.PIPELINE_RUNNER_CONCURRENCY || 1));
const RUNNER_DEFAULT_STEP_TIMEOUT_MS = Math.max(1000, Number(process.env.PIPELINE_STEP_TIMEOUT_MS || 10 * 60 * 1000));
const RUNNER_DEFAULT_STEP_RETRIES = Math.max(0, Number(process.env.PIPELINE_STEP_RETRIES || 0));

let runnerStarted = false;
let dockerAvailable = null;

const clampOutput = (output) => {
  const normalized = String(output || "");
  if (normalized.length <= MAX_STEP_OUTPUT_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_STEP_OUTPUT_LENGTH)}\n...output truncated...`;
};

const runProcess = ({ command, args = [], cwd, shell = false, timeoutMs = RUNNER_DEFAULT_STEP_TIMEOUT_MS }) =>
  new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd,
      shell,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let timeoutReached = false;

    const timeoutHandle = setTimeout(() => {
      timeoutReached = true;
      output += `\nProcess exceeded timeout (${timeoutMs}ms)`;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1000).unref();
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.on("error", (error) => {
      output += `\nProcess error: ${error.message}`;
    });

    child.on("close", (code) => {
      clearTimeout(timeoutHandle);
      resolve({
        success: !timeoutReached && code === 0,
        code,
        timedOut: timeoutReached,
        durationMs: Date.now() - startedAt,
        output: clampOutput(output),
      });
    });
  });

const asPosixPath = (inputPath) => String(inputPath || "").replace(/\\/g, "/");

const detectDockerAvailability = async () => {
  if (dockerAvailable !== null) {
    return dockerAvailable;
  }

  const probe = await runProcess({
    command: "docker",
    args: ["version", "--format", "{{.Server.Version}}"],
    cwd: process.cwd(),
    shell: false,
    timeoutMs: 15_000,
  });

  dockerAvailable = probe.success;
  if (!dockerAvailable) {
    console.warn("Pipeline Runner: Docker engine unavailable, falling back to local shell execution");
  }
  return dockerAvailable;
};

const runStepInsideDocker = async ({ workspace, image, command, timeoutMs }) => {
  const workspacePosix = asPosixPath(workspace);
  return runProcess({
    command: "docker",
    args: [
      "run",
      "--rm",
      "-v",
      `${workspacePosix}:/workspace`,
      "-w",
      "/workspace",
      image,
      "sh",
      "-lc",
      command,
    ],
    cwd: workspace,
    shell: false,
    timeoutMs,
  });
};

const runStepLocally = async ({ workspace, command, timeoutMs }) =>
  runProcess({
    command,
    cwd: workspace,
    shell: true,
    timeoutMs,
  });

const emitRunSnapshot = async (runId, event) => {
  const run = await Pipeline.findById(runId);
  if (!run) {
    return;
  }

  emitPipelineUpdate({
    event,
    runId: String(run._id),
    status: run.status,
    duration: run.duration,
    steps: run.steps,
    updatedAt: run.updatedAt,
  });
};

const prepareWorkspace = async ({ runId, project, branch }) => {
  const rootWorkspace = path.join(os.tmpdir(), "innodeploy-runs");
  const runWorkspace = path.join(rootWorkspace, runId);

  await fs.rm(runWorkspace, { recursive: true, force: true });
  await fs.mkdir(runWorkspace, { recursive: true });

  const cloneResult = await runProcess({
    command: "git",
    args: ["clone", "--depth", "1", "--branch", branch || "main", project.repoUrl, runWorkspace],
    cwd: rootWorkspace,
    shell: false,
  });

  if (!cloneResult.success) {
    return {
      success: false,
      workspace: runWorkspace,
      output: `Failed to clone repository ${project.repoUrl}\n${cloneResult.output}`,
      durationMs: cloneResult.durationMs,
    };
  }

  return {
    success: true,
    workspace: runWorkspace,
    output: cloneResult.output,
    durationMs: cloneResult.durationMs,
  };
};

const markRemainingStepsSkipped = (run, fromIndex) => {
  for (let i = fromIndex; i < run.steps.length; i += 1) {
    if (run.steps[i].status === "pending" || run.steps[i].status === "running") {
      run.steps[i].status = "skipped";
      run.steps[i].duration = run.steps[i].duration || 0;
    }
  }
};

const processPipelineRun = async (runId) => {
  const startedAt = Date.now();
  let run = await Pipeline.findById(runId);
  if (!run) {
    return;
  }

  if (["success", "failed", "cancelled"].includes(run.status)) {
    return;
  }

  const project = await Project.findById(run.projectId).select("repoUrl branch");
  if (!project) {
    run.status = "failed";
    run.duration = Date.now() - startedAt;
    if (run.steps.length > 0) {
      run.steps[0].status = "failed";
      run.steps[0].output = "Project no longer exists";
      markRemainingStepsSkipped(run, 1);
    }
    await run.save();
    return;
  }

  run.status = "in-progress";
  await run.save();
  await emitRunSnapshot(run._id, "run-started");

  const checkout = await prepareWorkspace({
    runId: String(run._id),
    project,
    branch: run.branch || project.branch || "main",
  });

  if (!checkout.success) {
    run = await Pipeline.findById(runId);
    if (!run) return;

    run.status = "failed";
    run.duration = Date.now() - startedAt;
    if (run.steps.length > 0) {
      run.steps[0].status = "failed";
      run.steps[0].duration = Math.max(run.steps[0].duration || 0, checkout.durationMs);
      run.steps[0].output = clampOutput(`${run.steps[0].output || ""}\n${checkout.output}`.trim());
      markRemainingStepsSkipped(run, 1);
    }
    await run.save();
    await emitRunSnapshot(run._id, "run-failed");
    return;
  }

  const shouldUseDocker = await detectDockerAvailability();

  for (let stepIndex = 0; stepIndex < run.steps.length; stepIndex += 1) {
    run = await Pipeline.findById(runId);
    if (!run) return;

    if (run.status === "cancelled") {
      markRemainingStepsSkipped(run, stepIndex);
      run.duration = Date.now() - startedAt;
      await run.save();
      await emitRunSnapshot(run._id, "run-cancelled");
      return;
    }

    const step = run.steps[stepIndex];
    if (!step) {
      continue;
    }

    step.status = "running";
    step.attempt = 1;
    step.output = clampOutput(`${step.output || ""}\n$ ${step.command}`.trim());
    await run.save();
    await emitRunSnapshot(run._id, "step-started");

    const stepTimeoutMs = Math.max(1000, Number(step.timeoutMs || RUNNER_DEFAULT_STEP_TIMEOUT_MS));
    const stepRetries = Math.max(0, Number(step.retries ?? RUNNER_DEFAULT_STEP_RETRIES));

    let result = null;
    for (let attempt = 1; attempt <= stepRetries + 1; attempt += 1) {
      if (attempt > 1) {
        run = await Pipeline.findById(runId);
        if (!run) return;
        const retryStep = run.steps[stepIndex];
        retryStep.attempt = attempt;
        retryStep.output = clampOutput(`${retryStep.output || ""}\nRetry ${attempt - 1}/${stepRetries}`.trim());
        await run.save();
        await emitRunSnapshot(run._id, "step-retry");
      }

      result = shouldUseDocker
        ? await runStepInsideDocker({
            workspace: checkout.workspace,
            image: String(step.image || "node:20-alpine"),
            command: step.command,
            timeoutMs: stepTimeoutMs,
          })
        : await runStepLocally({ workspace: checkout.workspace, command: step.command, timeoutMs: stepTimeoutMs });

      if (result.success) {
        break;
      }
    }

    run = await Pipeline.findById(runId);
    if (!run) return;

    const latestStep = run.steps[stepIndex];
    if (!latestStep) {
      continue;
    }

    latestStep.duration = result.durationMs;
    latestStep.output = clampOutput(`${latestStep.output || ""}\n${result.output || ""}`.trim());

    if (result.success) {
      latestStep.status = "success";
      await run.save();
      await emitRunSnapshot(run._id, "step-success");
      continue;
    }

    latestStep.status = "failed";
    run.status = "failed";
    run.duration = Date.now() - startedAt;
    markRemainingStepsSkipped(run, stepIndex + 1);
    await run.save();
    await emitRunSnapshot(run._id, "step-failed");
    return;
  }

  run = await Pipeline.findById(runId);
  if (!run) return;
  if (run.status !== "cancelled") {
    run.status = "success";
  }
  run.duration = Date.now() - startedAt;
  await run.save();
  await emitRunSnapshot(run._id, "run-success");
};

const startPipelineRunner = async () => {
  if (runnerStarted) {
    return;
  }
  runnerStarted = true;

  const restoredCount = await bootstrapPendingRuns();
  if (restoredCount > 0) {
    console.log(`Pipeline Runner restored ${restoredCount} pending run(s) to queue`);
  }

  const loop = async (workerIndex) => {
    while (true) {
      try {
        const runId = await dequeuePipelineRun();
        if (!runId) {
          continue;
        }
        await processPipelineRun(runId);
      } catch (error) {
        console.error(`Pipeline Runner worker ${workerIndex} error:`, error?.message || error);
      }
    }
  };

  for (let i = 0; i < RUNNER_DEFAULT_CONCURRENCY; i += 1) {
    loop(i + 1).catch((error) => {
      console.error(`Pipeline Runner loop ${i + 1} crashed:`, error?.message || error);
      runnerStarted = false;
    });
  }

  console.log(`Pipeline Runner started with concurrency=${RUNNER_DEFAULT_CONCURRENCY}`);
>>>>>>> feat/backend-deployment-engine
};

module.exports = {
  startPipelineRunner,
};
