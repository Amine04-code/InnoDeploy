"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock,
  Eye,
  FileCode2,
  GitBranch,
  GitPullRequest,
  Globe,
  Headset,
  Layers,
  Lock,
  Newspaper,
  Rocket,
  Server,
  Shield,
  Terminal,
  Ticket,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Feature data
   ═══════════════════════════════════════════════════════════ */

type FeatureData = {
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

const features: FeatureData[] = [
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

/* ═══════════════════════════════════════════════════════════
   Shared nav items (consistent across all pages)
   ═══════════════════════════════════════════════════════════ */

const navItems = [
  {
    label: "Features",
    href: "/#product",
    columns: [
      {
        title: "Deploy & Operate",
        items: [
          { title: "Git Push to Deploy", description: "Connect your repo and ship on every push — zero config required.", icon: GitBranch, href: "/features/git-push-to-deploy" },
          { title: "Preview Deployments", description: "Every pull request gets its own live URL for instant review.", icon: Eye, href: "/features/preview-deployments" },
          { title: "Instant Rollbacks", description: "Roll back to any previous deployment with a single click.", icon: Clock, href: "/features/instant-rollbacks" },
          { title: "Auto-Scaling", description: "Containers scale horizontally based on real-time traffic load.", icon: Layers, href: "/features/auto-scaling" },
          { title: "Edge Network", description: "Deploy to 50+ global edge regions for sub-200ms latency.", icon: Globe, href: "/features/edge-network" },
        ],
      },
      {
        title: "Developer Experience",
        items: [
          { title: "Real-time Monitoring", description: "Live CPU, memory, bandwidth dashboards and intelligent alerts.", icon: Activity, href: "/features/real-time-monitoring" },
          { title: "Build Logs & Insights", description: "Stream build and runtime logs with full-text search and filters.", icon: Terminal, href: "/features/build-logs" },
          { title: "Secrets & Env Vars", description: "Encrypted environment variables with per-branch overrides.", icon: Lock, href: "/features/secrets-env-vars" },
          { title: "Custom Domains & SSL", description: "Free TLS certificates and one-click custom domain routing.", icon: Shield, href: "/features/custom-domains-ssl" },
          { title: "AI Deploy Agent", description: "Describe your app in plain language — the agent provisions everything.", icon: Bot, href: "/features/ai-deploy-agent" },
        ],
      },
    ],
  },
  {
    label: "Docs",
    href: "/docs",
    columns: [
      {
        title: "Learn",
        items: [
          { title: "Quick Start", description: "Go from zero to deployed in under 5 minutes.", icon: Rocket },
          { title: "Framework Guides", description: "Optimized guides for Next.js, Nuxt, Remix, Astro, and more.", icon: BookOpen },
          { title: "CI/CD Pipelines", description: "Configure build steps, test runners, and deploy hooks.", icon: GitPullRequest },
          { title: "Infrastructure", description: "Networking, scaling, Docker, and container orchestration.", icon: Server },
        ],
      },
      {
        title: "Resources",
        items: [
          { title: "API Reference", description: "RESTful endpoints for deployments, projects, and domains.", icon: Braces },
          { title: "CLI Documentation", description: "Manage projects and deployments from your terminal.", icon: Terminal },
          { title: "Starter Templates", description: "Production-ready boilerplates to kickstart your project.", icon: FileCode2 },
          { title: "Changelog", description: "Latest platform updates, features, and improvements.", icon: Newspaper },
        ],
      },
    ],
  },
  {
    label: "Support",
    href: "/#contact",
    columns: [
      {
        title: "Self-Service",
        items: [
          { title: "Documentation", description: "Comprehensive guides for every feature and workflow.", icon: BookOpen, href: "/docs" },
          { title: "FAQ", description: "Instant answers to the most common platform questions.", icon: CircleHelp, href: "/support/faq" },
          { title: "System Status", description: "Real-time uptime, incident reports, and maintenance windows.", icon: Activity, href: "/support/faq" },
          { title: "Community Forum", description: "Ask questions, share solutions, and connect with other devs.", icon: Users, href: "/support/ask-our-community" },
        ],
      },
      {
        title: "Direct Support",
        items: [
          { title: "Live Chat", description: "Talk with a deployment engineer — average response < 2 min.", icon: Headset, href: "/support/chat-with-experts" },
          { title: "Submit a Ticket", description: "Open a support case tracked through to resolution.", icon: Ticket, href: "/support/chat-with-experts" },
          { title: "Priority Support", description: "Dedicated SLA-backed support for Pro and Enterprise plans.", icon: Zap, href: "/support/chat-with-experts" },
          { title: "Enterprise Sales", description: "Custom contracts, SSO, SLA, and dedicated account managers.", icon: BriefcaseBusiness, href: "/#contact" },
        ],
      },
    ],
  },
  { label: "Pricing", href: "/pricing/backend-as-a-service" },
];

/* ═══════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════ */

export default function FeatureDetailPage({ slug }: { slug: string }) {
  const feature = getFeatureBySlug(slug);
  const pathname = usePathname();

  if (!feature) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030711] text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Feature not found</h1>
          <Link href="/#product" className="mt-4 inline-block text-cyan-400 hover:underline">
            Back to features
          </Link>
        </div>
      </main>
    );
  }

  /* Find prev/next features for navigation */
  const currentIndex = features.findIndex((f) => f.slug === slug);
  const prev = currentIndex > 0 ? features[currentIndex - 1] : null;
  const next = currentIndex < features.length - 1 ? features[currentIndex + 1] : null;

  /* Grab 3 other features for the "Explore More" section */
  const otherFeatures = features.filter((f) => f.slug !== slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <div className="relative w-full overflow-x-clip">
        {/* ─── Background ─────────────────────────── */}
        <div className="pointer-events-none fixed inset-0 grid-pattern" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.08),transparent)]" />
        <div className="pointer-events-none fixed left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[100px] animate-orb-float" />
        <div className="pointer-events-none fixed right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.03] blur-[80px] animate-orb-float-2" />

        {/* ═══ Navigation ═══ */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030711]/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white transition hover:opacity-90"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400">
                  <Rocket className="h-4 w-4 text-[#030711]" strokeWidth={2.5} />
                </div>
                InnoDeploy
              </Link>

              <nav className="hidden items-center gap-1 lg:flex">
                {navItems.map((item) => (
                  <div key={item.label} className="group relative">
                    <Link
                      href={item.href}
                      className="relative flex items-center gap-1 rounded-lg px-3 py-2 text-[0.9rem] font-medium text-slate-400 transition-colors hover:text-white"
                    >
                      {item.label}
                      {item.columns ? <ChevronDown className="h-3 w-3 opacity-50" /> : null}
                    </Link>

                    {item.columns ? (
                      <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                        <div className="w-[720px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a1628]/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                          <div className="grid sm:grid-cols-2">
                            {item.columns.map((column, index) => (
                              <div
                                key={column.title}
                                className={`px-5 py-4 ${index === 0 ? "border-r border-white/[0.06]" : ""}`}
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{column.title}</p>
                                <ul className="mt-3 space-y-1">
                                  {column.items.map((entry) => {
                                    const entryHref = "href" in entry ? (entry as { href: string }).href : undefined;
                                    const isActive = entryHref ? pathname === entryHref : false;
                                    return (
                                      <li key={entry.title}>
                                        <Link
                                          href={entryHref ?? item.href}
                                          className={`group/item flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.04] ${isActive ? "bg-white/[0.06]" : ""}`}
                                        >
                                          <entry.icon className={`mt-0.5 h-4 w-4 shrink-0 transition ${isActive ? "text-cyan-400" : "text-slate-500 group-hover/item:text-cyan-400"}`} />
                                          <div>
                                            <p className={`text-sm font-medium transition ${isActive ? "text-white" : "text-slate-200 group-hover/item:text-white"}`}>{entry.title}</p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{entry.description}</p>
                                          </div>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                          {item.label === "Docs" ? (
                            <div className="border-t border-white/[0.06] px-5 py-3">
                              <Link
                                href="/docs"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                              >
                                View all documentation
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-white">
                Sign in
              </Link>
              <Link href="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#030711] transition hover:bg-slate-100">
                Start for free
              </Link>
            </div>
          </div>
        </header>

        {/* ═══ Hero ═══ */}
        <section className="relative pb-16 pt-20 sm:pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(56,189,248,0.08),transparent_60%)]" />

          <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Link
              href="/#product"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Features
            </Link>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
              {/* Left — Title block */}
              <div className="flex-1">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} strokeWidth={1.8} />
                </div>

                <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {feature.title}
                </h1>

                <p className="mt-3 text-lg font-medium text-cyan-300/80">
                  {feature.tagline}
                </p>

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
                  {feature.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-[#030711] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.25)]"
                  >
                    Start using {feature.title.split(" ")[0]}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <BookOpen className="h-4 w-4" />
                    Read the docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Highlights ═══ */}
        <section className="relative border-t border-white/[0.06] py-20 sm:py-24">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Capabilities</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What makes it powerful
            </h2>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {feature.highlights.map((h, i) => (
                <article
                  key={h.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-6 transition-all duration-300 hover:border-cyan-400/20 hover:bg-[#0d1d35]/80 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                      <span className={`text-sm font-bold ${feature.iconColor}`}>0{i + 1}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{h.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Use Cases ═══ */}
        <section className="relative border-t border-white/[0.06] bg-[#050d1e]/60 py-20 sm:py-24">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Use Cases</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for teams like yours
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {feature.useCases.map((uc) => (
                <div
                  key={uc}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#0a1628]/50 p-5 transition hover:border-emerald-400/20"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <p className="text-sm leading-relaxed text-slate-300">{uc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Explore More Features ═══ */}
        <section className="relative border-t border-white/[0.06] py-20 sm:py-24">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Explore More</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Other features you&apos;ll love
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {otherFeatures.map((f) => (
                <Link
                  key={f.slug}
                  href={`/features/${f.slug}`}
                  className="group rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0d1d35]/80"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-gradient-to-br ${f.gradient}`}>
                    <f.icon className={`h-5 w-5 ${f.iconColor}`} strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white transition group-hover:text-cyan-300">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{f.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 transition group-hover:gap-2">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Prev / Next ═══ */}
        <section className="border-t border-white/[0.06] py-10">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 sm:px-6 lg:px-8">
            {prev ? (
              <Link
                href={`/features/${prev.slug}`}
                className="group flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Previous</p>
                  <p className="font-medium">{prev.title}</p>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                href={`/features/${next.slug}`}
                className="group flex items-center gap-3 text-right text-sm text-slate-400 transition hover:text-white"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Next</p>
                  <p className="font-medium">{next.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : <div />}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="relative border-t border-white/[0.06] py-20">
          <div className="mx-auto max-w-[800px] px-4 text-center sm:px-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08]">
              <Rocket className="h-6 w-6 text-cyan-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">Ready to try {feature.title}?</h2>
            <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
              Start for free. No credit card required. Deploy your first project in under 5 minutes.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-10 py-3.5 text-sm font-semibold text-[#030711] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.25)]"
            >
              Deploy for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
