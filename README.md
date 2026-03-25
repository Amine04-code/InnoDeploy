# InnoDeploy — DevOps SaaS .

```
innodeploy/
├── backend/        # Express.js REST API
├── dashboard/      # Next.js 14 (App Router) front-end
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

## 1 — Start Infrastructure (MongoDB + Redis)

```bash
cd docker
docker compose up -d
```

This starts:

- **MongoDB** on `localhost:27017`
- **Redis** on `localhost:6379`

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

The API will be available at **http://localhost:5000**.

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

| Service  | Image    | Port  |
|----------|----------|-------|
| mongodb  | mongo:7  | 27017 |
| redis    | redis:7  | 6379  |
| backend  | custom   | 5000  |

---

## License

MIT
