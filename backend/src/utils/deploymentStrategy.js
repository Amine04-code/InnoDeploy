const DEFAULT_STEP_TIMEOUT_MS = 8 * 60 * 1000;

const toStep = ({ name, command }) => ({
  name,
  command,
  image: "alpine:3.20",
  retries: 0,
  timeoutMs: DEFAULT_STEP_TIMEOUT_MS,
  attempt: 0,
  status: "pending",
  duration: 0,
  output: "",
});

const rollingSteps = () => ([
  toStep({ name: "prepare-release", command: "echo 'Preparing rolling deployment'" }),
  toStep({ name: "rollout-batch", command: "echo 'Rolling update: replacing instances in batches'" }),
  toStep({ name: "health-gate", command: "echo 'Waiting for health-check gate before next batch'" }),
  toStep({ name: "finalize", command: "echo 'Rolling deployment completed'" }),
]);

const blueGreenSteps = () => ([
  toStep({ name: "provision-green", command: "echo 'Provisioning green environment'" }),
  toStep({ name: "verify-green", command: "echo 'Running smoke checks on green stack'" }),
  toStep({ name: "switch-traffic", command: "echo 'Switching traffic from blue to green'" }),
  toStep({ name: "drain-blue", command: "echo 'Draining old blue environment'" }),
]);

const canarySteps = () => ([
  toStep({ name: "deploy-canary", command: "echo 'Deploying canary release'" }),
  toStep({ name: "route-10-percent", command: "echo 'Routing 10% traffic to canary'" }),
  toStep({ name: "evaluate-canary", command: "echo 'Evaluating canary error-rate and latency'" }),
  toStep({ name: "promote-canary", command: "echo 'Promoting canary to full release'" }),
]);

const recreateSteps = () => ([
  toStep({ name: "scale-down", command: "echo 'Scaling down old workload'" }),
  toStep({ name: "apply-release", command: "echo 'Applying fresh release'" }),
  toStep({ name: "scale-up", command: "echo 'Scaling up new workload'" }),
]);

const buildDeploymentSteps = ({ strategy, runType }) => {
  const normalizedStrategy = String(strategy || "rolling").trim().toLowerCase();

  if (runType === "rollback" || normalizedStrategy === "recreate") {
    return recreateSteps();
  }

  if (normalizedStrategy === "blue-green") {
    return blueGreenSteps();
  }

  if (normalizedStrategy === "canary") {
    return canarySteps();
  }

  return rollingSteps();
};

module.exports = {
  buildDeploymentSteps,
};
