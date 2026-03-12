const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "developer", "viewer"],
      default: "developer",
    },

    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },

      defaultProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
      },

      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        slack: {
          type: Boolean,
          default: false,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  { timestamps: true }
);

// ── Pre-save hook: hash password before persisting ────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  next();
});

// ── Instance method: compare candidate password ───────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);