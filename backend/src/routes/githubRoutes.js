const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { listRepositories } = require("../controllers/githubController");

const router = express.Router();

router.get("/repositories", authMiddleware, listRepositories);

module.exports = router;
