require("dotenv").config();

const connectDB = require("../config/db");
const { connectRedis } = require("../config/redis");
const { startDeployWorker } = require("../services/deployWorker");

const start = async () => {
  await connectDB();
  await connectRedis();
  await startDeployWorker();
};

start().catch((error) => {
  console.error("[deploy-worker] failed to start", error.message);
  process.exit(1);
});
