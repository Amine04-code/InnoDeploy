const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    command: { type: String, required: true },
    image: { type: String, default: "node:20-alpine", trim: true },
    retries: { type: Number, default: 0, min: 0 },
    timeoutMs: { type: Number, default: 10 * 60 * 1000, min: 1000 },
    attempt: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed", "skipped"],
      default: "pending",
    },
    duration: { type: Number, default: 0 },
    output: { type: String, default: "" },
  },
  { _id: false }
);

const pipelineSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    version: {
      type: String,
      required: [true, "Version is required"],
      trim: true,
    },
    strategy: {
      type: String,
      enum: ["rolling", "blue-green", "canary", "recreate"],
      default: "rolling",
    },
    runType: {
      type: String,
      enum: ["pipeline", "deployment", "rollback"],
      default: "pipeline",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "success", "failed", "cancelled"],
      default: "pending",
    },
    branch: {
      type: String,
      default: "main",
      trim: true,
    },
    triggeredBy: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    steps: [stepSchema],
    config: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pipeline", pipelineSchema);
