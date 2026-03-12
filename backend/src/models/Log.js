const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
