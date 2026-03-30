# InnoDeploy — DevOps SaaS .

```
innodeploy/
├── backend/        # Express.js REST API
├── dashboard/      # Next.js 14 (App Router) front-end
├── cli/            # InnoDeploy command-line client
├── docker/         # Docker Compose for local services
└── docs/           # Architecture & planning docs
```

---

## Prerequisites

| Tool       | Version |
|------------|---------|
| Node.js    | ≥ 20    |
| npm        | ≥ 10    |
| Docker     | ≥ 24    |
| Docker Compose | ≥ 2 |

---

## 1 — Start Infrastructure (Traefik + Backend + MongoDB + Redis)

```bash
cd docker
cp .env.example .env
docker compose up -d
```

This starts:

- **Traefik reverse proxy** on `localhost:80` and `localhost:443`
- **Backend API** routed by Traefik (default host: `api.localhost`)
- **WebSocket gateway** routed by Traefik (default host: `ws.localhost`)
- **Pipeline runner** worker service
- **Deploy worker** service
- **MongoDB** on `localhost:27018`
- **Redis** on `localhost:6379`
- **MinIO object store** on `localhost:9000` (console on `localhost:9001`)

For local DNS on Windows, add this to your hosts file:

```text
127.0.0.1 api.localhost
127.0.0.1 ws.localhost
```

---

## 2 — Run the Backend API

```bash
cd backend

# Install dependencies
npm install

# Copy the example env file (edit secrets for production)
cp .env.example .env

# Start in development mode (auto-reload)
npm run dev
```

The API will be available via Traefik at **https://api.localhost**.

### API Endpoints (Sprint-1)

| Method | Path                  | Auth     | Description          |
|--------|-----------------------|----------|----------------------|
| POST   | `/api/auth/register`  | Public   | Create account       |
| POST   | `/api/auth/login`     | Public   | Sign in              |
| POST   | `/api/auth/refresh`   | Public   | Refresh JWT pair     |
| POST   | `/api/auth/logout`    | Bearer   | Revoke refresh token |
| GET    | `/api/projects`       | Bearer   | List projects (stub) |
| POST   | `/api/projects`       | Bearer   | Create project (stub)|
| GET    | `/api/health`         | Public   | Health check         |

---

## 3 — Run the Dashboard

```bash
cd dashboard

# Install dependencies
npm install

# Start dev server
npm run dev
```

The dashboard will be available at **http://localhost:3000**.

---

## 4 — CLI Tool (`innodeploy-cli`)

### Overview

`innodeploy-cli` is the command-line tool for InnoDeploy API.
It lets developers manage projects, trigger pipelines, stream logs, and run deployments without leaving the terminal.

### Installation

```bash
# Option A: install from npm (published package)
npm install -g @innoorb/innodeploy-cli

# Option B: install from this repository
# cd cli && npm install && npm link

innodeploy login
```

`innodeploy login` prompts for email and password, then stores a JWT locally.

### Command Reference

| Command | Description |
|---------|-------------|
| `innodeploy login` | Authenticate and store JWT locally |
| `innodeploy projects list` | List all projects in current org |
| `innodeploy projects create <name>` | Create a new project in current org |
| `innodeploy deploy <project> [--env]` | Trigger deployment (default env: production) |
| `innodeploy rollback <project> [--env]` | Roll back to previous version |
| `innodeploy pipeline trigger <project>` | Manually trigger a pipeline run |
| `innodeploy pipeline status <runId>` | Check pipeline run status |
| `innodeploy logs <project> [--env] [--follow]` | Stream or tail logs |
| `innodeploy status <project>` | Show service health + metrics summary |
| `innodeploy hosts list` | List registered hosts |
| `innodeploy hosts add` | Add a new host interactively |
| `innodeploy secrets set <project> <key> <value>` | Set a secret env var |
| `innodeploy init` | Scaffold a `.innodeploy.yml` template |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable            | Description                          | Default                              |
|---------------------|--------------------------------------|--------------------------------------|
| `PORT`              | API server port                      | `5000`                               |
| `MONGO_URI`         | MongoDB connection string            | `mongodb://localhost:27017/innodeploy`|
| `REDIS_URL`         | Redis connection string              | `redis://localhost:6379`             |
| `JWT_SECRET`        | Access token signing secret          | —                                    |
| `JWT_REFRESH_SECRET`| Refresh token signing secret         | —                                    |
| `CLIENT_URL`        | Allowed CORS origin                  | `http://localhost:3000`              |

### Docker Compose (`docker/.env`)

| Variable                       | Description                                             | Default |
|--------------------------------|---------------------------------------------------------|---------|
| `TRAEFIK_ACME_EMAIL`           | Email used by Let's Encrypt ACME                        | `admin@example.com` |
| `TRAEFIK_API_HOST`             | Hostname routed to backend API                          | `api.localhost` |
| `TRAEFIK_DASHBOARD_ENABLED`    | Enables Traefik dashboard                               | `false` |
| `TRAEFIK_RATE_LIMIT_AVERAGE`   | Average requests per second for rate-limit middleware   | `120` |
| `TRAEFIK_RATE_LIMIT_BURST`     | Burst requests for rate-limit middleware                | `60` |
| `TRAEFIK_IP_ALLOWLIST`         | CIDR list allowed through proxy                         | `0.0.0.0/0,::/0` |
| `TRAEFIK_STAGING_BASIC_AUTH_USERS` | Basic auth users (`user:htpasswd_hash`) for staging | empty |
| `TRAEFIK_ENABLE_STAGING_AUTH`  | Adds basic auth middleware when non-empty               | empty |

### Dashboard (`dashboard/.env.local`)

| Variable              | Description        | Default                        |
|-----------------------|--------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base   | `http://localhost:5000/api`    |

---

## Tech Stack

### Backend
- Node.js 20, Express.js, MongoDB (Mongoose), Redis, JWT, bcrypt

### Dashboard
- Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn UI, Axios, Zustand, TanStack Query

---

## Docker Services

Defined in `docker/docker-compose.yml`:

| Service         | Image      | Port(s) |
|-----------------|------------|---------|
| traefik         | traefik:v3 | 80, 443 |
| backend         | custom     | internal via Traefik |
| websocket       | custom     | internal via Traefik |
| pipeline-runner | custom     | internal |
| deploy-worker   | custom     | internal |
| mongodb         | mongo:7    | 27018   |
| redis           | redis:7    | 6379    |
| minio           | minio      | 9000, 9001 |

## Worker Behavior

### Pipeline Runner
- BullMQ worker that dequeues jobs from Redis queue `pipeline-jobs`
- Each stage runs in an isolated Docker container
- Source code is cloned from the job `repoUrl` + `branch` before each stage command
- Stage logs are streamed in real time via Redis pub/sub channels:
	- `pipeline:logs`
	- `pipeline:logs:<pipelineId>`
- WebSocket gateway forwards these channels to connected dashboard clients

### Deploy Worker
- BullMQ worker that dequeues jobs from Redis queue `deploy-jobs`
- Supports deployment strategies:
	- Rolling: replaces replicas one by one with health-check gate between each replacement
	- Blue-Green: spins up green stack, switches route event, then drains old stack after configured delay
	- Canary: routes configured canary traffic share, evaluates error-rate window, then promotes or fails
- Emits deployment lifecycle and route-switch events through Redis channels:
	- `deploy:events`
	- `traefik:route-events`

---

## License

MIT
