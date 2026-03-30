const mongoose = require("mongoose");

const Log = require("../models/Log");
const Metric = require("../models/Metric");
const Pipeline = require("../models/Pipeline");
const Project = require("../models/Project");
const User = require("../models/User");
const { getMonitorWorkerStatus } = require("../services/monitorWorker");

const LOG_SEARCH_MODE = String(process.env.LOG_SEARCH_MODE || "text").toLowerCase();
const LOG_ATLAS_INDEX = String(process.env.LOG_ATLAS_INDEX || "logs_index");

const parseLimit = (value, fallback = 200) => Math.max(1, Math.min(Number(value || fallback), 1000));

const findLogsWithSearch = async ({ projectId, baseQuery, searchTerm, limit }) => {
  if (LOG_SEARCH_MODE === "atlas") {
    const searchFilters = [{ equals: { path: "projectId", value: projectId } }];

    if (baseQuery.level) searchFilters.push({ equals: { path: "level", value: baseQuery.level } });
    if (baseQuery.environment) {
      searchFilters.push({ equals: { path: "environment", value: baseQuery.environment } });
    }
    if (baseQuery.source) searchFilters.push({ equals: { path: "source", value: baseQuery.source } });
    if (baseQuery.containerName) {
      searchFilters.push({ equals: { path: "containerName", value: baseQuery.containerName } });
    }

    try {
      const logs = await Log.aggregate([
        {
          $search: {
            index: LOG_ATLAS_INDEX,
            compound: {
              must: [
                {
                  text: {
                    query: searchTerm,
                    path: ["message", "source", "containerName"],
                  },
                },
              ],
              filter: searchFilters,
            },
          },
        },
        { $sort: { eventAt: -1, createdAt: -1 } },
        { $limit: limit },
      ]);

      return logs;
    } catch (_atlasError) {
      // Fall through to local index/regex search.
    }
  }

  try {
    const logs = await Log.find(
      {
        ...baseQuery,
        $text: { $search: searchTerm },
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" }, eventAt: -1, createdAt: -1 })
      .limit(limit);

    if (logs.length > 0) {
      return logs;
    }
  } catch (_textSearchError) {
    // Fall through to regex search when text index is unavailable.
  }

  return Log.find({ ...baseQuery, message: { $regex: searchTerm, $options: "i" } })
    .sort({ eventAt: -1, createdAt: -1 })
    .limit(limit);
};

const getOrganisationId = async (userId) => {
  const user = await User.findById(userId).select("organisationId");
  return user?.organisationId ?? null;
};

const getProjectForOrganisation = async (projectId, organisationId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return null;
  }
  return Project.findOne({ _id: projectId, organisationId });
};

const getProjectMetrics = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { from, to, environment, limit = 200 } = req.query;
    const query = { projectId: project._id };

    if (environment) query.environment = String(environment);

    if (from || to) {
      query.recordedAt = {};
      if (from) query.recordedAt.$gte = new Date(String(from));
      if (to) query.recordedAt.$lte = new Date(String(to));
    }

    const metrics = await Metric.find(query).sort({ recordedAt: -1 }).limit(parseLimit(limit));

    res.json({ metrics });
  } catch (error) {
    next(error);
  }
};

const getProjectLogs = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { level, search, environment, source, container, limit = 200 } = req.query;
    const query = { projectId: project._id };

    if (level) query.level = String(level);
    if (environment) query.environment = String(environment);
    if (source) query.source = String(source);
    if (container) query.containerName = String(container);

    const normalizedSearch = String(search || "").trim();
    const logs = normalizedSearch
      ? await findLogsWithSearch({
          projectId: project._id,
          baseQuery: query,
          searchTerm: normalizedSearch,
          limit: parseLimit(limit),
        })
      : await Log.find(query).sort({ eventAt: -1, createdAt: -1 }).limit(parseLimit(limit));

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

const getProjectStatus = async (req, res, next) => {
  try {
    const organisationId = await getOrganisationId(req.user.id);
    if (!organisationId) {
      return res.status(400).json({ message: "User is not attached to an organisation" });
    }

    const project = await getProjectForOrganisation(req.params.id, organisationId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const [latestMetric, latestRun] = await Promise.all([
      Metric.findOne({ projectId: project._id }).sort({ recordedAt: -1 }),
      Pipeline.findOne({ projectId: project._id }).sort({ createdAt: -1 }),
    ]);

    const cpuLoad = Number(latestMetric?.cpu_percent ?? latestMetric?.cpu ?? 0);
    const memoryLoad = Number(latestMetric?.memory_percent ?? latestMetric?.memory ?? 0);
    const availability = Number(latestMetric?.uptime ?? 0);
    const healthState = String(latestMetric?.health_state || "").toLowerCase();

    let status = "up";
    if (healthState === "down") {
      status = "down";
    } else if (healthState === "degraded") {
      status = "degraded";
    } else if ((latestMetric && (cpuLoad > 90 || memoryLoad > 90 || availability < 95)) || (latestRun && latestRun.status === "failed")) {
      status = "degraded";
    }

    res.json({
      projectId: String(project._id),
      status,
      projectStatus: project.status,
      latestMetric,
      latestRun,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

const getMonitoringStreamInfo = async (_req, res, next) => {
  try {
    const worker = getMonitorWorkerStatus();

    res.json({
      worker,
      websocket: {
        transport: "redis-pubsub",
        note: "Subscribe your websocket gateway to the stream channel for global updates, or to projectPrefix + <projectId> for scoped updates.",
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectMetrics,
  getProjectLogs,
  getProjectStatus,
  getMonitoringStreamInfo,
};
