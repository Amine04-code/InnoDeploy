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
};

module.exports = {
  startPipelineRunner,
};
