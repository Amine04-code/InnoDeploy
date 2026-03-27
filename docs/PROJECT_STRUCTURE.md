# InnoDeploy - Project Structure and Full System Guide

## A. What InnoDeploy Is

InnoDeploy is a multi-tenant DevOps SaaS platform with three user-facing surfaces:

- Web dashboard for teams and operators
- REST API and background workers for orchestration
- CLI for terminal-based workflows

It covers authentication, organization/project management, CI/CD pipelines, deployment automation, monitoring, alerting, logs, and notification dispatch.

---

## B. Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js 20, Express.js 4, Mongoose 8 |
| Data | MongoDB 7 |
| Cache and Queue | Redis 7, BullMQ-style worker queues |
| Auth | JWT (access + refresh), bcrypt |
| Realtime | WebSocket gateway + Redis pub/sub |
| Object Storage | MinIO |
| Infra and Routing | Docker Compose + Traefik |
| Client State | Zustand, localStorage, API query state |

---

## C. Repository Structure

```text
InnoDeploy/
|- backend/                       # Express API, workers, services, data models
|  |- Dockerfile
|  |- package.json
|  |- src/
|  |  |- app.js                   # Express middleware + route mounting
|  |  |- server.js                # Startup: DB/Redis connections + HTTP server
|  |  |- config/
|  |  |  |- db.js                 # MongoDB connection
|  |  |  |- redis.js              # Redis client connection
|  |  |- controllers/             # Route handlers by domain
|  |  |- middleware/              # Auth + role checks + global error handling
|  |  |- models/                  # MongoDB schemas (User, Org, Project, etc.)
|  |  |- routes/                  # API endpoint groups
|  |  |- services/                # Pipeline runner, deploy worker logic, logs, alerts
|  |  |- utils/                   # JWT helpers and utility functions
|  |  |- workers/                 # Worker entrypoints (pipeline, deploy)
|
|- dashboard/                     # Next.js dashboard app
|  |- app/                        # App Router pages and layouts
|  |- components/                 # Feature components + shared shell + UI primitives
|  |- hooks/                      # Auth and preference hooks
|  |- lib/                        # API client, settings i18n, preferences helpers
|  |- store/                      # Zustand stores
|  |- types/                      # Shared TypeScript interfaces
|
|- cli/                           # innodeploy command-line tool
|  |- bin/innodeploy.js           # CLI entrypoint
|  |- src/config.js               # Local auth/config persistence
|  |- src/prompts.js              # Interactive terminal prompts
|
|- docker/
|  |- docker-compose.yml          # Traefik + app services + MongoDB + Redis + MinIO
|
|- docs/
|  |- README.md
|  |- architecture.md
|  |- PROJECT_STRUCTURE.md        # This file
|
|- InnoDeploy-Postman-Collection.json
|- POSTMAN_TESTING_GUIDE.md
```

---

## D. Platform Components and Responsibilities

### 1. Dashboard (Next.js)

The dashboard is the primary UI for users. It includes:

- Auth flows (login, register, callback)
- Protected dashboard pages (overview, projects, pipelines, deployments, hosts, alerts, settings)
- Realtime logs and monitoring views
- User preferences (theme/language) and translated settings runtime

Key implementation points:

- `useRequireAuth()` prevents unauthorized access to protected pages
- `apiClient.ts` injects access tokens and performs refresh/retry logic on 401
- Auth and user state are hydrated from local storage via Zustand

### 2. Backend API (Express)

The backend exposes domain APIs and coordinates async workflows:

- Authentication and token lifecycle
- Organization, project, host, pipeline, monitoring, alerts, settings, webhook endpoints
- Queueing of long-running jobs (pipeline and deployment)
- Publication of realtime events and logs

### 3. Worker Layer

Workers consume queue jobs and execute long-running operations outside request-response paths:

- Pipeline runner worker
- Deploy worker
- Monitor worker

This keeps API responses fast and fault boundaries clearer.

### 4. CLI (innodeploy)

CLI enables terminal-first operations:

- Authentication
- Project commands
- Pipeline trigger/status
- Deploy/rollback
- Logs and host utilities

---

## E. Data and Domain Models

Core model families in backend `models/`:

- Identity and tenancy: `User`, `Organisation`
- Delivery domain: `Project`, `Pipeline`, `Host`
- Observability: `Metric`, `Log`, `Alert`

Representative model behavior:

- `User` passwords are hashed with bcrypt before save
- User roles support authorization boundaries (`owner`, `admin`, `developer`, `viewer`)
- `Organisation` groups users and roles per tenant workspace
- `Log` entries are retained with TTL behavior
- `Metric` stores detailed host/service stats in addition to compatibility fields

---

## F. Authentication and Authorization Flow

1. User signs in or registers via dashboard or CLI.
2. Backend validates credentials and issues:
   - access token (short-lived)
   - refresh token (longer-lived)
3. Refresh token is stored in Redis (keyed by user context).
4. Client sends `Authorization: Bearer <accessToken>` for protected routes.
5. On token expiry (`401`), client attempts `/api/auth/refresh`.
6. If refresh succeeds, original request is retried.
7. If refresh fails, local auth is cleared and user returns to login.
8. Logout revokes refresh token in Redis and clears client auth state.

Authorization middleware:

- `authMiddleware`: verifies access token and injects user payload on request
- `requireRole(...roles)`: enforces role-based access control

---

## G. API Surface (High-Level)

Main route groups under `/api` include:

- `/auth` for register/login/refresh/logout
- `/org` for organization management
- `/projects` for project operations
- `/pipelines` for pipeline CRUD and execution triggers
- `/deployments` and worker-driven deployment flows (through project/pipeline operations)
- `/hosts` for registered runtime hosts
- `/monitoring` for health and metrics access
- `/alerts` for alert listing and management
- `/settings` for runtime settings and notification configuration
- `/webhooks` for incoming external event triggers
- `/health` for service health endpoint

See route files in backend `src/routes/` for exact endpoints.

---

## H. Queue and Worker Execution Model

### Pipeline path

1. API receives trigger request.
2. Pipeline config is resolved (including `.innodeploy.yml` handling).
3. Job is enqueued to Redis-backed queue.
4. Pipeline worker executes stages, captures output, and streams log events.
5. On successful stage completion, deployment jobs may be enqueued.

### Deployment path

Deploy worker supports strategy-specific rollout behavior:

- Rolling: incrementally replace replicas with health checks
- Blue/Green: bring up green stack, route switch, then drain old stack
- Canary: partial traffic shift, evaluate error window, then promote/abort

Workers emit lifecycle events for dashboards and external consumers.

---

## I. Monitoring, Alerting, and Notifications

### Monitoring

Monitor worker collects service and host health data with multiple probe modes:

- HTTP probe
- TCP probe
- container-state fallback

State transitions are failure-count based and configurable by env vars.

### Metrics

Detailed metrics include:

- `cpu_percent`
- `memory_mb`
- `memory_percent`
- `net_rx_bytes`
- `net_tx_bytes`
- `http_status`
- `http_latency_ms`
- `restart_count`
- `uptime_s`
- `disk_usage_mb`

Legacy fields remain populated for compatibility.

### Alerting

Alert rules engine evaluates predefined and runtime rules (examples include CPU, memory, service down, latency, disk, certificate expiry).

### Notification channels

Notification dispatcher supports:

- SMTP email (Nodemailer)
- Slack webhook
- Discord webhook
- Expo push
- generic webhook POST

Settings API masks sensitive secrets in responses and preserves existing secrets when masked placeholders are submitted unchanged.

---

## J. Logs and Realtime Streaming

Log collector parses stdout/stderr (JSON-aware), persists normalized records, and publishes realtime channels.

WebSocket gateway subscribes to Redis pub/sub and forwards relevant streams to connected dashboard clients.

Typical realtime domains include:

- pipeline logs
- deployment events
- aggregated project logs
- route-switch and lifecycle events

---

## K. Infrastructure and Runtime Topology

Compose environment includes:

- Traefik reverse proxy
- Backend API service
- WebSocket gateway service
- Pipeline runner service
- Deploy worker service
- MongoDB
- Redis
- MinIO object storage

Traefik routes hostnames such as API and WebSocket endpoints in local/dev setups.

---

## L. Environment Configuration

### Backend env

Important variables:

- `PORT`
- `MONGO_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`

### Dashboard env

- `NEXT_PUBLIC_API_URL`

### Infra env (compose/proxy)

Proxy and security behavior are controlled by compose env vars (Traefik hostnames, optional staging auth, rate limits, allowlists, ACME settings).

---

## M. Error Handling and Reliability Practices

Global error middleware normalizes API failures:

- Validation failures return 400 with field details
- Duplicate keys return 409 conflict semantics
- Unexpected errors return 500 with safe payloads

Other reliability mechanisms:

- Queue-based async processing for long tasks
- Refresh-token revocation on logout
- Health endpoints and monitor-worker state transitions
- Realtime observability via logs and events

---

## N. Development Workflow

### Typical local run

1. Start infra dependencies via compose.
2. Start backend (`npm run dev`).
3. Start dashboard (`npm run dev`).
4. Use Postman collection or CLI for API/flow validation.

Reference files:

- `InnoDeploy-Postman-Collection.json`
- `POSTMAN_TESTING_GUIDE.md`

---

## O. Current Status and Roadmap

Current branch state includes advanced monitoring and alerting capabilities on top of core authentication and dashboard foundations.

Roadmap progression:

- Sprint 1: auth, user/org management, dashboard shell
- Sprint 2: project CRUD and repository integration
- Sprint 3: pipeline config and execution workflows
- Sprint 4: deployment automation and monitoring/alerting hardening

---

## Quick Orientation for New Contributors

Start here if you are onboarding:

1. Read `docs/architecture.md` for system context.
2. Read backend route files to see API entry points.
3. Trace one full flow:
   - dashboard action -> API controller -> service -> queue -> worker -> websocket/log output.
4. Use Postman collection to validate endpoints.
5. Use CLI commands to test non-UI operational paths.

This project is designed as a real control-plane style architecture, with clear separation between synchronous APIs, asynchronous execution, and realtime observability.
