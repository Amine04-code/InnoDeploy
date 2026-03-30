const express = require("express");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/", authMiddleware, getSettings);
router.put("/organisation", authMiddleware, requireRole("owner", "admin"), updateOrganisationProfile);
router.post("/members/invite", authMiddleware, requireRole("owner", "admin"), inviteMember);
router.patch("/members/:memberId/role", authMiddleware, requireRole("owner", "admin"), updateMemberRole);
router.delete("/members/:memberId", authMiddleware, requireRole("owner", "admin"), removeMember);
router.delete("/invitations/:id", authMiddleware, requireRole("owner", "admin"), revokeInvitation);
router.put("/notifications", authMiddleware, requireRole("owner", "admin"), updateNotificationChannels);
router.post("/notifications/test", authMiddleware, requireRole("owner", "admin"), testNotificationChannels);
router.put("/docker-registry", authMiddleware, requireRole("owner", "admin"), updateDockerRegistry);
router.put("/git-provider", authMiddleware, requireRole("owner", "admin"), updateGitProvider);
router.put("/preferences", authMiddleware, updateUserPreferences);
router.post("/api-keys", authMiddleware, requireRole("owner", "admin"), createApiKey);
router.delete("/api-keys/:id", authMiddleware, requireRole("owner", "admin"), revokeApiKey);
router.delete("/organisation", authMiddleware, requireRole("owner"), deleteOrganisation);

module.exports = router;