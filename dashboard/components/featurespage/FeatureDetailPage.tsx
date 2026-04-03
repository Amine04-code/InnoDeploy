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
import { type FeatureData, getFeatureBySlug, getAllFeatureSlugs, features } from "@/lib/features";

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
