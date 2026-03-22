const { spawn } = require("child_process");

const Pipeline = require("../models/Pipeline");
const Project = require("../models/Project");
const Log = require("../models/Log");
const { emitPipelineUpdate } = require("./pipelineEvents");
const { dequeueDeploymentRun, bootstrapPendingDeploymentRuns } = require("./deploymentQueue");

const DEPLOY_WORKER_CONCURRENCY = Math.max(1, Number(process.env.DEPLOY_WORKER_CONCURRENCY || 1));
const DEPLOY_STEP_TIMEOUT_MS = Math.max(1000, Number(process.env.DEPLOY_STEP_TIMEOUT_MS || 8 * 60 * 1000));

let deployWorkerStarted = false;

const clampOutput = (output) => {
  const normalized = String(output || "");
  if (normalized.length <= 60_000) {
    return normalized;
  }
  return `${normalized.slice(0, 60_000)}\n...output truncated...`;
};

const runProcess = ({ command, timeoutMs }) =>
  new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(command, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let timedOut = false;

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      output += `\nCommand exceeded timeout (${timeoutMs}ms)`;
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
        success: !timedOut && code === 0,
        timedOut,
        code,
        durationMs: Date.now() - startedAt,
        output: clampOutput(output),
      });
    });
  });

const markRemainingStepsSkipped = (run, fromIndex) => {
  for (let i = fromIndex; i < run.steps.length; i += 1) {
    if (run.steps[i].status === "pending" || run.steps[i].status === "running") {
      run.steps[i].status = "skipped";
      run.steps[i].duration = run.steps[i].duration || 0;
    }
  }
};

const emitRunSnapshot = async (runId, event) => {
  const run = await Pipeline.findById(runId);
  if (!run) return;

  emitPipelineUpdate({
    event,
    runId: String(run._id),
    status: run.status,
    duration: run.duration,
    steps: run.steps,
    runType: run.runType,
    updatedAt: run.updatedAt,
  });
};

const appendDeploymentLog = async ({ run, projectId, level, message }) => {
  await Log.create({
    projectId,
    pipelineId: run._id,
    level,
    message,
    environment: run.environment,
    source: "deploy-worker",
  });
};

const processDeploymentRun = async (runId) => {
  const startedAt = Date.now();
  let run = await Pipeline.findById(runId);
  if (!run) return;

  if (!["deployment", "rollback"].includes(run.runType)) {
    return;
  }

  if (["success", "failed", "cancelled"].includes(run.status)) {
    return;
  }

  const project = await Project.findById(run.projectId);
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
  await emitRunSnapshot(run._id, "deploy-run-started");
  await appendDeploymentLog({
    run,
    projectId: project._id,
    level: "info",
    message: `${run.runType} started using ${run.strategy} strategy`,
  });

  for (let stepIndex = 0; stepIndex < run.steps.length; stepIndex += 1) {
    run = await Pipeline.findById(runId);
    if (!run) return;

    if (run.status === "cancelled") {
      markRemainingStepsSkipped(run, stepIndex);
      run.duration = Date.now() - startedAt;
      await run.save();
      await emitRunSnapshot(run._id, "deploy-run-cancelled");
      return;
    }

    const step = run.steps[stepIndex];
    step.status = "running";
    step.attempt = 1;
    step.output = clampOutput(`${step.output || ""}\n$ ${step.command}`.trim());
    await run.save();
    await emitRunSnapshot(run._id, "deploy-step-started");

    const retries = Math.max(0, Number(step.retries || 0));
    const timeoutMs = Math.max(1000, Number(step.timeoutMs || DEPLOY_STEP_TIMEOUT_MS));

    let result = null;
    for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
      if (attempt > 1) {
        run = await Pipeline.findById(runId);
        if (!run) return;

        run.steps[stepIndex].attempt = attempt;
        run.steps[stepIndex].output = clampOutput(
          `${run.steps[stepIndex].output || ""}\nRetry ${attempt - 1}/${retries}`.trim()
        );
        await run.save();
        await emitRunSnapshot(run._id, "deploy-step-retry");
      }

      result = await runProcess({ command: step.command, timeoutMs });
      if (result.success) {
        break;
      }
    }

    run = await Pipeline.findById(runId);
    if (!run) return;

    const currentStep = run.steps[stepIndex];
    currentStep.duration = result.durationMs;
    currentStep.output = clampOutput(`${currentStep.output || ""}\n${result.output || ""}`.trim());

    if (result.success) {
      currentStep.status = "success";
      await run.save();
      await emitRunSnapshot(run._id, "deploy-step-success");
      continue;
    }

    currentStep.status = "failed";
    run.status = "failed";
    run.duration = Date.now() - startedAt;
    markRemainingStepsSkipped(run, stepIndex + 1);
    await run.save();

    project.status = "failed";
    await project.save();
    await emitRunSnapshot(run._id, "deploy-step-failed");
    await appendDeploymentLog({
      run,
      projectId: project._id,
      level: "error",
      message: `${run.runType} failed at step '${currentStep.name}'`,
    });
    return;
  }

  run = await Pipeline.findById(runId);
  if (!run) return;

  if (run.status !== "cancelled") {
    run.status = "success";
  }
  run.duration = Date.now() - startedAt;
  await run.save();

  project.status = "running";
  project.lastDeployAt = new Date();
  await project.save();

  await emitRunSnapshot(run._id, "deploy-run-success");
  await appendDeploymentLog({
    run,
    projectId: project._id,
    level: "info",
    message: `${run.runType} completed successfully`,
  });
};

const startDeployWorker = async () => {
  if (deployWorkerStarted) {
    return;
  }
  deployWorkerStarted = true;

  const restoredCount = await bootstrapPendingDeploymentRuns();
  if (restoredCount > 0) {
    console.log(`Deploy Worker restored ${restoredCount} pending run(s) to queue`);
  }

  const loop = async (workerIndex) => {
    while (true) {
      try {
        const runId = await dequeueDeploymentRun();
        if (!runId) {
          continue;
        }

        await processDeploymentRun(runId);
      } catch (error) {
        console.error(`Deploy Worker ${workerIndex} error:`, error?.message || error);
      }
    }
  };

  for (let i = 0; i < DEPLOY_WORKER_CONCURRENCY; i += 1) {
    loop(i + 1).catch((error) => {
      console.error(`Deploy Worker loop ${i + 1} crashed:`, error?.message || error);
      deployWorkerStarted = false;
    });
  }

  console.log(`Deploy Worker started with concurrency=${DEPLOY_WORKER_CONCURRENCY}`);
};

module.exports = {
  startDeployWorker,
};
