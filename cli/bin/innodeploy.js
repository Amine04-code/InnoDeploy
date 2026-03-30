#!/usr/bin/env node

const axios = require("axios");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { ask } = require("../src/prompts");
const { loadConfig, saveConfig } = require("../src/config");

const program = new Command();

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

function parseApiBaseUrl(cliValue) {
  const cfg = loadConfig();
  return cliValue || process.env.INNODEPLOY_API_URL || cfg.apiBaseUrl || "http://localhost:5000/api";
}

function createApiClient(apiBaseUrl) {
  const cfg = loadConfig();

  const client = axios.create({
    baseURL: apiBaseUrl,
    timeout: 20000,
  });

  client.interceptors.request.use((requestConfig) => {
    const latest = loadConfig();
    if (latest.accessToken) {
      requestConfig.headers.Authorization = `Bearer ${latest.accessToken}`;
    }
    return requestConfig;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const original = error?.config;

      if (!original || original._retry || status !== 401) {
        throw error;
      }

      const latest = loadConfig();
      if (!latest.refreshToken) {
        throw error;
      }

      original._retry = true;

      try {
        const refreshResponse = await axios.post(`${apiBaseUrl}/auth/refresh`, {
          refreshToken: latest.refreshToken,
        });

        const next = {
          ...latest,
          apiBaseUrl,
          accessToken: refreshResponse.data.accessToken || "",
          refreshToken: refreshResponse.data.refreshToken || latest.refreshToken,
        };
        saveConfig(next);

        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${next.accessToken}`,
        };

        return client.request(original);
      } catch {
        throw error;
      }
    }
  );

  return client;
}

async function resolveProjectByName(client, projectName) {
  const { data } = await client.get("/projects");
  const projects = data?.projects || [];
  const project = projects.find((p) => p.name === projectName);
  if (!project) {
    throw new Error(`Project not found: ${projectName}`);
  }
  return project;
}

function handleError(error) {
  const msg = error?.response?.data?.message || error?.message || "Unknown error";
  console.error(`Error: ${msg}`);
  process.exitCode = 1;
}

program
  .name("innodeploy")
  .description("InnoDeploy CLI")
  .option("--api <url>", "API base URL (default: http://localhost:5000/api)");

program
  .command("login")
  .description("Authenticate and store JWT locally")
  .option("-e, --email <email>", "Email")
  .option("-p, --password <password>", "Password")
  .action(async (options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = axios.create({ baseURL: apiBaseUrl, timeout: 20000 });

      const email = options.email || (await ask("Email: "));
      const password = options.password || (await ask("Password: "));

      const { data } = await client.post("/auth/login", { email, password });

      const cfg = loadConfig();
      saveConfig({
        ...cfg,
        apiBaseUrl,
        accessToken: data.accessToken || "",
        refreshToken: data.refreshToken || "",
        user: data.user || null,
      });

      console.log(`Logged in as ${data?.user?.email || email}`);
    } catch (error) {
      handleError(error);
    }
  });

const projects = program.command("projects").description("Projects commands");

projects
  .command("list")
  .description("List all projects")
  .action(async () => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const { data } = await client.get("/projects");
      const projects = data?.projects || [];

      if (projects.length === 0) {
        console.log("No projects found.");
        return;
      }

      projects.forEach((p) => {
        console.log(`${p.id}  ${p.name}  [${p.status}]  ${p.branch}`);
      });
    } catch (error) {
      handleError(error);
    }
  });

projects
  .command("create <name>")
  .description("Create a new project")
  .requiredOption("--repo <url>", "Repository URL")
  .option("--branch <branch>", "Git branch", "main")
  .option("--description <description>", "Project description", "")
  .action(async (name, options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const { data } = await client.post("/projects", {
        name,
        repoUrl: options.repo,
        branch: options.branch,
        description: options.description,
      });

      console.log(data?.message || "Project created");
      if (data?.project) printJson(data.project);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("deploy <project>")
  .description("Trigger deployment")
  .option("--env <environment>", "Environment", "production")
  .option("--strategy <strategy>", "Deployment strategy", "rolling")
  .action(async (projectName, options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const project = await resolveProjectByName(client, projectName);
      const { data } = await client.post(`/projects/${project.id}/deploy`, {
        environment: options.env,
        strategy: options.strategy,
      });

      console.log(data?.message || "Deployment triggered");
      if (data?.run) printJson(data.run);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("rollback <project>")
  .description("Rollback project deployment")
  .option("--env <environment>", "Environment", "production")
  .action(async (projectName, options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const project = await resolveProjectByName(client, projectName);
      const { data } = await client.post(`/projects/${project.id}/rollback`, {
        environment: options.env,
      });

      console.log(data?.message || "Rollback triggered");
      if (data?.run) printJson(data.run);
    } catch (error) {
      handleError(error);
    }
  });

const pipeline = program.command("pipeline").description("Pipeline commands");

pipeline
  .command("trigger <project>")
  .description("Manually trigger a pipeline run")
  .option("--branch <branch>", "Git branch")
  .option("--env <environment>", "Environment", "staging")
  .action(async (projectName, options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const project = await resolveProjectByName(client, projectName);

      const payload = {
        environment: options.env,
      };
      if (options.branch) payload.branch = options.branch;

      const { data } = await client.post(`/projects/${project.id}/pipelines`, payload);
      console.log(data?.message || "Pipeline queued");
      if (data?.run) printJson(data.run);
    } catch (error) {
      handleError(error);
    }
  });

pipeline
  .command("status <runId>")
  .description("Check pipeline run status")
  .action(async (runId) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const { data } = await client.get(`/pipelines/${runId}`);
      printJson(data?.run || data);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("logs <project>")
  .description("Show project logs")
  .option("--env <environment>", "Environment")
  .option("--follow", "Poll and follow logs", false)
  .option("--level <level>", "Level filter")
  .option("--search <term>", "Search term")
  .action(async (projectName, options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const project = await resolveProjectByName(client, projectName);

      const render = (logs) => {
        logs.forEach((entry) => {
          const ts = entry.eventAt || entry.timestamp || entry.createdAt || "-";
          const level = String(entry.level || "info").toUpperCase();
          const container = entry.containerName || entry.source || "app";
          console.log(`[${ts}] ${level} ${container}: ${entry.message || ""}`);
        });
      };

      const fetchOnce = async () => {
        const { data } = await client.get(`/projects/${project.id}/logs`, {
          params: {
            environment: options.env,
            level: options.level,
            search: options.search,
            limit: 100,
          },
        });

        const logs = data?.logs || [];
        return logs;
      };

      if (!options.follow) {
        const logs = await fetchOnce();
        if (logs.length === 0) {
          console.log("No logs found.");
          return;
        }
        render(logs.reverse());
        return;
      }

      console.log("Following logs (poll every 3s). Press Ctrl+C to stop.");
      const seen = new Set();
      while (true) {
        const logs = await fetchOnce();
        const fresh = logs.filter((entry) => {
          const key = String(entry._id || entry.id || `${entry.eventAt}-${entry.message}`);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (fresh.length > 0) {
          render(fresh.reverse());
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("status <project>")
  .description("Show project health and summary")
  .action(async (projectName) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const project = await resolveProjectByName(client, projectName);
      const { data } = await client.get(`/projects/${project.id}/status`);
      printJson(data);
    } catch (error) {
      handleError(error);
    }
  });

const hosts = program.command("hosts").description("Hosts commands");

hosts
  .command("list")
  .description("List registered hosts")
  .action(async () => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const { data } = await client.get("/hosts");
      const hostList = data?.hosts || [];
      if (hostList.length === 0) {
        console.log("No hosts found.");
        return;
      }

      hostList.forEach((host) => {
        console.log(`${host._id}  ${host.hostname} (${host.ip})  ${host.status}`);
      });
    } catch (error) {
      handleError(error);
    }
  });

hosts
  .command("add")
  .description("Add a new host interactively")
  .action(async () => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);

      const hostname = await ask("Hostname: ");
      const ip = await ask("IP: ");
      const sshUser = await ask("SSH user: ");
      const sshPrivateKeyName = await ask("SSH private key name: ");

      const { data } = await client.post("/hosts", {
        hostname,
        ip,
        sshUser,
        sshPrivateKeyName,
      });

      console.log(data?.message || "Host created");
      if (data?.host) printJson(data.host);
    } catch (error) {
      handleError(error);
    }
  });

const secrets = program.command("secrets").description("Secrets commands");

secrets
  .command("set <project> <key> <value>")
  .description("Set secret env var")
  .option("--env <environment>", "Environment", "production")
  .action(async (projectName, key, value, options) => {
    try {
      const apiBaseUrl = parseApiBaseUrl(program.opts().api);
      const client = createApiClient(apiBaseUrl);
      const project = await resolveProjectByName(client, projectName);

      const { data } = await client.post(`/projects/${project.id}/envs/${options.env}/secrets`, {
        key,
        value,
      });

      console.log(data?.message || "Secret updated");
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("init")
  .description("Scaffold a .innodeploy.yml template")
  .option("--path <dir>", "Directory", process.cwd())
  .action((options) => {
    try {
      const targetDir = path.resolve(options.path);
      const targetFile = path.join(targetDir, ".innodeploy.yml");
      if (fs.existsSync(targetFile)) {
        console.log(`Already exists: ${targetFile}`);
        return;
      }

      const template = [
        "name: my-service",
        "environment: staging",
        "strategy: rolling",
        "steps:",
        "  - name: install",
        "    command: npm ci",
        "  - name: test",
        "    command: npm test",
        "  - name: build",
        "    command: npm run build",
      ].join("\n");

      fs.writeFileSync(targetFile, `${template}\n`, "utf8");
      console.log(`Created ${targetFile}`);
    } catch (error) {
      handleError(error);
    }
  });

program.parseAsync(process.argv);
