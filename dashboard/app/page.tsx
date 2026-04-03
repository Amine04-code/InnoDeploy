import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  ArrowRight,
  Activity,
  Bell,
  Bot,
  Braces,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CircleHelp,
  ChevronDown,
  CheckCircle2,
  Cog,
  CircleDollarSign,
  Container,
  Database,
  FileCode2,
  Gauge,
  GitBranch,
  GitPullRequest,
  Globe,
  GraduationCap,
  Headset,
  Github,
  Layers,
  Leaf,
  LifeBuoy,
  Linkedin,
  Lock,
  MessageCircle,
  Newspaper,
  Rocket,
  ScrollText,
  Shield,
  Sparkles,
  Terminal,
  Ticket,
  Twitter,
  Users,
  Youtube,
  Zap,
  BarChart3,
  Eye,
  Clock,
  Server,
} from "lucide-react";
import RevealOnScroll from "@/components/homepage/RevealOnScroll";
import LandingTerminalPanel from "@/components/homepage/LandingTerminalPanel";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"] });

/* ─── Navigation ────────────────────────────────────────── */
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

/* ─── Features ──────────────────────────────────────────── */
const uniqueFeatures = [
  {
    title: "Zero Downtime Deploys",
    description: "New containers are always ready when deploying a new commit or changing configurations. Zero downtime, every time.",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-cyan-500/10",
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-400/30",
  },
  {
    title: "Push-to-Deploy",
    description: "Connect your GitHub repository and every push triggers an automated build, test, and deploy pipeline.",
    icon: GitBranch,
    gradient: "from-violet-500/20 to-indigo-500/10",
    iconColor: "text-violet-400",
    borderHover: "hover:border-violet-400/30",
  },
  {
    title: "Real-time Monitoring",
    description: "Identify bottlenecks instantly with live CPU, RAM, bandwidth monitoring and intelligent log analysis.",
    icon: Activity,
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-400",
    borderHover: "hover:border-cyan-400/30",
  },
  {
    title: "Predictable Pricing",
    description: "Full control of your costs. Plans are transparent, straightforward, and built for no surprises.",
    icon: CircleDollarSign,
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    borderHover: "hover:border-amber-400/30",
  },
  {
    title: "Enterprise Grade Security",
    description: "SOC2 compliant, encrypted at rest and in transit. Role-based access control and audit logging built in.",
    icon: Shield,
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    borderHover: "hover:border-rose-400/30",
    tag: "Secure",
  },
  {
    title: "Global Edge Network",
    description: "Built on AWS, GCP, and Azure. Deploy closer to your users with multi-region support and edge caching.",
    icon: Globe,
    gradient: "from-sky-500/20 to-teal-500/10",
    iconColor: "text-sky-400",
    borderHover: "hover:border-sky-400/30",
    tag: "Fast",
  },
];

/* ─── How it works ──────────────────────────────────────── */
const launchSteps = [
  {
    step: "01",
    title: "Connect Repository",
    description: "Link your GitHub, GitLab, or Bitbucket repo. We auto-detect your framework and configure the build.",
    icon: Github,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    step: "02",
    title: "Build & Deploy",
    description: "Each push triggers a CI/CD pipeline. We build, test, and deploy your application with zero configuration needed.",
    icon: Cog,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    step: "03",
    title: "Monitor & Scale",
    description: "Real-time dashboards, intelligent alerts, and one-click scaling. Go from zero to millions of requests effortlessly.",
    icon: Rocket,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

/* ─── Stats ─────────────────────────────────────────────── */
const stats = [
  { value: "99.99%", label: "Uptime SLA", icon: Clock },
  { value: "< 200ms", label: "Deploy Latency", icon: Zap },
  { value: "50+", label: "Edge Regions", icon: Globe },
  { value: "10K+", label: "Active Projects", icon: Server },
];

/* ─── Tech Stack ────────────────────────────────────────── */
const stackCards = [
  { id: "docker", label: "Docker", icon: Boxes, iconClass: "text-sky-400", desc: "Container Runtime" },
  { id: "nodejs", label: "Node.js", icon: Braces, iconClass: "text-emerald-400", desc: "Server Runtime" },
  { id: "mongodb", label: "MongoDB", icon: Leaf, iconClass: "text-emerald-400", desc: "Database Layer" },
  { id: "redis", label: "Redis", icon: Database, iconClass: "text-rose-400", desc: "Cache & Queue" },
];

/* ─── Footer ────────────────────────────────────────────── */
const footerColumns = [
  { title: "Product", links: [
    { label: "Features", href: "/#product" },
    { label: "Pricing", href: "/pricing/backend-as-a-service" },
    { label: "Changelog", href: "/docs" },
    { label: "Roadmap", href: "/docs" },
  ]},
  { title: "Resources", links: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs" },
    { label: "Guides", href: "/docs" },
    { label: "Templates", href: "/docs" },
  ]},
  { title: "Company", links: [
    { label: "About", href: "/#company" },
    { label: "Blog", href: "/docs" },
    { label: "Careers", href: "/#company" },
    { label: "Contact", href: "/#contact" },
  ]},
  { title: "Legal", links: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "DPA", href: "#" },
  ]},
];

/* ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className={`${spaceGrotesk.className} min-h-screen scroll-smooth bg-[#030711] text-white`}>
      <div className="relative min-h-screen w-full overflow-x-clip">

        {/* ─── Background Elements ─────────────────────────── */}
        <div className="pointer-events-none fixed inset-0 grid-pattern" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]" />

        {/* ─── Floating Orbs ───────────────────────────────── */}
        <div className="pointer-events-none fixed left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[100px] animate-orb-float" />
        <div className="pointer-events-none fixed right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.03] blur-[80px] animate-orb-float-2" />
        <div className="pointer-events-none fixed left-1/2 bottom-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/[0.03] blur-[90px] animate-orb-float" style={{ animationDelay: "4s" }} />

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
                        <div className={`overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a1628]/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl ${item.columns.length > 1 ? 'w-[720px]' : 'w-[360px]'}`}>
                          <div className={`grid ${item.columns.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                            {item.columns.map((column, index) => (
                              <div
                                key={column.title}
                                className={`px-5 py-4 ${index === 0 ? "border-r border-white/[0.06]" : ""}`}
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{column.title}</p>
                                <ul className="mt-3 space-y-1">
                                  {column.items.map((entry) => (
                                    <li key={entry.title}>
                                      <Link href={entry.href ?? item.href} className="group/item flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.04]">
                                        {"icon" in entry ? <entry.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition group-hover/item:text-cyan-400" /> : null}
                                        <div>
                                          <p className="text-sm font-medium text-slate-200 transition group-hover/item:text-white">{entry.title}</p>
                                          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{entry.description}</p>
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
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
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#030711] transition hover:bg-slate-100"
              >
                Start for free
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#030711] transition hover:bg-slate-100"
              >
                Start
              </Link>
            </div>
          </div>
        </header>

        {/* ═══ Hero Section ═══ */}
        <section id="product" className="relative flex min-h-[94vh] items-center py-20 sm:py-28">
          {/* Hero gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(56,189,248,0.08),transparent_60%)]" />

          <RevealOnScroll className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[900px] text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                Now in Public Beta
              </div>

              {/* Heading */}
              <h1 className="mx-auto mt-8 max-w-[840px] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                Ship to production
                <br />
                <span className="text-gradient-hero">with confidence.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-[600px] text-base leading-relaxed text-slate-400 sm:text-lg">
                InnoDeploy unifies CI/CD pipelines, monitoring, alerts, and rollbacks into one powerful DevOps workspace that scales from side projects to enterprise.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-8 py-3.5 text-sm font-semibold text-[#030711] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.25)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start deploying free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <BookOpen className="h-4 w-4" />
                  Read the docs
                </Link>
              </div>

              {/* Social proof mini */}
              <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Free tier included
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  No credit card required
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  SOC2 Compliant
                </span>
              </div>
            </div>

            {/* Terminal Preview */}
            <div className="mt-16 sm:mt-20">
              <LandingTerminalPanel />
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ Stats Bar ═══ */}
        <section className="relative border-y border-white/[0.06] bg-[#050d1e]/80 backdrop-blur-sm">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto mb-3 h-5 w-5 text-cyan-400/70" strokeWidth={1.5} />
                  <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ Features Section ═══ */}
        <section className="relative py-24 sm:py-32">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Why InnoDeploy</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need to
                <span className="text-gradient"> ship faster</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Stop juggling tools. InnoDeploy gives your team a unified DevOps platform with enterprise features out of the box.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-[1100px] gap-4 md:grid-cols-2 xl:grid-cols-3">
              {uniqueFeatures.map((item) => (
                <article
                  key={item.title}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-6 transition-all duration-300 ${item.borderHover} hover:bg-[#0d1d35]/80 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]`}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] ${item.iconColor}`}>
                        <item.icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      {item.tag ? (
                        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                          {item.tag}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ How It Works ═══ */}
        <section className="relative py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,211,238,0.06),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.06),transparent_40%)]" />

          <RevealOnScroll className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">How It Works</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                From code to production in
                <span className="text-gradient"> minutes</span>
              </h2>
            </div>

            <div className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-0">
              {/* Connector line */}
              <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />

              {launchSteps.map((step, index) => (
                <article key={step.title} className="relative text-center md:px-6">
                  {/* Step number */}
                  <div className={`relative mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-2xl border ${step.border} ${step.bg} transition-all duration-500 hover:scale-105`}>
                    <div className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#030711] text-[11px] font-bold ${step.color}`}>
                      {step.step}
                    </div>
                    <step.icon className={`h-8 w-8 ${step.color}`} strokeWidth={1.5} />
                    {/* Pulse ring */}
                    <div className={`absolute inset-0 rounded-2xl border ${step.border} animate-pulse-ring`} style={{ animationDelay: `${index * 0.6}s` }} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ Tech Stack ═══ */}
        <section className="relative border-y border-white/[0.06] bg-[#050d1e]/60 py-24 sm:py-32">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Under The Hood</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Powered by technology
                <span className="text-gradient"> you trust</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Battle-tested, open-source infrastructure. No vendor lock-in, no black boxes.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stackCards.map((stack) => (
                <div
                  key={stack.id}
                  className="group flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0a1628]/50 px-5 py-8 text-center transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0d1d35]/70 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] transition group-hover:scale-110">
                    <stack.icon className={`h-7 w-7 ${stack.iconClass}`} strokeWidth={1.5} />
                  </div>
                  <span className="mt-4 text-lg font-bold text-white">{stack.label}</span>
                  <span className="mt-1 text-xs text-slate-500">{stack.desc}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ CTA Section ═══ */}
        <section className="relative py-24 sm:py-32">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/[0.08]">
              {/* CTA Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e3d] via-[#0a1c38] to-[#071630]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.1),transparent_60%)]" />
              <div className="absolute inset-0 grid-pattern-dense opacity-40" />

              <div className="relative px-8 py-16 text-center sm:px-16 sm:py-20">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08]">
                  <Rocket className="h-6 w-6 text-cyan-400" strokeWidth={1.5} />
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to ship software faster?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400">
                  Join thousands of teams deploying with InnoDeploy. Start free, scale infinitely — no credit card required.
                </p>

                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-10 py-3.5 text-sm font-semibold text-[#030711] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.25)]"
                  >
                    Deploy for free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Talk to sales
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ Contact Section ═══ */}
        <section id="contact" className="relative border-t border-white/[0.06] py-20 sm:py-24">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.06] bg-[#0a1628]/50 p-8 backdrop-blur-sm">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Get in touch</h2>
                <p className="mt-2 text-sm text-slate-400">Leave your email and we&apos;ll get back to you within 24 hours.</p>
              </div>

              <form className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition"
                />
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 text-sm font-semibold text-[#030711] transition hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  Send
                </button>
              </form>
            </div>
          </RevealOnScroll>
        </section>

        {/* ═══ Footer ═══ */}
        <footer id="company" className="border-t border-white/[0.06] bg-[#020509]">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
            {/* Footer top */}
            <div className="flex flex-col gap-12 md:flex-row md:justify-between">
              {/* Brand */}
              <div className="max-w-xs">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 text-xl font-bold text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400">
                    <Rocket className="h-4 w-4 text-[#030711]" strokeWidth={2.5} />
                  </div>
                  InnoDeploy
                </Link>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  The modern DevOps platform for teams who ship fast and sleep well.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  {[
                    { icon: Github, label: "GitHub" },
                    { icon: Linkedin, label: "LinkedIn" },
                    { icon: Twitter, label: "Twitter" },
                    { icon: Youtube, label: "YouTube" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      aria-label={social.label}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-500 transition hover:border-white/[0.12] hover:text-white"
                    >
                      <social.icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Footer links */}
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{column.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {column.links.map((item) => (
                        <li key={item.label}>
                          <Link href={item.href} className="text-sm text-slate-500 transition hover:text-white">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer bottom */}
            <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
              <p className="text-xs text-slate-600">© 2026 InnoDeploy. All rights reserved.</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                All systems operational
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
