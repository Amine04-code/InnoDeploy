const { spawn } = require("child_process");
const { mkdtemp, readFile, rm } = require("fs/promises");
const os = require("os");
const path = require("path");

const yaml = require("js-yaml");

const CLONE_TIMEOUT_MS = Math.max(10000, Number(process.env.PIPELINE_CONFIG_CLONE_TIMEOUT_MS) || 45000);

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore", shell: false, ...options });
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`command timed out: ${command} ${args.join(" ")}`));
    }, CLONE_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`command failed (${code}): ${command} ${args.join(" ")}`));
    });
  });

const normalizeStep = (step, index) => {
  if (!step || typeof step !== "object") {
    return null;
  }

  const name = String(step.name || step.stage || `stage-${index + 1}`).trim();
  const command = String(step.command || step.run || "").trim();
  if (!name || !command) {
    return null;
  }

  const image = step.image ? String(step.image).trim() : undefined;
  return image ? { name, command, image } : { name, command };
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
};

const parsePipelineConfigText = (text) => {
  const parsed = yaml.load(text) || {};
  const root = parsed.pipeline && typeof parsed.pipeline === "object" ? parsed.pipeline : parsed;

  const rawSteps = Array.isArray(root.stages)
    ? root.stages
    : Array.isArray(root.steps)
      ? root.steps
      : [];

  const steps = rawSteps
    .map((step, index) => normalizeStep(step, index))
    .filter(Boolean);

  if (steps.length === 0) {
    throw new Error("Pipeline config is missing stages/steps");
  }

  return {
    steps,
    strategy: String(root.strategy || parsed.strategy || "rolling"),
    environment: String(root.environment || parsed.environment || "staging"),
    notifications: {
      slack: parseBoolean(root.notifications?.slack, true),
      email: parseBoolean(root.notifications?.email, true),
    },
  };
};

const readConfigFromRepo = async ({ repoUrl, branch }) => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "innodeploy-config-"));

  try {
    await runCommand("git", ["clone", "--depth", "1", "--branch", branch, repoUrl, tempRoot]);

    const ymlPath = path.join(tempRoot, ".innodeploy.yml");
    const yamlPath = path.join(tempRoot, ".innodeploy.yaml");

    try {
      const ymlContent = await readFile(ymlPath, "utf8");
      return { content: ymlContent, path: ".innodeploy.yml" };
    } catch (_missingYml) {
      const yamlContent = await readFile(yamlPath, "utf8");
      return { content: yamlContent, path: ".innodeploy.yaml" };
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
};

const resolvePipelineConfig = async ({ repoUrl, branch, inlineConfig }) => {
  if (inlineConfig && String(inlineConfig).trim()) {
    return {
      ...parsePipelineConfigText(String(inlineConfig)),
      source: "inline",
      sourcePath: "request",
    };
  }

  try {
    const loaded = await readConfigFromRepo({ repoUrl, branch });
    return {
      ...parsePipelineConfigText(loaded.content),
      source: "repository",
      sourcePath: loaded.path,
    };
  } catch (error) {
    throw new Error(`Unable to resolve pipeline config from repository: ${error.message}`);
  }
};

module.exports = {
  resolvePipelineConfig,
};