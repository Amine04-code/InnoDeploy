const mongoose = require("mongoose");

const LOG_RETENTION_DAYS = Math.max(1, Number(process.env.LOG_RETENTION_DAYS) || 30);

const logSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    pipelineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pipeline",
      default: null,
    },
    level: {
      type: String,
      enum: ["debug", "info", "warn", "error"],
      default: "info",
    },
    message: {
      type: String,
      required: [true, "Log message is required"],
    },
    environment: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      default: "system",
      trim: true,
    },
    containerId: {
      type: String,
      default: "",
      trim: true,
    },
    containerName: {
      type: String,
      default: "",
      trim: true,
    },
    stream: {
      type: String,
      enum: ["stdout", "stderr", "system"],
      default: "system",
    },
    eventAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

logSchema.index({ projectId: 1, createdAt: -1 });
logSchema.index({ projectId: 1, level: 1, createdAt: -1 });
logSchema.index({ message: "text", source: "text", containerName: "text" });
logSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Log", logSchema);
