const crypto = require("crypto");

const Alert = require("../models/Alert");
const Host = require("../models/Host");
const Organisation = require("../models/Organisation");
const Project = require("../models/Project");
const User = require("../models/User");
const { dispatchOrganisationNotification } = require("../services/notificationDispatcher");

const ROLES = ["owner", "admin", "developer", "viewer"];
const LANGUAGES = ["english", "french", "arabic"];
const SECRET_MASK = "********";
const SENSITIVE_HEADER_PATTERN = /(authorization|token|secret|password|api[-_]?key)/i;

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseHeaderMap = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) continue;
    result[normalizedKey] = String(item ?? "");
  }

  return result;
};

const toPlainObject = (value) => {
  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {};
};

const isMaskedValue = (value) => String(value || "") === SECRET_MASK;

const maskSecret = (value) => (value ? SECRET_MASK : "");

const maskWebhookHeaders = (headers) => {
  const plain = toPlainObject(headers);
  const masked = {};

  for (const [key, value] of Object.entries(plain)) {
    const normalized = String(key || "").trim();
    if (!normalized) continue;

    const stringValue = String(value ?? "");
    masked[normalized] = SENSITIVE_HEADER_PATTERN.test(normalized) && stringValue ? SECRET_MASK : stringValue;
  }

  return masked;
};

const mergeWebhookHeadersWithMask = ({ incoming, existing }) => {
  const merged = {};
  const current = toPlainObject(existing);

  for (const [key, value] of Object.entries(incoming)) {
    const normalized = String(key || "").trim();
    if (!normalized) continue;

    if (SENSITIVE_HEADER_PATTERN.test(normalized) && isMaskedValue(value)) {
      merged[normalized] = String(current[normalized] ?? "");
      continue;
    }

    merged[normalized] = String(value ?? "");
  }

  return merged;
};

const sanitizeNotificationChannels = (channels) => {
  const plain = toPlainObject(channels);
  return {
    ...plain,
    smtpPassword: maskSecret(plain.smtpPassword),
    expoAccessToken: maskSecret(plain.expoAccessToken),
    webhookHeaders: maskWebhookHeaders(plain.webhookHeaders),
  };
};

const getContext = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.organisationId) {
    return { user: user ?? null, organisation: null };
  }

  const organisation = await Organisation.findById(user.organisationId).populate({
    path: "members.userId",
    select: "name email role createdAt",
  });

  return { user, organisation };
};

const mapMember = (member) => ({
  id: String(member.userId?._id ?? member.userId),
  name: member.userId?.name ?? "Unknown user",
  email: member.userId?.email ?? "",
  role: member.role,
  joinedAt: member.joinedAt,
});

const mapInvitation = (invite) => ({
  id: String(invite._id),
  email: invite.email,
  role: invite.role,
  status: invite.status,
  invitedAt: invite.invitedAt,
});

const mapApiKey = (key) => ({
  id: String(key._id),
  name: key.name,
  prefix: key.prefix,
  createdAt: key.createdAt,
  lastUsedAt: key.lastUsedAt,
  revokedAt: key.revokedAt,
});

const serializeSettings = (organisation, user) => ({
  organisation: {
    id: String(organisation._id),
    name: organisation.name,
    slug: organisation.slug,
    plan: organisation.plan,
    billingInfo: organisation.billingInfo,
  },
  members: organisation.members.map(mapMember),
  invitations: organisation.invitations.map(mapInvitation),
  notificationChannels: sanitizeNotificationChannels(organisation.notificationChannels),
  dockerRegistry: organisation.dockerRegistry,
  gitProvider: organisation.gitProvider,
  apiKeys: organisation.apiKeys.map(mapApiKey),
  preferences: {
    theme: user.preferences?.theme ?? "system",
    language: user.preferences?.language ?? "english",
  },
});

const requireOrganisationContext = async (req, res) => {
  const context = await getContext(req.user.id);
  if (!context.organisation || !context.user) {
    res.status(400).json({ message: "User is not attached to an organisation" });
    return null;
  }
  return context;
};

const getSettings = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    res.json(serializeSettings(context.organisation, context.user));
  } catch (error) {
    next(error);
  }
};

const updateOrganisationProfile = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const { name, slug, billingInfo } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    const normalizedSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingSlug = await Organisation.findOne({
      slug: normalizedSlug,
      _id: { $ne: context.organisation._id },
    }).select("_id");

    if (existingSlug) {
      return res.status(409).json({ message: "This slug is already in use" });
    }

    context.organisation.name = String(name).trim();
    context.organisation.slug = normalizedSlug;
    context.organisation.billingInfo = {
      ...context.organisation.billingInfo,
      contactEmail: billingInfo?.contactEmail ?? "",
      companyAddress: billingInfo?.companyAddress ?? "",
      taxId: billingInfo?.taxId ?? "",
    };
    await context.organisation.save();

    res.json({
      message: "Organisation profile updated",
      organisation: serializeSettings(context.organisation, context.user).organisation,
    });
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const email = String(req.body.email ?? "").trim().toLowerCase();
    const role = String(req.body.role ?? "developer").trim();

    if (!email || !ROLES.includes(role)) {
      return res.status(400).json({ message: "A valid email and role are required" });
    }

    const existingMember = context.organisation.members.find(
      (member) => member.userId?.email?.toLowerCase() === email
    );
    if (existingMember) {
      return res.status(409).json({ message: "This user is already a member" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.organisationId && String(existingUser.organisationId) !== String(context.organisation._id)) {
        return res.status(409).json({ message: "This user already belongs to another organisation" });
      }

      existingUser.organisationId = context.organisation._id;
      existingUser.role = role;
      await existingUser.save();

      context.organisation.members.push({ userId: existingUser._id, role });
      context.organisation.invitations = context.organisation.invitations.filter(
        (invite) => invite.email !== email
      );
      await context.organisation.save();
      await context.organisation.populate({ path: "members.userId", select: "name email role createdAt" });

      return res.status(201).json({
        message: "Member added to organisation",
        member: mapMember(context.organisation.members[context.organisation.members.length - 1]),
      });
    }

    const existingInvite = context.organisation.invitations.find(
      (invite) => invite.email === email && invite.status === "pending"
    );
    if (existingInvite) {
      return res.status(409).json({ message: "An invitation is already pending for this email" });
    }

    context.organisation.invitations.push({ email, role, status: "pending" });
    await context.organisation.save();

    res.status(201).json({
      message: "Invitation recorded",
      invitation: mapInvitation(context.organisation.invitations[context.organisation.invitations.length - 1]),
    });
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const role = String(req.body.role ?? "").trim();
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const member = context.organisation.members.find(
      (entry) => String(entry.userId?._id ?? entry.userId) === req.params.memberId
    );
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const ownerCount = context.organisation.members.filter((entry) => entry.role === "owner").length;
    if (member.role === "owner" && role !== "owner" && ownerCount <= 1) {
      return res.status(400).json({ message: "The organisation must keep at least one owner" });
    }

    member.role = role;
    await User.findByIdAndUpdate(req.params.memberId, { role });
    await context.organisation.save();
    await context.organisation.populate({ path: "members.userId", select: "name email role createdAt" });

    const updatedMember = context.organisation.members.find(
      (entry) => String(entry.userId?._id ?? entry.userId) === req.params.memberId
    );

    res.json({ message: "Member role updated", member: mapMember(updatedMember) });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const member = context.organisation.members.find(
      (entry) => String(entry.userId?._id ?? entry.userId) === req.params.memberId
    );
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const ownerCount = context.organisation.members.filter((entry) => entry.role === "owner").length;
    if (member.role === "owner" && ownerCount <= 1) {
      return res.status(400).json({ message: "The organisation must keep at least one owner" });
    }

    context.organisation.members = context.organisation.members.filter(
      (entry) => String(entry.userId?._id ?? entry.userId) !== req.params.memberId
    );
    await context.organisation.save();
    await User.findByIdAndUpdate(req.params.memberId, {
      organisationId: null,
      role: "developer",
    });

    res.json({ message: "Member removed" });
  } catch (error) {
    next(error);
  }
};

const revokeInvitation = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const invitation = context.organisation.invitations.id(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    invitation.status = "revoked";
    await context.organisation.save();

    res.json({ message: "Invitation revoked" });
  } catch (error) {
    next(error);
  }
};

const updateNotificationChannels = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const currentChannels = toPlainObject(context.organisation.notificationChannels);
    const hasEmailRecipients = Object.prototype.hasOwnProperty.call(req.body, "emailRecipients");
    const hasExpoPushTokens = Object.prototype.hasOwnProperty.call(req.body, "expoPushTokens");
    const hasWebhookHeaders = Object.prototype.hasOwnProperty.call(req.body, "webhookHeaders");

    const emailRecipients = hasEmailRecipients
      ? parseStringArray(req.body.emailRecipients)
      : parseStringArray(currentChannels.emailRecipients);
    const expoPushTokens = hasExpoPushTokens
      ? parseStringArray(req.body.expoPushTokens)
      : parseStringArray(currentChannels.expoPushTokens);
    const webhookHeaders = hasWebhookHeaders
      ? mergeWebhookHeadersWithMask({
          incoming: parseHeaderMap(req.body.webhookHeaders),
          existing: currentChannels.webhookHeaders,
        })
      : toPlainObject(currentChannels.webhookHeaders);

    const smtpPassword = req.body.smtpPassword === undefined || isMaskedValue(req.body.smtpPassword)
      ? String(currentChannels.smtpPassword || "")
      : String(req.body.smtpPassword || "");
    const expoAccessToken = req.body.expoAccessToken === undefined || isMaskedValue(req.body.expoAccessToken)
      ? String(currentChannels.expoAccessToken || "")
      : String(req.body.expoAccessToken || "");

    context.organisation.notificationChannels = {
      ...currentChannels,
      emailEnabled: req.body.emailEnabled ?? currentChannels.emailEnabled,
      slackEnabled: req.body.slackEnabled ?? currentChannels.slackEnabled,
      discordEnabled: req.body.discordEnabled ?? currentChannels.discordEnabled,
      expoEnabled: req.body.expoEnabled ?? currentChannels.expoEnabled,
      webhookEnabled: req.body.webhookEnabled ?? currentChannels.webhookEnabled,
      slackWebhook: req.body.slackWebhook ?? currentChannels.slackWebhook ?? "",
      discordWebhook: req.body.discordWebhook ?? currentChannels.discordWebhook ?? "",
      smtpHost: req.body.smtpHost ?? currentChannels.smtpHost ?? "",
      smtpPort: Number(req.body.smtpPort ?? currentChannels.smtpPort ?? 587),
      smtpUsername: req.body.smtpUsername ?? currentChannels.smtpUsername ?? "",
      smtpPassword,
      smtpFromEmail: req.body.smtpFromEmail ?? currentChannels.smtpFromEmail ?? "",
      emailRecipients,
      expoAccessToken,
      expoPushTokens,
      webhookUrl: req.body.webhookUrl ?? currentChannels.webhookUrl ?? "",
      webhookHeaders,
    };
    await context.organisation.save();

    res.json({
      message: "Notification channels updated",
      notificationChannels: sanitizeNotificationChannels(context.organisation.notificationChannels),
    });
  } catch (error) {
    next(error);
  }
};

const testNotificationChannels = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const channels = Array.isArray(req.body.channels)
      ? req.body.channels.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
      : [];

    const requestedChannels = channels.length > 0
      ? {
          email: channels.includes("email"),
          slack: channels.includes("slack"),
          discord: channels.includes("discord"),
          expo: channels.includes("expo"),
          webhook: channels.includes("webhook"),
        }
      : null;

    const result = await dispatchOrganisationNotification({
      organisation: context.organisation,
      event: {
        severity: String(req.body.severity || "info"),
        title: String(req.body.title || "InnoDeploy test notification"),
        message: String(req.body.message || "This is a test notification from InnoDeploy."),
        serviceName: String(req.body.serviceName || "notification-test"),
        metricAtTrigger: Array.isArray(req.body.metricAtTrigger) ? req.body.metricAtTrigger : [],
        metadata: { source: "settings.test", requestedBy: req.user.id },
      },
      requestedChannels,
    });

    res.json({ message: "Notification test completed", result });
  } catch (error) {
    next(error);
  }
};

const updateDockerRegistry = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    context.organisation.dockerRegistry = {
      ...context.organisation.dockerRegistry,
      registryUrl: req.body.registryUrl ?? "",
      username: req.body.username ?? "",
      password: req.body.password ?? "",
      namespace: req.body.namespace ?? "",
    };
    await context.organisation.save();

    res.json({
      message: "Docker registry updated",
      dockerRegistry: context.organisation.dockerRegistry,
    });
  } catch (error) {
    next(error);
  }
};

const updateGitProvider = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const provider = String(req.body.provider ?? "none");
    if (!["github", "gitlab", "bitbucket", "none"].includes(provider)) {
      return res.status(400).json({ message: "Invalid git provider" });
    }

    context.organisation.gitProvider = {
      ...context.organisation.gitProvider,
      provider,
      installationUrl: req.body.installationUrl ?? "",
      webhookSecret: req.body.webhookSecret ?? "",
      repositoryOwner: req.body.repositoryOwner ?? "",
    };
    await context.organisation.save();

    res.json({ message: "Git provider updated", gitProvider: context.organisation.gitProvider });
  } catch (error) {
    next(error);
  }
};

const updateUserPreferences = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const theme = String(req.body.theme ?? "system");
    const language = String(req.body.language ?? "english");
    if (!["light", "dark", "system"].includes(theme) || !LANGUAGES.includes(language)) {
      return res.status(400).json({ message: "Invalid preferences payload" });
    }

    context.user.preferences = {
      ...context.user.preferences,
      theme,
      language,
    };
    await context.user.save();

    res.json({
      message: "Preferences updated",
      preferences: {
        theme: context.user.preferences.theme,
        language: context.user.preferences.language,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createApiKey = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const name = String(req.body.name ?? "CLI access").trim();
    if (!name) {
      return res.status(400).json({ message: "API key name is required" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const prefix = `idp_${token.slice(0, 8)}`;
    const secretHash = crypto.createHash("sha256").update(token).digest("hex");

    context.organisation.apiKeys.push({
      name,
      prefix,
      secretHash,
      createdByUserId: context.user._id,
    });
    await context.organisation.save();

    const createdKey = context.organisation.apiKeys[context.organisation.apiKeys.length - 1];
    res.status(201).json({
      message: "API key created",
      apiKey: mapApiKey(createdKey),
      secret: `${prefix}.${token}`,
    });
  } catch (error) {
    next(error);
  }
};

const revokeApiKey = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const apiKey = context.organisation.apiKeys.id(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    apiKey.revokedAt = new Date();
    await context.organisation.save();

    res.json({ message: "API key revoked" });
  } catch (error) {
    next(error);
  }
};

const deleteOrganisation = async (req, res, next) => {
  try {
    const context = await requireOrganisationContext(req, res);
    if (!context) return;

    const confirmation = String(req.body.confirmation ?? "").trim();
    if (confirmation !== context.organisation.slug) {
      return res.status(400).json({ message: `Type ${context.organisation.slug} to confirm deletion` });
    }

    const organisationId = context.organisation._id;
    const projectIds = await Project.find({ organisationId }).distinct("_id");

    await Alert.deleteMany({ projectId: { $in: projectIds } });
    await Host.deleteMany({ organisationId });
    await Project.deleteMany({ organisationId });
    await User.updateMany({ organisationId }, { organisationId: null, role: "developer" });
    await Organisation.findByIdAndDelete(organisationId);

    res.json({ message: "Organisation deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApiKey,
  deleteOrganisation,
  getSettings,
  inviteMember,
  removeMember,
  revokeApiKey,
  revokeInvitation,
  updateDockerRegistry,
  updateGitProvider,
  updateMemberRole,
  updateNotificationChannels,
  testNotificationChannels,
  updateOrganisationProfile,
  updateUserPreferences,
};