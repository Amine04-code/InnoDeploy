require("dotenv").config();
require("dotenv").config({ path: ".env.local", override: true });

const connectDB = require("../config/db");
const { connectRedis } = require("../config/redis");
const { ensureObjectStore } = require("../services/objectStore");
const { startPipelineRunner } = require("../services/pipelineRunner");

const start = async () => {
  await connectDB();
  await connectRedis();
  await ensureObjectStore();
  await startPipelineRunner();
};

start().catch((error) => {
  console.error("[pipeline-runner] failed to start", error.message);
  process.exit(1);
});
