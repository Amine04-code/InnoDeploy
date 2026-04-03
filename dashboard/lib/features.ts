import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  Clock,
  Eye,
  GitBranch,
  Globe,
  Layers,
  Lock,
  Shield,
  Terminal,
} from "lucide-react";

export type FeatureData = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  highlights: { title: string; text: string }[];
  useCases: string[];
};

export const features: FeatureData[] = [
  {
    slug: "git-push-to-deploy",
    title: "Git Push to Deploy",
    tagline: "Ship on every push — zero configuration required.",
    description:
      "Connect your GitHub, GitLab, or Bitbucket repository and InnoDeploy automatically builds, tests, and deploys your application on every push to the configured branch. No CI/CD scripts to write, no YAML to maintain.",
    icon: GitBranch,
    gradient: "from-emerald-500/20 to-cyan-500/10",
    iconColor: "text-emerald-400",
    highlights: [
      { title: "Auto-detect Frameworks", text: "We detect Next.js, Nuxt, Remix, Astro, Express, and more — then configure the optimal build pipeline automatically." },
      { title: "Branch Deploys", text: "Deploy production from main, staging from develop, and any branch you choose. Each gets its own isolated environment." },
      { title: "Build Caching", text: "Incremental builds with layer caching cut build times by up to 80% after the first deploy." },
      { title: "Webhook Triggers", text: "Trigger deploys from external CI tools, Slack commands, or custom webhook integrations." },
    ],
    useCases: [
      "Teams shipping multiple times per day",
      "Solo developers who want zero-ops deployments",
      "Monorepo setups with selective builds",
    ],
  },
  {
    slug: "preview-deployments",
    title: "Preview Deployments",
    tagline: "Every pull request gets its own live URL.",
    description:
      "Preview deployments give every pull request a unique, shareable URL so your team can review changes in production-like conditions before merging. QA, designers, and PMs can test without touching a terminal.",
    icon: Eye,
    gradient: "from-violet-500/20 to-indigo-500/10",
    iconColor: "text-violet-400",
    highlights: [
      { title: "Unique URLs", text: "Each PR gets a persistent URL like preview-abc123.innodeploy.app that updates on every new commit." },
      { title: "GitHub Checks", text: "Build status, deploy URL, and lighthouse scores are posted directly as GitHub check annotations." },
      { title: "Password Protection", text: "Optionally protect preview URLs with a shared password for sensitive projects." },
      { title: "Auto-cleanup", text: "Preview environments are automatically deleted when the PR is merged or closed." },
    ],
    useCases: [
      "Design reviews with non-technical stakeholders",
      "QA testing before merge",
      "Client demos on feature branches",
    ],
  },
  {
    slug: "instant-rollbacks",
    title: "Instant Rollbacks",
    tagline: "Revert to any previous deployment in one click.",
    description:
      "Every deployment is an immutable snapshot. If something breaks in production, roll back to any previous healthy version instantly — no rebuild required, no downtime introduced.",
    icon: Clock,
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    highlights: [
      { title: "Immutable Deploys", text: "Each deployment is a frozen artifact. Rollbacks swap traffic to the previous artifact, not a rebuild." },
      { title: "One-click Restore", text: "Open the deployment history, select a version, and click Rollback. Traffic switches in under 2 seconds." },
      { title: "Automatic Rollback", text: "Configure health-check thresholds — if a new deploy fails checks, the platform rolls back automatically." },
      { title: "Audit Trail", text: "Every rollback is logged with who triggered it, when, and which version was restored." },
    ],
    useCases: [
      "Emergency production hotfixes",
      "Failed migrations that need immediate revert",
      "Comparing performance between two versions",
    ],
  },
  {
    slug: "auto-scaling",
    title: "Auto-Scaling",
    tagline: "Containers scale horizontally based on real-time traffic.",
    description:
      "InnoDeploy automatically scales your application containers up and down based on CPU utilization, memory pressure, and request concurrency. Pay only for what you use, handle traffic spikes without manual intervention.",
    icon: Layers,
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-400",
    highlights: [
      { title: "Horizontal Pod Autoscaler", text: "Scale from 1 to 100+ replicas based on configurable metrics — CPU, memory, or custom request-based triggers." },
      { title: "Scale to Zero", text: "Idle services scale to zero containers, eliminating costs during off-peak hours." },
      { title: "Warm Standby", text: "Keep a minimum number of warm instances to guarantee sub-100ms cold-start latency." },
      { title: "Predictive Scaling", text: "ML-based traffic prediction pre-scales containers before anticipated spikes." },
    ],
    useCases: [
      "E-commerce sites with flash-sale traffic bursts",
      "SaaS apps with variable daily usage patterns",
      "APIs that need guaranteed low latency at any load",
    ],
  },
  {
    slug: "edge-network",
    title: "Edge Network",
    tagline: "Deploy to 50+ global regions for sub-200ms latency.",
    description:
      "InnoDeploy's global edge network places your application and static assets closer to your users. Requests are routed to the nearest edge POP, reducing round-trip latency and improving Time to First Byte worldwide.",
    icon: Globe,
    gradient: "from-sky-500/20 to-teal-500/10",
    iconColor: "text-sky-400",
    highlights: [
      { title: "50+ Edge Regions", text: "Built on top of AWS, GCP, and Azure edge locations spanning North America, Europe, Asia-Pacific, and South America." },
      { title: "Smart Routing", text: "Anycast DNS + geo-aware load balancing routes each request to the healthiest, closest origin." },
      { title: "CDN & Caching", text: "Static assets are cached at the edge with configurable TTL and instant cache purge via API or dashboard." },
      { title: "Edge Functions", text: "Run middleware logic at the edge for authentication, A/B testing, or geo-redirects with < 5ms overhead." },
    ],
    useCases: [
      "Global SaaS apps serving users across continents",
      "Media-heavy sites that need fast asset delivery",
      "Latency-sensitive APIs for mobile apps",
    ],
  },
  {
    slug: "real-time-monitoring",
    title: "Real-time Monitoring",
    tagline: "Live CPU, memory, bandwidth dashboards and intelligent alerts.",
    description:
      "Monitor every aspect of your running deployments with real-time dashboards. InnoDeploy streams CPU, memory, disk, network, and custom application metrics with configurable alert thresholds and incident management.",
    icon: Activity,
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    highlights: [
      { title: "Live Dashboards", text: "Real-time charts for CPU, RAM, network I/O, request rate, and error rate — no refresh needed." },
      { title: "Custom Alerts", text: "Set threshold-based or anomaly-detection alerts with Slack, Discord, email, and PagerDuty integrations." },
      { title: "Application Metrics", text: "Push custom metrics from your app via StatsD or OpenTelemetry and visualize them alongside infrastructure data." },
      { title: "Incident Timeline", text: "Correlated event timeline shows deploys, scaling events, and alerts on a single view for rapid root-cause analysis." },
    ],
    useCases: [
      "DevOps teams running production workloads",
      "On-call engineers diagnosing incidents",
      "Product teams tracking API latency SLOs",
    ],
  },
  {
    slug: "build-logs",
    title: "Build Logs & Insights",
    tagline: "Stream build and runtime logs with full-text search.",
    description:
      "Every build and runtime process streams logs in real-time to the InnoDeploy dashboard. Search, filter, and tail logs across all deployments with millisecond-precision timestamps and structured metadata.",
    icon: Terminal,
    gradient: "from-emerald-500/20 to-lime-500/10",
    iconColor: "text-emerald-400",
    highlights: [
      { title: "Real-time Streaming", text: "Logs stream live during build and at runtime via WebSocket — see output the instant it's written." },
      { title: "Full-text Search", text: "Search across millions of log lines with instant results. Filter by severity, timestamp, or deployment ID." },
      { title: "Structured Logging", text: "JSON logs are automatically parsed and indexed for field-level filtering and aggregation." },
      { title: "Log Retention", text: "Configurable retention from 7 to 90 days with export to S3, GCS, or your preferred log aggregator." },
    ],
    useCases: [
      "Debugging failed builds and deployments",
      "Tracing request flows through microservices",
      "Compliance auditing with exportable log archives",
    ],
  },
  {
    slug: "secrets-env-vars",
    title: "Secrets & Environment Variables",
    tagline: "Encrypted variables with per-branch overrides.",
    description:
      "Manage environment variables and secrets securely through the dashboard or CLI. Values are encrypted at rest with AES-256, injected at build or runtime, and scoped per environment or branch.",
    icon: Lock,
    gradient: "from-indigo-500/20 to-purple-500/10",
    iconColor: "text-indigo-400",
    highlights: [
      { title: "AES-256 Encryption", text: "All secret values are encrypted at rest and in transit. Values are never exposed in logs or build output." },
      { title: "Per-branch Scoping", text: "Override variables per branch — use different database URLs for production, staging, and preview." },
      { title: "Bulk Import", text: "Import from .env files, Doppler, Vault, or paste directly. Export to share across projects." },
      { title: "Change Audit Log", text: "Every create, update, or delete of an environment variable is recorded with user, timestamp, and diff." },
    ],
    useCases: [
      "Managing API keys across multiple environments",
      "Rotating database credentials without redeploying",
      "Sharing config between microservices in a team",
    ],
  },
  {
    slug: "custom-domains-ssl",
    title: "Custom Domains & SSL",
    tagline: "Free TLS certificates and one-click custom domain routing.",
    description:
      "Add any custom domain to your project with automatic DNS verification, free Let's Encrypt TLS certificates, and HTTP/2. Certificates are auto-renewed and wildcard domains are fully supported.",
    icon: Shield,
    gradient: "from-teal-500/20 to-cyan-500/10",
    iconColor: "text-teal-400",
    highlights: [
      { title: "Free TLS Certificates", text: "Automatic Let's Encrypt provisioning with zero configuration. Certificates renew 30 days before expiry." },
      { title: "Wildcard Domains", text: "Support for *.yourdomain.com — route subdomains to different projects or environments." },
      { title: "DNS Verification", text: "Add a CNAME record and InnoDeploy verifies ownership automatically. No manual cert upload needed." },
      { title: "HTTP/2 & HSTS", text: "Every domain gets HTTP/2 by default with configurable Strict-Transport-Security headers." },
    ],
    useCases: [
      "Launching a branded production domain",
      "Multi-tenant SaaS with customer subdomains",
      "Migrating from another host with zero-downtime DNS cutover",
    ],
  },
  {
    slug: "ai-deploy-agent",
    title: "AI Deploy Agent",
    tagline: "Describe your app — the agent provisions everything.",
    description:
      "The InnoDeploy AI Agent lets you describe what you want to deploy in plain language. It analyzes your repository, selects the right runtime, configures build steps, sets up domains, and deploys — all in one conversation.",
    icon: Bot,
    gradient: "from-fuchsia-500/20 to-violet-500/10",
    iconColor: "text-fuchsia-400",
    highlights: [
      { title: "Natural Language Deploys", text: "Say 'Deploy my Next.js app from the main branch with a custom domain' and the agent handles everything." },
      { title: "Smart Configuration", text: "The agent reads your package.json, Dockerfile, or framework config to auto-detect the optimal setup." },
      { title: "Conversational Debugging", text: "After a failed deploy, ask the agent 'Why did this fail?' and get a root-cause analysis with suggested fixes." },
      { title: "MCP Integration", text: "Use the Model Context Protocol to connect the agent with your IDE, CI tools, or custom workflows." },
    ],
    useCases: [
      "First-time deployments with zero DevOps knowledge",
      "Rapid prototyping — describe and deploy in under a minute",
      "Debugging production issues through conversational AI",
    ],
  },
];

export function getFeatureBySlug(slug: string): FeatureData | undefined {
  return features.find((f) => f.slug === slug);
}

export function getAllFeatureSlugs(): string[] {
  return features.map((f) => f.slug);
}
