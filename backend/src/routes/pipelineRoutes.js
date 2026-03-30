const express = require("express");

const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  triggerPipelineRun,
  listProjectPipelineRuns,
  getPipelineRun,
  cancelPipelineRun,
  getStageLog,
  streamPipelineRun,
} = require("../controllers/pipelineController");

const router = express.Router();

router.post("/projects/:id/pipelines", authMiddleware, requireRole("owner", "admin", "developer"), triggerPipelineRun);
router.get("/projects/:id/pipelines", authMiddleware, listProjectPipelineRuns);
router.get("/pipelines/:runId", authMiddleware, getPipelineRun);
router.post("/pipelines/:runId/cancel", authMiddleware, requireRole("owner", "admin", "developer"), cancelPipelineRun);
router.get("/pipelines/:runId/logs/:stage", authMiddleware, getStageLog);
router.get("/pipelines/:runId/stream", authMiddleware, streamPipelineRun);

module.exports = router;
