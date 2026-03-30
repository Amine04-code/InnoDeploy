const mongoose = require("mongoose");

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organisation name is required"],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"],
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "developer", "viewer"],
          default: "developer",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    alertRules: {
      cpuThreshold: {
        type: Number,
        default: 90,
      },
      memoryThreshold: {
        type: Number,
        default: 95,
      },
      latencyThreshold: {
        type: Number,
        default: 2000,
      },
      availabilityThreshold: {
        type: Number,
        default: 99,
      },
      serviceDownFailures: {
        type: Number,
        default: 5,
      },
      diskThreshold: {
        type: Number,
        default: 85,
      },
      certExpiryDays: {
        type: Number,
        default: 14,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      slackNotifications: {
        type: Boolean,
        default: false,
      },
    },
    billingInfo: {
      contactEmail: {
        type: String,
        default: "",
        trim: true,
      },
      companyAddress: {
        type: String,
        default: "",
        trim: true,
      },
      taxId: {
        type: String,
        default: "",
        trim: true,
      },
    },
    notificationChannels: {
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      slackEnabled: {
        type: Boolean,
        default: false,
      },
      discordEnabled: {
        type: Boolean,
        default: false,
      },
      expoEnabled: {
        type: Boolean,
        default: false,
      },
      webhookEnabled: {
        type: Boolean,
        default: false,
      },
      slackWebhook: {
        type: String,
        default: "",
        trim: true,
      },
      discordWebhook: {
        type: String,
        default: "",
        trim: true,
      },
      smtpHost: {
        type: String,
        default: "",
        trim: true,
      },
      smtpPort: {
        type: Number,
        default: 587,
      },
      smtpUsername: {
        type: String,
        default: "",
        trim: true,
      },
      smtpPassword: {
        type: String,
        default: "",
        trim: true,
      },
      smtpFromEmail: {
        type: String,
        default: "",
        trim: true,
      },
      emailRecipients: {
        type: [String],
        default: [],
      },
      expoAccessToken: {
        type: String,
        default: "",
        trim: true,
      },
      expoPushTokens: {
        type: [String],
        default: [],
      },
      webhookUrl: {
        type: String,
        default: "",
        trim: true,
      },
      webhookHeaders: {
        type: Map,
        of: String,
        default: {},
      },
    },
    dockerRegistry: {
      registryUrl: {
        type: String,
        default: "",
        trim: true,
      },
      username: {
        type: String,
        default: "",
        trim: true,
      },
      password: {
        type: String,
        default: "",
        trim: true,
      },
      namespace: {
        type: String,
        default: "",
        trim: true,
      },
    },
    gitProvider: {
      provider: {
        type: String,
        enum: ["github", "gitlab", "bitbucket", "none"],
        default: "none",
      },
      installationUrl: {
        type: String,
        default: "",
        trim: true,
      },
      webhookSecret: {
        type: String,
        default: "",
        trim: true,
      },
      repositoryOwner: {
        type: String,
        default: "",
        trim: true,
      },
    },
    invitations: [
      {
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "developer", "viewer"],
          default: "developer",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "revoked"],
          default: "pending",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    apiKeys: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        prefix: {
          type: String,
          required: true,
          trim: true,
        },
        secretHash: {
          type: String,
          required: true,
        },
        createdByUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastUsedAt: {
          type: Date,
          default: null,
        },
        revokedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organisation", organisationSchema);
