const yaml = require("js-yaml");

const ALLOWED_TRIGGER_EVENTS = new Set(["push", "tag", "pull_request", "schedule"]);
const ALLOWED_STRATEGIES = new Set(["rolling", "blue-green", "canary", "recreate"]);

const toStepCommand = (commands) => {
  if (!Array.isArray(commands)) return "";
  return commands.map((command) => String(command).trim()).filter(Boolean).join(" && ");
};

const parseInnoDeployConfig = (input) => {
  if (typeof input === "object" && input !== null) {
    return input;
  }

  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Pipeline config must be a non-empty YAML string or object");
  }

  const parsed = yaml.load(input);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Pipeline config must be a YAML object");
  }

  return parsed;
};

const validateInnoDeployConfig = (config) => {
  const errors = [];

  if (!config.name || typeof config.name !== "string") {
    errors.push("'name' is required and must be a string");
  }

  if (config.trigger !== undefined) {
    if (!config.trigger || typeof config.trigger !== "object" || Array.isArray(config.trigger)) {
      errors.push("'trigger' must be an object");
    } else {
      if (config.trigger.branch !== undefined && typeof config.trigger.branch !== "string") {
        errors.push("'trigger.branch' must be a string");
      }

      if (config.trigger.events !== undefined) {
        if (!Array.isArray(config.trigger.events) || config.trigger.events.length === 0) {
          errors.push("'trigger.events' must be a non-empty array when provided");
        } else {
          config.trigger.events.forEach((event, index) => {
            const normalized = String(event || "").trim().toLowerCase();
            if (!ALLOWED_TRIGGER_EVENTS.has(normalized)) {
              errors.push(
                `'trigger.events[${index}]' must be one of: ${Array.from(ALLOWED_TRIGGER_EVENTS).join(", ")}`
              );
            }
          });
        }
      }
    }
  }

  if (!Array.isArray(config.stages) || config.stages.length === 0) {
    errors.push("'stages' is required and must be a non-empty array");
  } else {
    config.stages.forEach((stage, index) => {
      if (!stage || typeof stage !== "object" || Array.isArray(stage)) {
        errors.push(`'stages[${index}]' must be an object`);
        return;
      }

      if (!stage.name || typeof stage.name !== "string") {
        errors.push(`'stages[${index}].name' is required and must be a string`);
      }

      if (!Array.isArray(stage.commands) || stage.commands.length === 0) {
        errors.push(`'stages[${index}].commands' is required and must be a non-empty array`);
      } else {
        stage.commands.forEach((command, commandIndex) => {
          if (!String(command || "").trim()) {
            errors.push(`'stages[${index}].commands[${commandIndex}]' must be a non-empty string`);
          }
        });
      }

      if (stage.image !== undefined && typeof stage.image !== "string") {
        errors.push(`'stages[${index}].image' must be a string when provided`);
      }

      if (stage.retries !== undefined && (!Number.isInteger(stage.retries) || stage.retries < 0)) {
        errors.push(`'stages[${index}].retries' must be an integer >= 0 when provided`);
      }

      if (stage.timeoutMs !== undefined && (!Number.isInteger(stage.timeoutMs) || stage.timeoutMs < 1000)) {
        errors.push(`'stages[${index}].timeoutMs' must be an integer >= 1000 when provided`);
      }
    });
  }

  if (config.strategy !== undefined) {
    const strategy = String(config.strategy).trim().toLowerCase();
    if (!ALLOWED_STRATEGIES.has(strategy)) {
      errors.push(`'strategy' must be one of: ${Array.from(ALLOWED_STRATEGIES).join(", ")}`);
    }
  }

  if (config.health_check !== undefined) {
    const healthCheck = config.health_check;
    if (!healthCheck || typeof healthCheck !== "object" || Array.isArray(healthCheck)) {
      errors.push("'health_check' must be an object when provided");
    } else {
      if (!healthCheck.path || typeof healthCheck.path !== "string") {
        errors.push("'health_check.path' is required and must be a string when health_check is provided");
      }
      if (healthCheck.interval !== undefined && typeof healthCheck.interval !== "string") {
        errors.push("'health_check.interval' must be a string when provided");
      }
      if (healthCheck.retries !== undefined && !Number.isInteger(healthCheck.retries)) {
        errors.push("'health_check.retries' must be an integer when provided");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const buildStepsFromConfig = (config) => {
  if (!Array.isArray(config?.stages)) {
    return [];
  }

  return config.stages.map((stage) => ({
    name: String(stage.name).trim(),
    command: toStepCommand(stage.commands),
    image: String(stage.image || "node:20-alpine").trim() || "node:20-alpine",
    retries: Number.isInteger(stage.retries) ? stage.retries : 0,
    timeoutMs: Number.isInteger(stage.timeoutMs) ? stage.timeoutMs : 10 * 60 * 1000,
    attempt: 0,
    status: "pending",
    duration: 0,
    output: "",
  }));
};

module.exports = {
  parseInnoDeployConfig,
  validateInnoDeployConfig,
  buildStepsFromConfig,
};