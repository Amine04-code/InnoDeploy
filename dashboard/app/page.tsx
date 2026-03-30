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
  CloudLightning,
  Cog,
  CircleDollarSign,
  Database,
  HardDrive,
  Headset,
  Leaf,
  LockKeyhole,
  Github,
  Globe,
  Linkedin,
  MessageCircle,
  Radio,
  Rocket,
  Sparkles,
  Ticket,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import RevealOnScroll from "@/components/homepage/RevealOnScroll";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"] });

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

const uniqueFeatures = [
  {
    title: "Zero Downtime deployments",
    description:
      "New containers are always ready to work when deploying a new commit or changing configurations, guaranteeing zero downtime.",
    icon: CheckCircle2,
  },
  {
    title: "Low Learning Curve",
    description:
      "Connect to your GitHub repository and we'll handle the rest with easy-to-analyze logs for deployment monitoring.",
    icon: BookOpen,
  },
  {
    title: "Real-time monitoring",
    description:
      "Identify bottlenecks and optimize performance by monitoring CPU, RAM, Bandwidth, and logs in real time.",
    icon: Activity,
  },
  {
    title: "Predictable Pricing",
    description:
      "Full control of your costs. Plans are straightforward, transparent, and easy to understand with no surprises.",
    icon: CircleDollarSign,
  },
  {
    title: "Dedicated & Enterprise",
    description:
      "From small teams to large enterprises, we have robust and flexible plans built for fully managed growth.",
    icon: BriefcaseBusiness,
    tag: "Scale",
  },
  {
    title: "Global Scale",
    description:
      "Built on top of AWS, GCP, Azure, and Alicloud, allowing you to scale globally and run closer to your end users.",
    icon: Globe,
    tag: "Fast",
  },
];

const launchSteps = [
  {
    title: "Connect to GitHub",
    description:
      "Just bring your code, and we'll handle the rest. Simply link the GitHub repository you want to deploy, and you're ready to go.",
    icon: Github,
    iconBox:
      "border-[#2c4c76]/70 bg-[#123257]/70 shadow-[inset_0_1px_0_rgba(148,163,184,0.08),0_0_0_1px_rgba(56,189,248,0.1),0_18px_34px_rgba(2,8,24,0.28)]",
  },
  {
    title: "Build & Deploy",
    description:
      "Launch in seconds! We'll build and deploy your project directly to a container with no delays, no errors, just a smooth launch.",
    icon: Cog,
    iconBox:
      "border-emerald-400/45 bg-[#10344f]/80 shadow-[inset_0_1px_0_rgba(45,212,191,0.15),0_0_0_1px_rgba(16,185,129,0.22),0_20px_38px_rgba(2,8,24,0.34)]",
  },
  {
    title: "Effortless Scaling",
    description:
      "Seamlessly scale your apps from a simple dashboard interface, ensuring zero downtime while managing resources effortlessly.",
    icon: Rocket,
    iconBox:
      "border-[#2c4c76]/70 bg-[#123257]/70 shadow-[inset_0_1px_0_rgba(148,163,184,0.08),0_0_0_1px_rgba(56,189,248,0.1),0_18px_34px_rgba(2,8,24,0.28)]",
  },
];

const stackCards = [
  { id: "docker", label: "Docker", icon: Boxes, iconClass: "text-sky-400" },
  { id: "nodejs", label: "Node.js", icon: Braces, iconClass: "text-emerald-400" },
  { id: "mongodb", label: "MongoDB", icon: Leaf, iconClass: "text-emerald-400" },
  { id: "redis", label: "Redis", icon: Database, iconClass: "text-rose-400" },
];

const footerColumns = [
  {
    title: "Features",
    links: ["Database", "Real-time", "Cloud Functions", "Web Deployment"],
  },
  {
    title: "Docs",
    links: ["Guides", "API Reference", "App Templates", "Release Notes"],
  },
  {
    title: "Support",
    links: ["Ask our community", "FAQ", "Chat with experts", "Submit ticket"],
  },
];

function resolveFooterHref(item: string) {
  if (["Guides", "API Reference", "App Templates", "Release Notes"].includes(item)) return "/docs";
  if (["Ask our community", "FAQ", "Chat with experts", "Submit ticket"].includes(item)) return "/#contact";
  return "/#product";
}

export default function HomePage() {
  return (
    <main className={`${spaceGrotesk.className} min-h-screen scroll-smooth bg-[#030711] text-white`}>
      <div className="relative min-h-screen w-full overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(14,165,233,0.18),transparent_24%)]" />

        <header className="sticky top-0 z-50 border-b border-slate-200/10 bg-[#06132b]/88 backdrop-blur-xl">
          <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-3xl font-semibold tracking-tight text-slate-50 transition hover:text-cyan-200"
              >
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
                                          {"icon" in entry ? <entry.icon className="mt-0.5 h-[18px] w-[18px] text-slate-300/85" /> : null}
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

        <section id="product" className="relative flex min-h-[92vh] items-center border-b border-slate-200/10 py-20 sm:py-24">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[980px] text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                
              </div>

              <h1 className="mx-auto mt-6 max-w-[860px] text-3xl font-bold leading-[1.06] text-slate-50 sm:text-5xl lg:text-6xl">
                Build, Deploy, and Monitor
                <span className="block text-slate-300">with one DevOps workspace.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-[700px] text-sm text-slate-300 sm:text-base">
                InnoDeploy brings pipelines, environments, logs, alerts, and rollbacks into a single delivery surface that scales from side projects to enterprise systems.
              </p>

              <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                <Link
                  href="/register"
                  className="rounded-md bg-white px-6 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Start for free
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-slate-200/30 px-6 py-2.5 text-center text-sm font-semibold text-slate-100 transition hover:border-slate-100/50 hover:bg-white/5"
                >
                  Get started
                </Link>
              </div>

            </div>
          </RevealOnScroll>
        </section>

        <section className="flex min-h-[92vh] items-center border-b border-slate-200/10 py-20 sm:py-24">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl lg:text-4xl">
                What makes us <span className="text-cyan-300">Unique?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-300/90 sm:text-base">
                Deployments, error messages, and scaling issues shouldn't slow you down. We handle the complexity so you can focus on building great products.
              </p>
            </div>

            <div className="mx-auto mt-9 grid max-w-[1060px] gap-4 md:grid-cols-2 xl:grid-cols-3">
              {uniqueFeatures.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-slate-200/10 bg-gradient-to-br from-[#142847]/85 to-[#0d1f39]/80 p-5 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] transition duration-300 hover:border-emerald-400/35 hover:from-[#17334f]/90 hover:to-[#12314a]/90"
                >
                  <div className="flex items-center justify-between">
                    <item.icon className="h-5 w-5 text-emerald-400 transition group-hover:text-emerald-300" strokeWidth={2} />
                    {item.tag ? (
                      <span className="rounded-md border border-cyan-300/35 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        {item.tag}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-xl font-semibold leading-tight text-slate-100 transition group-hover:text-emerald-300 sm:text-[1.45rem]">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-slate-300/90">{item.description}</p>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        <section className="relative flex min-h-[92vh] items-center border-b border-slate-200/10 py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_34%,rgba(34,211,238,0.12),transparent_38%),radial-gradient(circle_at_78%_10%,rgba(56,189,248,0.16),transparent_32%)]" />

          <RevealOnScroll className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl lg:text-4xl">How it works</h2>

            <div className="mt-8 grid gap-7 md:grid-cols-3 md:gap-8 lg:mt-10 lg:gap-10">
              {launchSteps.map((step, index) => (
                <article key={step.title} className="text-center">
                  <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[1.2rem] border animate-icon-box ${index === 1 ? "anim-delay-2" : index === 2 ? "anim-delay-4" : ""} ${step.iconBox}`}
                  >
                    <step.icon className="h-7 w-7 text-slate-100" strokeWidth={1.75} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold leading-tight text-slate-100 sm:text-[1.45rem]">{step.title}</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300/90">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        <section className="flex min-h-[92vh] items-center border-t border-slate-200/10 bg-[#07142a] py-20 sm:py-24">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">Curious about what's under the hood?</h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-300/90 sm:text-base">
                InnoDeploy is powered by a combination of enterprise-grade, open-source tools, built on widely trusted technologies.
              </p>
            </div>

            <form className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stackCards.map((stack, index) => (
                <div key={stack.id}>
                  <input id={`stack-${stack.id}`} name="stack" type="radio" className="peer sr-only" defaultChecked={index === 0} />
                  <label
                    htmlFor={`stack-${stack.id}`}
                    className="flex cursor-pointer flex-col items-center rounded-3xl border border-slate-200/10 bg-gradient-to-br from-[#1a2f4d]/90 to-[#142742]/90 px-5 py-7 text-center transition duration-300 hover:border-cyan-300/45 hover:brightness-105 peer-checked:border-cyan-300/60 peer-checked:from-[#1f4065]/95 peer-checked:to-[#17395f]/95 peer-checked:shadow-[0_0_0_1px_rgba(56,189,248,0.22),0_12px_28px_rgba(7,20,40,0.4)]"
                  >
                    <stack.icon className={`h-10 w-10 ${stack.iconClass}`} strokeWidth={1.8} />
                    <span className="mt-5 text-xl font-semibold uppercase tracking-[0.08em] text-slate-100">{stack.label}</span>
                  </label>
                </div>
              ))}
            </form>
          </RevealOnScroll>
        </section>

        <section className="flex min-h-[92vh] items-center border-t border-slate-200/10 bg-[#07142a] py-20 sm:py-24">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-5xl rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-[#1a2f4d]/90 to-[#1f3f66]/90 px-6 py-14 text-center shadow-[0_18px_45px_rgba(2,8,24,0.32)] sm:px-10">
              <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">Ready to ship software faster?</h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-200/90 sm:text-xl">
                Start for free and join teams around the world using InnoDeploy to launch faster, scale confidently, and simplify every release.
              </p>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex h-14 items-center justify-center rounded-xl bg-emerald-400 px-10 text-lg font-semibold text-[#062515] transition hover:bg-emerald-300"
                >
                  Deploy for FREE
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <section id="company" className="flex min-h-[82vh] items-center border-t border-slate-200/10 bg-[#010a1d] py-16 sm:py-20">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
              <p className="text-3xl font-semibold tracking-tight text-cyan-200 sm:text-4xl">InnoDeploy</p>
              <div className="flex items-center gap-3 text-slate-400">
                <a href="#" aria-label="GitHub" className="transition hover:text-cyan-200"><Github className="h-4 w-4" /></a>
                <a href="#" aria-label="LinkedIn" className="transition hover:text-cyan-200"><Linkedin className="h-4 w-4" /></a>
                <a href="#" aria-label="Twitter" className="transition hover:text-cyan-200"><Twitter className="h-4 w-4" /></a>
                <a href="#" aria-label="YouTube" className="transition hover:text-cyan-200"><Youtube className="h-4 w-4" /></a>
                <a href="#" aria-label="Community" className="transition hover:text-cyan-200"><MessageCircle className="h-4 w-4" /></a>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-xl font-semibold text-slate-100">{column.title}</h3>
                  <ul className="mt-3 space-y-2 text-lg text-slate-400">
                    {column.links.map((item) => (
                      <li key={item}>
                        <Link href={resolveFooterHref(item)} className="transition hover:text-cyan-200">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        <section id="contact" className="flex min-h-[78vh] items-center border-t border-slate-200/10 bg-[#010819] py-14 sm:py-16">
          <RevealOnScroll className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/10 bg-[#07152c]/70 p-6 sm:p-8">
              <h2 className="text-center text-2xl font-semibold text-slate-100 sm:text-3xl">Contact Us</h2>
              <p className="mt-2 text-center text-sm text-slate-300">Leave your email and we will get back to you.</p>

              <form className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 flex-1 rounded-lg border border-slate-200/15 bg-[#08142b] px-4 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300"
                />
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-cyan-300 px-6 text-sm font-semibold text-[#05203f] transition hover:bg-cyan-200"
                >
                  Send
                </button>
              </form>
            </div>
          </RevealOnScroll>
        </section>
      </div>
    </main>
  );
}
