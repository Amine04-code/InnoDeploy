const fs = require("fs");
const os = require("os");
const path = require("path");

const CONFIG_DIR = path.join(os.homedir(), ".innodeploy-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const defaultConfig = {
  apiBaseUrl: process.env.INNODEPLOY_API_URL || "http://localhost:5000/api",
  accessToken: "",
  refreshToken: "",
  user: null,
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return { ...defaultConfig };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return { ...defaultConfig, ...parsed };
  } catch {
    return { ...defaultConfig };
  }
}

function saveConfig(next) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), "utf8");
}

module.exports = {
  CONFIG_FILE,
  loadConfig,
  saveConfig,
};
