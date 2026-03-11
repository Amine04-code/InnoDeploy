# InnoDeploy — Project Structure & Documentation

## Overview

**InnoDeploy** is a DevOps SaaS platform currently in **Sprint 1**. It provides multi-tenant user authentication, organisation management, and a dashboard shell. Future sprints will add project management, CI/CD pipelines, and deployment automation.

---

## Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS      |
| **Backend**  | Node.js 20, Express.js 4, Mongoose 8                             |
| **Database** | MongoDB 7                                                        |
| **Cache**    | Redis 7 (refresh token storage)                                  |
| **Auth**     | JWT (access + refresh tokens), bcrypt password hashing            |
| **State**    | Zustand (client), localStorage (persistence)                     |
| **UI**       | Radix UI primitives, Lucide icons, class-variance-authority (CVA) |
| **Infra**    | Docker Compose (3 services on bridge network)                     |

---

## Repository Structure

```
InnoDeploy/
├── backend/                    # Express.js REST API
│   ├── Dockerfile              # Node 20 Alpine production image
│   ├── package.json
│   ├── .env.example            # Environment variable template
│   └── src/
│       ├── server.js           # Entry point — connects DB/Redis, starts Express
│       ├── app.js              # Express app setup, middleware, route mounting
│       ├── config/
│       │   ├── db.js           # MongoDB connection via Mongoose
│       │   └── redis.js        # Redis client creation & connection
│       ├── controllers/
│       │   └── authController.js   # Register, login, refresh, logout logic
│       ├── middleware/
│       │   ├── authMiddleware.js    # JWT verification & role-based access
│       │   └── errorMiddleware.js   # Global error handler (validation, duplicates)
│       ├── models/
│       │   ├── User.js         # User schema (bcrypt pre-save hook)
│       │   └── Organisation.js # Organisation schema (members, plans)
│       ├── routes/
│       │   ├── authRoutes.js   # /api/auth/* route definitions
│       │   └── projectRoutes.js# /api/projects/* stubs (Sprint 2)
│       ├── services/           # Service layer (empty — future use)
│       └── utils/
│           └── jwt.js          # Token generation & verification helpers
│
├── dashboard/                  # Next.js frontend (App Router)
│   ├── package.json
│   ├── .env.example            # Frontend env template
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── app/
│   │   ├── layout.tsx          # Root layout (QueryClientProvider, auth hydration)
│   │   ├── page.tsx            # Root page (redirects to /dashboard)
│   │   ├── globals.css         # Global Tailwind styles
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Protected dashboard with stats & welcome banner
│   │   ├── login/
│   │   │   └── page.tsx        # Login form
│   │   └── register/
│   │       └── page.tsx        # Registration form (with optional org)
│   ├── components/
│   │   ├── Navbar.tsx          # Top bar (user info, logout)
│   │   ├── Sidebar.tsx         # Left nav (Dashboard, Projects, Pipelines, etc.)
│   │   └── ui/                 # Reusable UI primitives (button, card, input, label)
│   ├── hooks/
│   │   └── useRequireAuth.ts   # Auth guard hook (redirects to /login if unauthenticated)
│   ├── lib/
│   │   ├── apiClient.ts        # Axios instance with interceptors (auth, token refresh)
│   │   └── utils.ts            # Utility helpers (cn for class merging)
│   ├── store/
│   │   └── authStore.ts        # Zustand auth state (user, tokens, hydrate/clear)
│   └── types/
│       └── index.ts            # TypeScript interfaces (User, AuthResponse, Project, ApiError)
│
├── docker/
│   └── docker-compose.yml      # 3-service stack (backend, MongoDB, Redis)
│
└── docs/
    ├── README.md               # Docs folder index
    ├── architecture.md         # System architecture & auth flow diagram
    └── PROJECT_STRUCTURE.md    # ← This file
```

---

## Data Models

### User

| Field          | Type     | Details                                         |
| -------------- | -------- | ----------------------------------------------- |
| `name`         | String   | Required, max 100 chars                         |
| `email`        | String   | Required, unique, lowercase, email regex        |
| `passwordHash` | String   | Required, excluded from queries (`select:false`) |
| `role`         | String   | `owner` / `admin` / `developer` / `viewer`      |
| `organisationId` | ObjectId | Ref to Organisation (nullable)               |
| `createdAt`    | Date     | Auto-generated                                  |
| `updatedAt`    | Date     | Auto-generated                                  |

- Passwords are hashed with **bcrypt** (12 salt rounds) via a Mongoose pre-save hook.
- Instance method `comparePassword(candidate)` verifies credentials.

### Organisation

| Field     | Type          | Details                                     |
| --------- | ------------- | ------------------------------------------- |
| `name`    | String        | Required, max 150 chars                     |
| `slug`    | String        | Required, unique, lowercase, URL-safe       |
| `plan`    | String        | `free` / `pro` / `enterprise`               |
| `members` | Array         | `[{ userId, role, joinedAt }]`              |
| `createdAt` | Date        | Auto-generated                              |
| `updatedAt` | Date        | Auto-generated                              |

---

## API Routes

| Method | Endpoint             | Auth     | Description                       |
| ------ | -------------------- | -------- | --------------------------------- |
| GET    | `/api/health`        | Public   | Health check (returns status, timestamp) |
| POST   | `/api/auth/register` | Public   | Create user (+ optional org)      |
| POST   | `/api/auth/login`    | Public   | Authenticate & receive tokens     |
| POST   | `/api/auth/refresh`  | Public   | Exchange refresh token for new pair |
| POST   | `/api/auth/logout`   | Bearer   | Revoke refresh token from Redis   |
| GET    | `/api/projects`      | Bearer   | List projects (stub — Sprint 2)   |
| POST   | `/api/projects`      | Bearer   | Create project (stub — Sprint 2)  |

---

## Authentication Flow

```
┌─────────────┐      POST /auth/login       ┌─────────────┐
│  Dashboard   │ ─────────────────────────► │  Backend API  │
│  (Next.js)   │                            │  (Express)    │
│              │ ◄───────────────────────── │               │
│              │   { accessToken (15m),     │               │
│  Zustand +   │     refreshToken (7d),     │  Redis        │
│  localStorage│     user }                 │  (stores      │
│              │                            │   refresh     │
│  Axios       │   Authorization:           │   tokens)     │
│  interceptor │   Bearer <accessToken>     │               │
│  attaches    │ ─────────────────────────► │  MongoDB      │
│  token to    │                            │  (stores      │
│  every req   │   On 401 → try refresh     │   users &     │
│              │ ─────────────────────────► │   orgs)       │
│              │                            │               │
│  On refresh  │   If refresh fails →       │               │
│  failure:    │   clear tokens, redirect   │               │
│  → /login    │   to /login                │               │
└─────────────┘                            └─────────────┘
```

1. User submits credentials via the login or register form.
2. Backend validates, creates JWT **access token** (15 min expiry) and **refresh token** (7 day expiry).
3. Refresh token is stored in **Redis** with key `refresh:<userId>` and a 7-day TTL.
4. Dashboard saves both tokens + user object in **localStorage** and **Zustand** store.
5. Axios request interceptor attaches `Authorization: Bearer <accessToken>` to every API call.
6. On a **401 response**, the response interceptor silently attempts token refresh via `/api/auth/refresh`.
7. If refresh succeeds, the original request is retried with the new token.
8. If refresh fails, tokens are cleared and the user is redirected to `/login`.
9. On **logout**, the backend deletes the refresh token from Redis, and the frontend clears local state.

---

## Middleware

### `authMiddleware`
Extracts the Bearer token from the `Authorization` header, verifies it using `verifyAccessToken()`, and attaches the decoded payload (`id`, `email`, `role`) to `req.user`. Returns **401** if the token is missing or invalid.

### `requireRole(...roles)`
Factory middleware that checks `req.user.role` against the provided allowed roles. Returns **403** if the user's role is not permitted.

### `errorMiddleware`
Global Express error handler:
- **Mongoose ValidationError** → 400 with field-level error messages
- **Duplicate key (code 11000)** → 409 with "already exists" message
- **All other errors** → 500 with generic message (stack trace logged in dev)

---

## Frontend Pages

| Route         | Component              | Auth     | Description                              |
| ------------- | ---------------------- | -------- | ---------------------------------------- |
| `/`           | `page.tsx`             | —        | Redirects to `/dashboard`                |
| `/login`      | `login/page.tsx`       | Public   | Email + password login form              |
| `/register`   | `register/page.tsx`    | Public   | Registration with optional org name      |
| `/dashboard`  | `dashboard/page.tsx`   | Protected| Welcome banner, stat cards, activity log |

### Key Components
- **Navbar** — Top bar with user name, role badge, and logout button.
- **Sidebar** — Left navigation with links: Dashboard, Projects, Pipelines, Deployments, Settings. Shows app version in footer.
- **UI primitives** (`components/ui/`) — Reusable `Button`, `Card`, `Input`, `Label` built on Radix UI + CVA.

---

## Docker Setup

Three services on a shared `innodeploy-net` bridge network:

| Service    | Image          | Port  | Persistent Volume     |
| ---------- | -------------- | ----- | --------------------- |
| `backend`  | Custom (Node 20 Alpine) | 5000 | —              |
| `mongodb`  | `mongo:7`      | 27017 | `mongo-data:/data/db` |
| `redis`    | `redis:7`      | 6379  | `redis-data:/data`    |

### Running with Docker

```bash
cd docker
docker compose up -d        # Start all services
docker compose logs -f       # Follow logs
docker compose down          # Stop and remove containers
```

### Running Locally (development)

```bash
# 1. Start only databases via Docker
cd docker
docker compose up -d mongodb redis

# 2. Backend
cd backend
cp .env.example .env         # Ensure MONGO_URI and REDIS_URL point to localhost
npm install
npm run dev                  # Starts on http://localhost:5000

# 3. Dashboard
cd dashboard
cp .env.example .env
npm install
npm run dev                  # Starts on http://localhost:3000
```

---

## Environment Variables

### Backend (`.env`)

| Variable             | Default                                | Description                  |
| -------------------- | -------------------------------------- | ---------------------------- |
| `PORT`               | `5000`                                 | Express server port          |
| `MONGO_URI`          | `mongodb://localhost:27017/innodeploy`  | MongoDB connection string    |
| `REDIS_URL`          | `redis://localhost:6379`                | Redis connection string      |
| `JWT_SECRET`         | —                                      | Access token signing secret  |
| `JWT_REFRESH_SECRET` | —                                      | Refresh token signing secret |
| `CLIENT_URL`         | `http://localhost:3000`                 | Allowed CORS origin          |

### Dashboard (`.env`)

| Variable               | Default                        | Description           |
| ---------------------- | ------------------------------ | --------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:5000/api`    | Backend API base URL  |

> **Note:** When running the backend inside Docker, use Docker service names (`mongodb`, `redis`) instead of `localhost` in `MONGO_URI` and `REDIS_URL`.

---

## Sprint Roadmap

- **Sprint 1** (current) — Authentication, user/org management, dashboard shell
- **Sprint 2** — Project CRUD, Git repository integration
- **Sprint 3** — CI/CD pipeline configuration & execution
- **Sprint 4** — Deployment automation & monitoring
