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
  setupMode: 'automatic' | 'manual';
  pipelineConfig: string;
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  createdAt: string;
}

/** Payload for creating a new project */
export interface CreateProjectPayload {
  name: string;
  repoUrl: string;
  branch: string;
  envSetup?: string;
  setupMode?: 'automatic' | 'manual';
  pipelineConfig?: string;
  installCommand?: string;
  buildCommand?: string;
  startCommand?: string;
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

// ─── Pipeline types ────────────────────────────────────────────────────────────

export type PipelineRunStatus = "queued" | "running" | "success" | "failed";
export type PipelineTriggerType = "manual" | "push" | "schedule" | "api";
export type StageStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface PipelineStage {
  id: string;
  name: string;
  status: StageStatus;
  duration: string | null;
  logs: string[];
}

export interface PipelineRun {
  id: string;
  branch: string;
  commit: string;
  commitMsg: string;
  status: PipelineRunStatus;
  duration: string | null;
  triggeredBy: string;
  triggerType: PipelineTriggerType;
  createdAt: string;
  stages: PipelineStage[];
}

// ─── Monitoring types ──────────────────────────────────────────────────────────

export type MonitoringTimeRange = "1h" | "6h" | "24h" | "7d" | "30d" | "custom";
export type ServiceStatus = "healthy" | "degraded" | "down";
export type AlertSeverity = "critical" | "warning" | "info";

export interface AlertHistoryEntry {
  id: string;
  severity: AlertSeverity;
  message: string;
  triggeredAt: string;
  resolved: boolean;
  resolvedAt: string | null;
}

// ─── Logs types ────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  container: string;
  message: string;
}

// ─── Hosts and alerts types ───────────────────────────────────────────────────

export type HostStatus = "online" | "offline";
export type ConnectionTestStatus = "idle" | "running" | "success" | "failed";
export type AlertRuleType = "cpu" | "memory" | "latency" | "availability" | "deployment" | "disk" | "certificate";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface HostDeployedContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped";
}

export interface Host {
  id: string;
  hostname: string;
  ip: string;
  status: HostStatus;
  cpu: number;
  memory: number;
  disk: number;
  sshUser: string;
  os: string;
  dockerVersion: string;
  activeDeployments: number;
  containers: HostDeployedContainer[];
}

export interface HostFormData {
  hostname: string;
  ip: string;
  sshUser: string;
  sshPrivateKeyName: string;
}

export interface ProjectAlert {
  id: string;
  severity: Exclude<AlertSeverity, "info"> | "info";
  project: string;
  ruleType: AlertRuleType;
  message: string;
  timestamp: string;
  status: AlertStatus;
  metricAtTrigger: { label: string; value: number; unit: string }[];
}

export interface AlertRuleConfig {
  cpuThreshold: number;
  memoryThreshold: number;
  latencyThreshold: number;
  availabilityThreshold: number;
  serviceDownFailures: number;
  diskThreshold: number;
  certExpiryDays: number;
  emailNotifications: boolean;
  slackNotifications: boolean;
 }

// ─── Settings types ───────────────────────────────────────────────────────────

export type MemberRole = "owner" | "admin" | "developer" | "viewer";
export type ThemePreference = "light" | "dark" | "system";
export type LanguagePreference = "english" | "french" | "arabic";
export type GitProviderOption = "github" | "gitlab" | "bitbucket" | "none";

export interface OrganisationBillingInfo {
  contactEmail: string;
  companyAddress: string;
  taxId: string;
}

export interface OrganisationSettingsProfile {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  billingInfo: OrganisationBillingInfo;
}

export interface OrganisationMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

export interface OrganisationInvitation {
  id: string;
  email: string;
  role: MemberRole;
  status: "pending" | "accepted" | "revoked";
  invitedAt: string;
}

export interface NotificationChannelsConfig {
  emailEnabled: boolean;
  slackEnabled: boolean;
  discordEnabled: boolean;
  expoEnabled: boolean;
  webhookEnabled: boolean;
  slackWebhook: string;
  discordWebhook: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromEmail: string;
  emailRecipients: string[];
  expoAccessToken: string;
  expoPushTokens: string[];
  webhookUrl: string;
  webhookHeaders: Record<string, string>;
}

export interface DockerRegistrySettings {
  registryUrl: string;
  username: string;
  password: string;
  namespace: string;
}

export interface GitProviderSettings {
  provider: GitProviderOption;
  installationUrl: string;
  webhookSecret: string;
  repositoryOwner: string;
}

export interface OrganisationApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface UserSettingsPreferences {
  theme: ThemePreference;
  language: LanguagePreference;
}

export interface SettingsPayload {
  organisation: OrganisationSettingsProfile;
  members: OrganisationMember[];
  invitations: OrganisationInvitation[];
  notificationChannels: NotificationChannelsConfig;
  dockerRegistry: DockerRegistrySettings;
  gitProvider: GitProviderSettings;
  apiKeys: OrganisationApiKey[];
  preferences: UserSettingsPreferences;
}

// ─── Admin dashboard types ───────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  isActive: boolean;
  deactivatedAt: string | null;
  deactivatedReason: string;
  organisation: { id: string; name: string; slug: string } | null;
  createdAt: string;
}

export interface AdminTrendPoint {
  date: string;
  count: number;
}

export interface AdminOverviewStats {
  users: number;
  newUsers: number;
  projects: number;
  pipelines: number;
  hosts: number;
  alerts: number;
  logs: number;
  openAlerts: number;
  runningPipelines: number;
  onlineHosts: number;
  recentWindowDays: number;
}

export interface AdminOverviewPayload {
  stats: AdminOverviewStats;
  trends: {
    users: AdminTrendPoint[];
    pipelines: AdminTrendPoint[];
    alerts: AdminTrendPoint[];
  };
  recent: {
    users: AdminUser[];
    projects: Array<{ id: string; name: string; status: string; branch: string; createdAt: string }>;
    pipelines: Array<{ id: string; projectId: string; status: string; branch: string; triggeredBy: string; createdAt: string }>;
    hosts: Array<{ id: string; hostname: string; ip: string; status: string; createdAt: string }>;
    alerts: Array<{ id: string; severity: string; status: string; message: string; createdAt: string }>;
    logs: Array<{ id: string; level: string; message: string; source: string; createdAt: string }>;
  };
}

export interface AdminUsersPayload {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
