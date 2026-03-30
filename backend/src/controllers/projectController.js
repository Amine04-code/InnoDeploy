const Project = require("../models/Project");
const Alert = require("../models/Alert");
const Log = require("../models/Log");
const Metric = require("../models/Metric");
const Pipeline = require("../models/Pipeline");
const User = require("../models/User");
const Organisation = require("../models/Organisation");
const mongoose = require("mongoose");

const getOrganisationId = async (userId) => {
  const user = await User.findById(userId).select("organisationId");
  return user?.organisationId ?? null;
};

const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ensureOrganisationId = async (userId) => {
  const user = await User.findById(userId).select("name email role organisationId");
  if (!user) return null;
  if (user.organisationId) return user.organisationId;

  const baseSlug =
    toSlug(user.name) ||
    toSlug(String(user.email || "").split("@")[0]) ||
    `workspace-${String(user._id).slice(-6)}`;

  let slug = baseSlug;
  let suffix = 1;
  while (await Organisation.findOne({ slug }).select("_id")) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const organisation = await Organisation.create({
    name: user.name ? `${user.name}'s Workspace` : "My Workspace",
    slug,
    members: [{ userId: user._id, role: "owner" }],
  });

  user.organisationId = organisation._id;
  user.role = "owner";
  await user.save();

  return organisation._id;
};

const mapProject = (project) => ({
  id: project._id.toString(),
  name: project.name,
  description: project.description,
  repoUrl: project.repoUrl,
  branch: project.branch,
  status: project.status,
  lastDeployAt: project.lastDeployAt,
  envCount: project.envCount,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

const getProjectForOrganisation = async (projectId, organisationId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return null;
  }
  return Project.findOne({ _id: projectId, organisationId });
};

const normalizeEnvName = (name) => String(name || "").trim().toLowerCase();

const listProjects = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const projects = await Project.find({ organisationId }).sort({ createdAt: -1 });
    res.json({ projects: projects.map(mapProject) });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project: mapProject(project) });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    let organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      organisationId = await ensureOrganisationId(req.user.id);
    }
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const { name, repoUrl, branch = "main", description = "", envCount = 0 } = req.body;
    if (!name || !repoUrl) {
      return res.status(400).json({ message: "name and repoUrl are required" });
    }

    const normalizedName = String(name).trim();
    const existingProject = await Project.findOne({ organisationId, name: normalizedName }).select("_id");
    if (existingProject) {
      return res.status(409).json({ message: "A project with this name already exists" });
    }

    const project = await Project.create({
      name: normalizedName,
      repoUrl: String(repoUrl).trim(),
      branch: String(branch).trim() || "main",
      description: String(description).trim(),
      status: "stopped",
      envCount: Number(envCount) || 0,
      organisationId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Project created",
      project: mapProject(project),
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const allowedStatus = ["running", "stopped", "failed"];
    const { name, description, repoUrl, branch, status, envCount, lastDeployAt } = req.body;

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (!normalizedName) {
        return res.status(400).json({ message: "Project name cannot be empty" });
      }

      const nameTaken = await Project.findOne({
        organisationId,
        name: normalizedName,
        _id: { $ne: project._id },
      }).select("_id");

      if (nameTaken) {
        return res.status(409).json({ message: "A project with this name already exists" });
      }

      project.name = normalizedName;
    }

    if (description !== undefined) {
      project.description = String(description).trim();
    }
    if (repoUrl !== undefined) {
      project.repoUrl = String(repoUrl).trim();
    }
    if (branch !== undefined) {
      project.branch = String(branch).trim() || "main";
    }
    if (status !== undefined) {
      const nextStatus = String(status);
      if (!allowedStatus.includes(nextStatus)) {
        return res.status(400).json({ message: "Invalid project status" });
      }
      project.status = nextStatus;
    }
    if (envCount !== undefined) {
      const nextEnvCount = Number(envCount);
      if (!Number.isInteger(nextEnvCount) || nextEnvCount < 0) {
        return res.status(400).json({ message: "envCount must be a non-negative integer" });
      }
      project.envCount = nextEnvCount;
    }
    if (lastDeployAt !== undefined) {
      if (lastDeployAt === null || lastDeployAt === "") {
        project.lastDeployAt = null;
      } else {
        const parsedDate = new Date(lastDeployAt);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid lastDeployAt date" });
        }
        project.lastDeployAt = parsedDate;
      }
    }

    await project.save();
    res.json({ message: "Project updated", project: mapProject(project) });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectId = project._id;
    await Alert.deleteMany({ projectId });
    await Pipeline.deleteMany({ projectId });
    await Log.deleteMany({ projectId });
    await Metric.deleteMany({ projectId });
    await project.deleteOne();

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

const createEnvironment = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const envName = normalizeEnvName(req.body.name);
    if (!envName) {
      return res.status(400).json({ message: "Environment name is required" });
    }

    const existing = project.environments.find((env) => env.name === envName);
    if (existing) {
      return res.status(409).json({ message: "Environment already exists" });
    }

    project.environments.push({
      name: envName,
      config: req.body.config ?? {},
      secrets: req.body.secrets ?? {},
    });
    project.envCount = project.environments.length;
    await project.save();

    const environment = project.environments.find((env) => env.name === envName);
    res.status(201).json({ message: "Environment created", environment });
  } catch (error) {
    next(error);
  }
};

const updateEnvironment = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const envName = normalizeEnvName(req.params.env);
    const environment = project.environments.find((env) => env.name === envName);
    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    if (req.body.config !== undefined) {
      environment.config = req.body.config;
    }
    if (req.body.secrets !== undefined && typeof req.body.secrets === "object") {
      environment.secrets = {
        ...(environment.secrets || {}),
        ...req.body.secrets,
      };
    }

    await project.save();
    res.json({ message: "Environment updated", environment });
  } catch (error) {
    next(error);
  }
};

const removeEnvironment = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const envName = normalizeEnvName(req.params.env);
    const beforeCount = project.environments.length;
    project.environments = project.environments.filter((env) => env.name !== envName);
    if (project.environments.length === beforeCount) {
      return res.status(404).json({ message: "Environment not found" });
    }

    project.envCount = project.environments.length;
    await project.save();

    res.json({ message: "Environment removed" });
  } catch (error) {
    next(error);
  }
};

const upsertEnvironmentSecret = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const envName = normalizeEnvName(req.params.env);
    const environment = project.environments.find((env) => env.name === envName);
    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    const key = String(req.body.key || "").trim();
    const value = String(req.body.value || "");
    if (!key) {
      return res.status(400).json({ message: "Secret key is required" });
    }

    const secrets = environment.secrets instanceof Map
      ? Object.fromEntries(environment.secrets.entries())
      : { ...(environment.secrets || {}) };
    secrets[key] = value;
    environment.secrets = secrets;

    await project.save();
    res.json({ message: "Environment secret updated", secretKey: key });
  } catch (error) {
    next(error);
  }
};

const createDeploymentRun = async ({ project, req, runType }) => {
  const steps = [
    { name: "build", command: "docker build .", status: "pending", duration: 0, output: "" },
    { name: "deploy", command: "kubectl apply -f deployment.yml", status: "pending", duration: 0, output: "" },
  ];

  const pipeline = await Pipeline.create({
    projectId: project._id,
    version: String(req.body.version || `v${Date.now()}`),
    strategy: String(req.body.strategy || "rolling"),
    runType,
    status: "pending",
    branch: String(req.body.branch || project.branch || "main"),
    triggeredBy: req.user.email || req.user.id,
    environment: String(req.body.environment || "staging"),
    duration: 0,
    steps,
    config: String(req.body.config || ""),
  });

  return pipeline;
};

const triggerDeployment = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const run = await createDeploymentRun({ project, req, runType: "deployment" });
    project.status = "running";
    project.lastDeployAt = new Date();
    await project.save();

    res.status(201).json({ message: "Deployment triggered", run });
  } catch (error) {
    next(error);
  }
};

const rollbackDeployment = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const run = await createDeploymentRun({ project, req, runType: "rollback" });
    run.strategy = "recreate";
    await run.save();

    project.status = "running";
    project.lastDeployAt = new Date();
    await project.save();

    res.status(201).json({ message: "Rollback triggered", run });
  } catch (error) {
    next(error);
  }
};

const getDeploymentHistory = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const history = await Pipeline.find({
      projectId: project._id,
      runType: { $in: ["deployment", "rollback"] },
    }).sort({ createdAt: -1 });

    res.json({ history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  createEnvironment,
  updateEnvironment,
  removeEnvironment,
  upsertEnvironmentSecret,
  triggerDeployment,
  rollbackDeployment,
  getDeploymentHistory,
};
