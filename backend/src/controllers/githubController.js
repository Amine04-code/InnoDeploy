const User = require("../models/User");

const sanitizeNextPath = (raw) => {
  if (typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
};

const buildGithubConnectUrl = () => {
  const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;
  const nextPath = "/dashboard/new-project";
  return `${apiBase}/auth/github?mode=connect&next=${encodeURIComponent(nextPath)}`;
};

const listRepositories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+github.accessToken github.username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const githubAccessToken = user.github?.accessToken;
    if (!githubAccessToken) {
      return res.status(409).json({
        message: "GitHub account is not connected",
        connectUrl: buildGithubConnectUrl(),
      });
    }

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=owner", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "InnoDeploy",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 401 || status === 403) {
        return res.status(409).json({
          message: "GitHub connection expired. Please reconnect.",
          connectUrl: buildGithubConnectUrl(),
        });
      }

      const details = await response.text();
      return res.status(502).json({ message: `Failed to load repositories from GitHub: ${details}` });
    }

    const repos = await response.json();
    const repositories = Array.isArray(repos)
      ? repos.map((repo) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          private: Boolean(repo.private),
          defaultBranch: repo.default_branch || "main",
          updatedAt: repo.updated_at,
          htmlUrl: repo.html_url,
          cloneUrl: repo.clone_url,
        }))
      : [];

    return res.json({
      repositories,
      githubUsername: user.github?.username || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRepositories,
};
