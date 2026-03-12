const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    environment: {
      type: String,
      required: true,
      trim: true,
    },
    cpu: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    latency: {
      type: Number,
      default: 0,
    },
    uptime: {
      type: Number,
      default: 0,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Metric", metricSchema);
