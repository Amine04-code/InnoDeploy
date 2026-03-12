const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Host name is required"],
      trim: true,
    },
    environment: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    domain: {
      type: String,
      default: "",
      trim: true,
    },
    replicas: {
      type: Number,
      default: 1,
    },
    strategy: {
      type: String,
      enum: ["rolling", "blue-green", "canary", "recreate"],
      default: "rolling",
    },
    status: {
      type: String,
      enum: ["healthy", "degraded", "down"],
      default: "healthy",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Host", hostSchema);
