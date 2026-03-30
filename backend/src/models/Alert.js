const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      required: true,
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
    },
    ruleType: {
      type: String,
      enum: ["cpu", "memory", "latency", "availability", "deployment", "disk", "certificate"],
      required: true,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved"],
      default: "open",
    },
    metricAtTrigger: [
      {
        label: { type: String, required: true, trim: true },
        value: { type: Number, required: true },
        unit: { type: String, default: "", trim: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
