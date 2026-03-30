const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const hostRoutes = require("./routes/hostRoutes");
const alertRoutes = require("./routes/alertRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const orgRoutes = require("./routes/orgRoutes");
const pipelineRoutes = require("./routes/pipelineRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const githubRoutes = require("./routes/githubRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// ── Global middleware ─────────────────────────────────────
app.use(helmet()); // security headers
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(morgan("dev")); // HTTP request logging
app.use(express.json()); // parse JSON bodies

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "InnoDeploy API", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/github", githubRoutes);
app.use("/api", orgRoutes);
app.use("/api", pipelineRoutes);
app.use("/api", monitoringRoutes);
app.use("/api/webhooks", webhookRoutes);

// ── 404 catch-all ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Error handler (must be last) ──────────────────────────
app.use(errorMiddleware);

module.exports = app;
