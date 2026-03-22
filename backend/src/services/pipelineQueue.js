const Pipeline = require("../models/Pipeline");
const { redisClient } = require("../config/redis");

const PIPELINE_QUEUE_KEY = "pipeline:queue";
const PIPELINE_QUEUED_SET_KEY = "pipeline:queued";

const enqueuePipelineRun = async (runId) => {
  const normalizedRunId = String(runId || "").trim();
  if (!normalizedRunId) {
    return false;
  }

  const wasQueued = await redisClient.sAdd(PIPELINE_QUEUED_SET_KEY, normalizedRunId);
  if (!wasQueued) {
    return false;
  }

  await redisClient.lPush(PIPELINE_QUEUE_KEY, normalizedRunId);
  return true;
};

const dequeuePipelineRun = async () => {
  const item = await redisClient.brPop(PIPELINE_QUEUE_KEY, 0);
  if (!item?.element) {
    return null;
  }

  const runId = String(item.element);
  await redisClient.sRem(PIPELINE_QUEUED_SET_KEY, runId);
  return runId;
};

const bootstrapPendingRuns = async () => {
  const pendingRuns = await Pipeline.find({
    runType: "pipeline",
    status: { $in: ["pending", "in-progress"] },
  })
    .sort({ createdAt: 1 })
    .select("_id");

  for (const run of pendingRuns) {
    await enqueuePipelineRun(String(run._id));
  }

  return pendingRuns.length;
};

module.exports = {
  enqueuePipelineRun,
  dequeuePipelineRun,
  bootstrapPendingRuns,
};
