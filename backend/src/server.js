require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { startPipelineRunner } = require("./services/pipelineRunner");
const { startDeployWorker } = require("./services/deployWorker");

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap: connect to databases, then start Express server.
 */
const startServer = async () => {
  await connectDB();
  await connectRedis();
  await startPipelineRunner();
  await startDeployWorker();

  app.listen(PORT, () => {
    console.log(`🚀 InnoDeploy API running on port ${PORT}`);
  });
};

startServer();
