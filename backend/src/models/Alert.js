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
      enum: ["info", "warning", "error", "critical"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
    },
    environment: {
      type: String,
      default: "",
      trim: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
