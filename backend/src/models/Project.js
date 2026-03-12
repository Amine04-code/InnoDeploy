const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    repoUrl: {
      type: String,
      required: [true, "Repository URL is required"],
      trim: true,
    },
    branch: {
      type: String,
      default: "main",
      trim: true,
    },
    status: {
      type: String,
      enum: ["running", "stopped", "failed"],
      default: "stopped",
    },
    lastDeployAt: {
      type: Date,
      default: null,
    },
    envCount: {
      type: Number,
      default: 0,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
