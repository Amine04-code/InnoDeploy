import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  Check,
  ChevronDown,
  CloudLightning,
  CircleHelp,
  Database,
  Globe,
  GraduationCap,
  HardDrive,
  Headset,
  LockKeyhole,
  Monitor,
  Radio,
  Server,
  Shield,
  ShieldCheck,
  Ticket,
  UserRound,
  Users,
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
        title: "Backend as a Service",
        items: [
          { title: "Database", description: "Store and stack relational data in real-time, globally.", icon: Database },
          { title: "Real-time", description: "Track database changes and user presence in real-time.", icon: Radio },
          { title: "Cloud Functions", description: "Add Server-side business logic using cloud code functions.", icon: CloudLightning },
          { title: "GraphQL, Rest APIs & SDKs", description: "We speak your language.", icon: Braces },
          { title: "File Storage", description: "Easy, secure cloud file storage and delivery.", icon: HardDrive },
          { title: "Authentication", description: "Complete user management system.", icon: LockKeyhole },
          { title: "Notifications", description: "Validate, engage, communicate with users using notifications.", icon: Bell },
        ],
      },
      {
        title: "Web Deployment",
        items: [
          { title: "Web Deployment", description: "Deploy full-stack web applications directly from GitHub.", icon: Boxes },
          { title: "AI Agent", description: "Instantly turn ideas into fully provisioned, production-ready apps.", icon: Bot },
          { title: "MCP", description: "Model Context Protocol integration.", icon: Braces },
        ],
      },
    ],
  },
  {
    label: "Docs",
    href: "/docs",
    columns: [
      {
        title: "Backend Platform",
        items: [
          { title: "Guides", description: "Step-by-step workflows for using your backend.", icon: BookOpen },
          { title: "API Reference", description: "Examples and generated docs from APIs and SDKs.", icon: Braces },
          { title: "App Templates", description: "Example apps and starter projects.", icon: Boxes },
        ],
      },
      {
        title: "Web Deployment Platform",
        items: [
          { title: "Docs", description: "Guides and docs for web deployment workflows.", icon: BookOpen },
          { title: "Agent Docs", description: "Learn setup and optimized prompts for AI agent usage.", icon: Bot },
          { title: "Release Notes", description: "Track updates and platform improvements.", icon: Ticket },
        ],
      },
    ],
  },
  {
    label: "Support",
    href: "/#contact",
    columns: [
      {
        title: "Community",
        items: [
          {
            title: "Ask our community",
            description: "Connect with other developers and master new skills.",
            icon: Users,
            href: "/support/ask-our-community",
          },
          {
            title: "FAQ",
            description: "Find answers to common questions.",
            icon: CircleHelp,
            href: "/support/faq",
          },
        ],
      },
      {
        title: "Contact",
        items: [
          {
            title: "Chat with the experts",
            description: "Open a chat and get help from our team.",
            icon: Headset,
            href: "/support/chat-with-experts",
          },
          { title: "Submit ticket", description: "Get direct support for your project.", icon: Ticket },
        ],
      },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing/backend-as-a-service",
  },
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
                        <div className="w-[780px] overflow-hidden rounded-b-xl border border-slate-200/10 bg-[#020f25] shadow-[0_20px_45px_rgba(0,0,0,0.5)]">
                          <div className="grid bg-[#031127] sm:grid-cols-2">
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
                <h5 className="text-xl font-semibold text-slate-100">Backend Platform</h5>
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
                  <li><Link href="/docs" className="transition hover:text-cyan-200">What is BaaS?</Link></li>
                  <li><Link href="/docs" className="transition hover:text-cyan-200">Why use BaaS?</Link></li>
                  <li><Link href="/docs" className="transition hover:text-cyan-200">Firebase alternatives</Link></li>
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
