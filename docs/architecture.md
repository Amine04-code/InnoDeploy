# InnoDeploy — Architecture Overview

## System Components

```
┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Next.js     │────▶│  Express API │────▶│ MongoDB  │
│  Dashboard   │     │  (backend)   │────▶│ Redis    │
└──────────────┘     └──────────────┘     └──────────┘
   :3000                :5000               :27017/6379
```

## Authentication Flow

1. User submits credentials via Dashboard
2. Backend validates and returns JWT access + refresh tokens
3. Dashboard stores tokens in memory (Zustand)
4. All subsequent API calls attach `Authorization: Bearer <token>`
5. On 401, client attempts token refresh; if that fails, redirect to login

## CLI Tool (innodeploy-cli)

### Overview

The InnoDeploy CLI is a command-line interface for interacting with the InnoDeploy API.
It supports project operations, deployment commands, pipeline control, and log streaming directly from terminal workflows.

### Installation

```bash
npm install -g @innoorb/innodeploy-cli
innodeploy login
```

`innodeploy login` prompts for email/password and stores a local JWT for authenticated calls.

### Command Reference

| Command | Description |
|---------|-------------|
| `innodeploy login` | Authenticate and store JWT locally |
| `innodeploy projects list` | List all projects in current org |
| `innodeploy projects create <name>` | Create a new project in current org |
| `innodeploy deploy <project> [--env]` | Trigger deployment (default: production) |
| `innodeploy rollback <project> [--env]` | Roll back to previous version |
| `innodeploy pipeline trigger <project>` | Manually trigger a pipeline run |
| `innodeploy pipeline status <runId>` | Check pipeline run status |
| `innodeploy logs <project> [--env] [--follow]` | Stream or tail logs |
| `innodeploy status <project>` | Show service health and metrics summary |
| `innodeploy hosts list` | List registered hosts |
| `innodeploy hosts add` | Add a new host interactively |
| `innodeploy secrets set <project> <key> <value>` | Set a secret environment variable |
| `innodeploy init` | Scaffold a `.innodeploy.yml` template |

## Data Model (Sprint-1)

- **User** — platform users with roles
- **Organisation** — multi-tenant workspace grouping
