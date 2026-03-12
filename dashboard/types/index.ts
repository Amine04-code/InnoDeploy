/** Authenticated user returned from the API */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "developer" | "viewer";
}

/** Auth API response shape */
export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Project status values */
export type ProjectStatus = "running" | "stopped" | "failed";

/** Project returned from the API */
export interface Project {
  id: string;
  name: string;
  description?: string;
  repoUrl: string;
  branch: string;
  status: ProjectStatus;
  lastDeployAt: string | null;
  envCount: number;
  createdAt: string;
}

/** Payload for creating a new project */
export interface CreateProjectPayload {
  name: string;
  repoUrl: string;
  branch: string;
  envSetup?: string;
}

/** Deploy strategy */
export type DeployStrategy = "rolling" | "blue-green" | "canary" | "recreate";

/** Environment status */
export type EnvironmentStatus = "healthy" | "degraded" | "down";

/** Environment within a project */
export interface Environment {
  id: string;
  name: string;
  image: string;
  domain: string;
  replicas: number;
  strategy: DeployStrategy;
  status: EnvironmentStatus;
}

/** A single deployment record */
export interface Deployment {
  id: string;
  version: string;
  strategy: DeployStrategy;
  duration: string;
  triggeredBy: string;
  createdAt: string;
  status: "success" | "failed" | "in-progress";
}

/** Secret / env variable */
export interface Secret {
  id: string;
  key: string;
  /** Always masked on the client */
  value: string;
}

/** Metrics summary for an environment */
export interface EnvironmentMetrics {
  cpu: string;
  memory: string;
  latency: string;
  uptime: string;
}

/** Full project detail (extends Project) */
export interface ProjectDetail extends Project {
  environments: Environment[];
  deployments: Deployment[];
  secrets: Secret[];
  metrics: EnvironmentMetrics;
  pipelineConfig: string;
}

/** Generic API error */
export interface ApiError {
  message: string;
  errors?: string[];
}
