const Pipeline = require("../models/Pipeline");
const { redisClient } = require("../config/redis");

const DEPLOYMENT_QUEUE_KEY = "deployment:queue";
const DEPLOYMENT_QUEUED_SET_KEY = "deployment:queued";

const enqueueDeploymentRun = async (runId) => {
  const normalizedRunId = String(runId || "").trim();
  if (!normalizedRunId) {
    return false;
  }

  const wasQueued = await redisClient.sAdd(DEPLOYMENT_QUEUED_SET_KEY, normalizedRunId);
  if (!wasQueued) {
    return false;
  }

  await redisClient.lPush(DEPLOYMENT_QUEUE_KEY, normalizedRunId);
  return true;
};

const dequeueDeploymentRun = async () => {
  const item = await redisClient.brPop(DEPLOYMENT_QUEUE_KEY, 0);
  if (!item?.element) {
    return null;
  }

  const runId = String(item.element);
  await redisClient.sRem(DEPLOYMENT_QUEUED_SET_KEY, runId);
  return runId;
};

const bootstrapPendingDeploymentRuns = async () => {
  const pendingRuns = await Pipeline.find({
    runType: { $in: ["deployment", "rollback"] },
    status: { $in: ["pending", "in-progress"] },
  })
    .sort({ createdAt: 1 })
    .select("_id");

  for (const run of pendingRuns) {
    await enqueueDeploymentRun(String(run._id));
  }

  return pendingRuns.length;
};

module.exports = {
  enqueueDeploymentRun,
  dequeueDeploymentRun,
  bootstrapPendingDeploymentRuns,
};
