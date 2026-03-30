const express = require("express");

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getProjectMetrics,
  getProjectLogs,
  getProjectStatus,
  getMonitoringStreamInfo,
} = require("../controllers/monitoringController");

const router = express.Router();

router.get("/projects/:id/metrics", authMiddleware, getProjectMetrics);
router.get("/projects/:id/logs", authMiddleware, getProjectLogs);
router.get("/projects/:id/status", authMiddleware, getProjectStatus);
router.get("/monitoring/stream", authMiddleware, getMonitoringStreamInfo);

module.exports = router;
