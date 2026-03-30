const IORedis = require("ioredis");
const { Queue } = require("bullmq");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const PIPELINE_QUEUE_NAME = String(process.env.PIPELINE_QUEUE_NAME || process.env.PIPELINE_QUEUE_KEY || "pipeline-jobs");
const DEPLOY_QUEUE_NAME = String(process.env.DEPLOY_QUEUE_NAME || process.env.DEPLOY_QUEUE_KEY || "deploy-jobs");

let queueConnection = null;
let pipelineQueue = null;
let deployQueue = null;

const getQueueConnection = () => {
  if (!queueConnection) {
    queueConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  }

  return queueConnection;
};

const getPipelineQueue = () => {
  if (!pipelineQueue) {
    pipelineQueue = new Queue(PIPELINE_QUEUE_NAME, { connection: getQueueConnection() });
  }

  return pipelineQueue;
};

const getDeployQueue = () => {
  if (!deployQueue) {
    deployQueue = new Queue(DEPLOY_QUEUE_NAME, { connection: getQueueConnection() });
  }

  return deployQueue;
};

const enqueuePipelineJob = async (payload) => {
  const queue = getPipelineQueue();
  return queue.add("pipeline.execute", payload, {
    removeOnComplete: 500,
    removeOnFail: 500,
  });
};

const enqueueDeployJob = async (payload) => {
  const queue = getDeployQueue();
  return queue.add("deploy.execute", payload, {
    removeOnComplete: 500,
    removeOnFail: 500,
  });
};

module.exports = {
  enqueuePipelineJob,
  enqueueDeployJob,
};