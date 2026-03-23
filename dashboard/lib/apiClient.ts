import axios from "axios";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Axios instance with base URL from env ─────────────────
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT token ─────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: handle 401 errors ───────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ── API helpers ───────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string, organisationName?: string) =>
    apiClient.post("/auth/register", { name, email, password, organisationName }),

  logout: () => apiClient.post("/auth/logout"),
};

export const projectApi = {
  getProjects: () => apiClient.get("/projects"),

  createProject: (payload: {
    name: string;
    repoUrl: string;
    branch: string;
    envSetup?: string;
  }) => apiClient.post("/projects", payload),
};

export const hostApi = {
  getHosts: () => apiClient.get("/hosts"),

  testDraftConnection: (payload: {
    ip: string;
    sshUser: string;
    sshPrivateKeyName: string;
  }) => apiClient.post("/hosts/test-connection", payload),

  createHost: (payload: {
    hostname: string;
    ip: string;
    sshUser: string;
    sshPrivateKeyName: string;
  }) => apiClient.post("/hosts", payload),

  testConnection: (hostId: string) => apiClient.post(`/hosts/${hostId}/test-connection`),

  removeHost: (hostId: string) => apiClient.delete(`/hosts/${hostId}`),
};

export const pipelineApi = {
  triggerRun: (projectId: string, payload: { branch: string; config?: string }) =>
    apiClient.post(`/projects/${projectId}/pipelines`, payload),

  listProjectRuns: (projectId: string) => apiClient.get(`/projects/${projectId}/pipelines`),

  getRun: (runId: string) => apiClient.get(`/pipelines/${runId}`),

  cancelRun: (runId: string) => apiClient.post(`/pipelines/${runId}/cancel`),

  getStageLog: (runId: string, stageName: string) => apiClient.get(`/pipelines/${runId}/logs/${stageName}`),
};

export const alertApi = {
  getAlerts: () => apiClient.get("/alerts"),

  acknowledgeAlert: (alertId: string) => apiClient.patch(`/alerts/${alertId}/acknowledge`),

  getRules: () => apiClient.get("/alerts/rules/config"),

  updateRules: (payload: {
    cpuThreshold: number;
    memoryThreshold: number;
    latencyThreshold: number;
    availabilityThreshold: number;
    serviceDownFailures?: number;
    diskThreshold?: number;
    certExpiryDays?: number;
    emailNotifications: boolean;
    slackNotifications: boolean;
  }) => apiClient.put("/alerts/rules/config", payload),

  testNotification: () => apiClient.post("/alerts/rules/test-notification"),
};

export const settingsApi = {
  getSettings: () => apiClient.get("/settings"),

  updateOrganisation: (payload: {
    name: string;
    slug: string;
    billingInfo: {
      contactEmail: string;
      companyAddress: string;
      taxId: string;
    };
  }) => apiClient.put("/settings/organisation", payload),

  inviteMember: (payload: { email: string; role: string }) =>
    apiClient.post("/settings/members/invite", payload),

  updateMemberRole: (memberId: string, payload: { role: string }) =>
    apiClient.patch(`/settings/members/${memberId}/role`, payload),

  removeMember: (memberId: string) => apiClient.delete(`/settings/members/${memberId}`),

  revokeInvitation: (invitationId: string) => apiClient.delete(`/settings/invitations/${invitationId}`),

  updateNotifications: (payload: {
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
  }) => apiClient.put("/settings/notifications", payload),

  testNotifications: (payload: {
    channels?: string[];
    severity?: "info" | "warning" | "critical";
    title?: string;
    message?: string;
    serviceName?: string;
  }) => apiClient.post("/settings/notifications/test", payload),

  updateDockerRegistry: (payload: {
    registryUrl: string;
    username: string;
    password: string;
    namespace: string;
  }) => apiClient.put("/settings/docker-registry", payload),

  updateGitProvider: (payload: {
    provider: string;
    installationUrl: string;
    webhookSecret: string;
    repositoryOwner: string;
  }) => apiClient.put("/settings/git-provider", payload),

  updatePreferences: (payload: { theme: string; language: string }) =>
    apiClient.put("/settings/preferences", payload),

  createApiKey: (payload: { name: string }) => apiClient.post("/settings/api-keys", payload),

  revokeApiKey: (apiKeyId: string) => apiClient.delete(`/settings/api-keys/${apiKeyId}`),

  deleteOrganisation: (payload: { confirmation: string }) =>
    apiClient.delete("/settings/organisation", { data: payload }),
};

export default apiClient;
