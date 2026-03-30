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
    cpu_percent: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    memory_mb: {
      type: Number,
      default: 0,
    },
    memory_percent: {
      type: Number,
      default: 0,
    },
    net_rx_bytes: {
      type: Number,
      default: 0,
    },
    net_tx_bytes: {
      type: Number,
      default: 0,
    },
    http_status: {
      type: Number,
      default: 0,
    },
    latency: {
      type: Number,
      default: 0,
    },
    http_latency_ms: {
      type: Number,
      default: 0,
    },
    restart_count: {
      type: Number,
      default: 0,
    },
    uptime: {
      type: Number,
      default: 0,
    },
    uptime_s: {
      type: Number,
      default: 0,
    },
    disk_usage_mb: {
      type: Number,
      default: 0,
    },
    disk_usage_percent: {
      type: Number,
      default: 0,
    },
    health_state: {
      type: String,
      enum: ["up", "degraded", "down"],
      default: "up",
    },
    failed_probes: {
      type: Number,
      default: 0,
    },
    probe_mode: {
      type: String,
      enum: ["http", "tcp", "container"],
      default: "container",
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Metric", metricSchema);
