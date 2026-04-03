import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  Eye,
  FileCode2,
  GitBranch,
  GitPullRequest,
  Globe,
  GraduationCap,
  Headset,
  Layers,
  Lock,
  Monitor,
  Newspaper,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  Terminal,
  Ticket,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

type Plan = {
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  discount: string;
  requestLabel: string;
  dbLabel: string;
  transferLabel: string;
  fileLabel: string;
  extras?: string[];
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "MVP",
    subtitle: "Validate ideas quickly and launch with confidence.",
    monthlyPrice: 25,
    annualPrice: 15,
    discount: "Save 40%",
    requestLabel: "500 K Requests",
    dbLabel: "1 GB Data Storage",
    transferLabel: "250 GB Data Transfer",
    fileLabel: "50 GB File Storage",
    extras: ["Daily Backups"],
  },
  {
    name: "Pay As You Go",
    subtitle: "Run and scale applications on serverless infrastructure.",
    monthlyPrice: 100,
    annualPrice: 80,
    discount: "Save 20%",
    requestLabel: "5 M Requests",
    dbLabel: "3 GB Data Storage",
    transferLabel: "1 TB Data Transfer",
    fileLabel: "250 GB File Storage",
    extras: ["Daily Backups", "SOC 2 and ISO 27001"],
    featured: true,
  },
  {
    name: "Dedicated",
    subtitle: "Production-grade speed, isolation, and flexibility.",
    monthlyPrice: 499,
    annualPrice: 400,
    discount: "Save 20%",
    requestLabel: "Unlimited Requests",
    dbLabel: "8 GB Data Storage",
    transferLabel: "2 TB Data Transfer",
    fileLabel: "1 TB File Storage",
    extras: ["Point-in-Time Backups", "SOC 2 and ISO 27001", "HIPAA After BAA Signed"],
  },
];

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

function formatPrice(value: number) {
  return `$${value}`;
}

export default function BackendPricingPage() {
  const yearly = true;

  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <div className="relative w-full overflow-x-clip bg-[radial-gradient(circle_at_8%_10%,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.13),transparent_22%)]">
        <header className="sticky top-0 z-50 border-b border-slate-200/10 bg-[#06132b]/88 backdrop-blur-xl">
          <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-3xl font-semibold tracking-tight text-slate-50 transition hover:text-cyan-200">
                InnoDeploy
              </Link>

              <nav className="hidden items-center gap-5 lg:flex">
                {navItems.map((item) => (
                  <div key={item.label} className="group relative">
                    <Link
                      href={item.href}
                      className="relative flex items-center gap-1 border-b-2 border-transparent px-2 py-5 text-[1.04rem] font-medium text-slate-100/95 transition hover:border-emerald-400 hover:text-white group-hover:border-emerald-400 group-hover:text-white"
                    >
                      {item.label}
                      {item.columns ? <ChevronDown className="h-3.5 w-3.5 text-slate-300/85" /> : null}
                    </Link>

                    {item.columns ? (
                      <div className="pointer-events-none absolute left-0 top-full z-50 pt-0.5 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                        <div className={`overflow-hidden rounded-b-xl border border-slate-200/10 bg-[#020f25] shadow-[0_20px_45px_rgba(0,0,0,0.5)] ${item.columns.length > 1 ? 'w-[780px]' : 'w-[360px]'}`}>
                          <div className={`grid bg-[#031127] ${item.columns.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                            {item.columns.map((column, index) => (
                              <div
                                key={column.title}
                                className={`px-6 py-5 ${index === 0 ? "border-r border-slate-200/10" : ""}`}
                              >
                                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{column.title}</p>
                                <ul className="mt-4 space-y-2.5">
                                  {column.items.map((entry) => (
                                    <li key={entry.title}>
                                      <Link href={entry.href ?? item.href} className="block rounded-md px-2 py-1.5 transition hover:bg-white/5">
                                        <div className="flex items-start gap-2.5">
                                          <entry.icon className="mt-0.5 h-[18px] w-[18px] text-slate-300/85" />
                                          <div>
                                            <p className="text-[1.03rem] font-semibold text-slate-100">{entry.title}</p>
                                            <p className="mt-0.5 text-[0.96rem] leading-6 text-slate-400">{entry.description}</p>
                                          </div>
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          {item.label === "Docs" ? (
                            <div className="border-t border-slate-200/10 px-6 py-3.5">
                              <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 text-base font-semibold text-emerald-300 transition hover:text-emerald-200"
                              >
                                See all Docs
                                <ArrowRight className="h-4 w-4" />
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
                className="rounded-md px-4 py-2 text-[1.03rem] font-medium text-slate-100 transition hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-md bg-emerald-400 px-5 py-2.5 text-[1.03rem] font-semibold text-[#062515] transition hover:bg-emerald-300"
              >
                Sign up
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Start
              </Link>
            </div>
          </div>
        </header>

        <section className="border-b border-slate-200/10 py-20 sm:py-24">
          <div className="mx-auto max-w-[860px] px-5 text-center sm:px-8">
            <h1 className="text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
              Simple, All-inclusive Pricing
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-slate-300/90">
              Our straightforward plans are built for stability and predictability so teams can scale with confidence.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-[1120px] px-5 sm:px-8">
            <div className="rounded-2xl border border-slate-200/10 bg-gradient-to-r from-[#0a1d37]/95 to-[#09162e]/95 px-6 py-7 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] sm:px-8">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <p className="text-4xl font-bold text-slate-50">Start for Free</p>
                  <p className="mt-2 text-sm text-slate-300/80">Perfect for prototyping, side projects, and early stage products.</p>
                  <div className="mt-5 flex flex-wrap gap-5 text-sm text-emerald-300">
                    <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" />25K Requests</span>
                    <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" />250MB Database</span>
                    <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" />1GB Transfer</span>
                    <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" />1GB Files</span>
                  </div>
                </div>

                <div className="w-full max-w-[230px]">
                  <Link
                    href="/register"
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-6 text-base font-semibold text-white transition hover:bg-emerald-400"
                  >
                    Get Started
                  </Link>
                  <p className="mt-2 text-center text-xs text-slate-400">No credit card required</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-[1180px] px-5 sm:px-8">
            <h2 className="text-center text-4xl font-bold text-slate-50">Plans & Pricing</h2>

            <div className="mx-auto mt-7 flex w-full max-w-[250px] rounded-full border border-slate-200/15 bg-[#1a2f4e]/60 p-1">
              <button className="w-1/2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Annually</button>
              <button className="w-1/2 rounded-full px-4 py-2 text-sm font-semibold text-slate-300">Monthly</button>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => {
                const amount = yearly ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <article
                    key={plan.name}
                    className={`relative rounded-2xl border p-6 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] ${
                      plan.featured
                        ? "border-emerald-400/45 bg-gradient-to-b from-[#1c3557]/95 to-[#1a2f4e]/90 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_24px_44px_rgba(2,8,24,0.38)]"
                        : "border-slate-200/10 bg-gradient-to-b from-[#1a2f4d]/90 to-[#142843]/88"
                    }`}
                  >
                    {plan.featured ? (
                      <span className="absolute right-0 top-6 rounded-bl-lg rounded-tr-xl bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                        Popular
                      </span>
                    ) : null}

                    <h3 className="text-4xl font-semibold text-slate-50">{plan.name}</h3>
                    <p className="mt-3 text-sm text-slate-300/85">{plan.subtitle}</p>

                    <p className="mt-6 text-6xl font-bold text-slate-50">{formatPrice(amount)}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Per App / Month <span className="ml-2 font-semibold text-emerald-400">{plan.discount}</span>
                    </p>
                    <p className="text-sm text-slate-400">Billed Annually</p>

                    <ul className="mt-7 space-y-3 text-base text-slate-200/90">
                      <li className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{plan.requestLabel}</li>
                      <li className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{plan.dbLabel}</li>
                      <li className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{plan.transferLabel}</li>
                      <li className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{plan.fileLabel}</li>
                      {plan.extras?.map((extra) => (
                        <li key={extra} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{extra}</li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className={`mt-9 h-12 w-full rounded-xl border text-base font-semibold transition ${
                        plan.featured
                          ? "border-emerald-400 bg-emerald-500 text-white hover:bg-emerald-400"
                          : "border-emerald-400/70 bg-transparent text-slate-100 hover:bg-emerald-400/12"
                      }`}
                    >
                      Buy Now
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-[1120px] px-5 sm:px-8">
            <div className="rounded-2xl border border-slate-200/10 bg-gradient-to-r from-[#1a2f4d]/88 to-[#1f3f66]/80 p-7 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] sm:p-10">
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200/15 bg-[#1a2f4e]/65 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Enterprise
              </p>
              <h3 className="mt-5 text-center text-5xl font-bold text-slate-50">Need a Custom Solution?</h3>
              <p className="mx-auto mt-4 max-w-[700px] text-center text-lg text-slate-300/90">
                Your application needs are unique. Let&apos;s build something that scales with your vision.
              </p>

              <div className="mx-auto mt-8 grid max-w-[860px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <span className="inline-flex items-center gap-2 text-slate-200"><Server className="h-4 w-4 text-emerald-400" />Your Infrastructure</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><Shield className="h-4 w-4 text-emerald-400" />Custom SLAs</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><Monitor className="h-4 w-4 text-emerald-400" />On Premises</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><Headset className="h-4 w-4 text-emerald-400" />Pro Services</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><CircleHelp className="h-4 w-4 text-emerald-400" />Monitoring</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><GraduationCap className="h-4 w-4 text-emerald-400" />Training</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><UserRound className="h-4 w-4 text-emerald-400" />Dedicated Engineer</span>
                <span className="inline-flex items-center gap-2 text-slate-200"><Globe className="h-4 w-4 text-emerald-400" />Multi Region</span>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/#contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-base font-semibold text-white transition hover:bg-emerald-400"
                >
                  Contact Us Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200/10 bg-[#010a1d] py-16">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h4 className="text-3xl font-semibold tracking-tight text-cyan-200">InnoDeploy</h4>
              </div>

              <div>
                <h5 className="text-xl font-semibold text-slate-100">Deployment Platform</h5>
                <ul className="mt-3 space-y-2 text-lg text-slate-400">
                  <li><Link href="/pricing/backend-as-a-service" className="transition hover:text-cyan-200">Pricing</Link></li>
                  <li><Link href="/docs" className="transition hover:text-cyan-200">Docs</Link></li>
                  <li><Link href="/docs" className="transition hover:text-cyan-200">App Templates</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="text-xl font-semibold text-slate-100">Community & Help</h5>
                <ul className="mt-3 space-y-2 text-lg text-slate-400">
                  <li><Link href="/#contact" className="transition hover:text-cyan-200">Community</Link></li>
                  <li><Link href="/#contact" className="transition hover:text-cyan-200">FAQ</Link></li>
                  <li><Link href="/#contact" className="transition hover:text-cyan-200">Support</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="text-xl font-semibold text-slate-100">Learn</h5>
                <ul className="mt-3 space-y-2 text-lg text-slate-400">
                  <li><Link href="/docs" className="transition hover:text-cyan-200">Deployment Guides</Link></li>
                  <li><Link href="/docs" className="transition hover:text-cyan-200">CI/CD Pipelines</Link></li>
                  <li><Link href="/docs" className="transition hover:text-cyan-200">Monitoring & Alerts</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200/10 pt-8">
              <p className="text-base text-slate-300/80">© 2026 InnoDeploy Inc.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
