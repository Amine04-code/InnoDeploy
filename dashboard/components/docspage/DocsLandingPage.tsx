import Link from "next/link";
import {
  BookOpen,
  Braces,
  Boxes,
  CircleHelp,
  ChevronDown,
  ArrowRight,
  Bell,
  Bot,
  CloudLightning,
  Database,
  HardDrive,
  Headset,
  Linkedin,
  LockKeyhole,
  MessageCircle,
  MapPin,
  Radio,
  Ticket,
  Twitter,
  Users,
  Youtube,
  Github,
} from "lucide-react";

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
        title: "Support",
        items: [
          { title: "FAQ", description: "Find answers to common questions quickly.", icon: CircleHelp },
          { title: "Chat with experts", description: "Open a chat and get help from our team.", icon: Headset },
          { title: "Submit ticket", description: "Get direct support for your project.", icon: Ticket },
        ],
      },
    ],
  },
  {
    label: "Support",
    href: "/support/faq",
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

const backendResources = [
  {
    title: "Guides",
    description: "Step-by-step workflows to deploy and scale your applications.",
    icon: BookOpen,
    href: "/support/faq",
  },
  {
    title: "API Reference",
    description: "Auto-generated references for APIs, request payloads, and integrations.",
    icon: Braces,
    href: "/support/chat-with-experts",
  },
  {
    title: "App Templates",
    description: "Starter templates and practical blueprints to launch faster.",
    icon: Boxes,
    href: "/register",
  },
  {
    title: "FAQ",
    description: "Answers to common platform and deployment questions.",
    icon: CircleHelp,
    href: "/support/faq",
  },
];

const containerResources = [
  {
    title: "Container Docs",
    description: "Step-by-step workflows for deploying and managing containers with our Container as a Service platform.",
    icon: Boxes,
    href: "/docs",
  },
];

const footerColumns = [
  {
    title: "Backend Platform",
    links: [
      { label: "Pricing", href: "/pricing/backend-as-a-service" },
      { label: "Docs", href: "/docs" },
      { label: "App Templates", href: "/docs" },
    ],
  },
  {
    title: "Community & Help",
    links: [
      { label: "Community", href: "/support/ask-our-community" },
      { label: "FAQ", href: "/support/faq" },
      { label: "Support", href: "/support/chat-with-experts" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "What is a Backend as a Service?", href: "/docs" },
      { label: "Why Use a Backend as a Service?", href: "/docs" },
      { label: "What are the best Firebase alternatives?", href: "/docs" },
      { label: "InnoDeploy vs Firebase", href: "/docs" },
    ],
    badge: "View All",
  },
  {
    title: "InnoDeploy",
    links: [
      { label: "About us", href: "/" },
      { label: "Become a Partner", href: "/" },
      { label: "Find a Partner", href: "/" },
    ],
  },
];

export default function DocsLandingPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <div className="relative w-full overflow-x-clip bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(16,185,129,0.13),transparent_24%)]">
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
          <div className="mx-auto max-w-[980px] px-5 text-center sm:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <BookOpen className="h-3.5 w-3.5" />
              Documentation
            </p>

            <h1 className="mx-auto mt-6 max-w-[900px] text-5xl font-bold leading-tight text-slate-50 sm:text-6xl">
              Learn & Build with
              <span className="ml-3 bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                InnoDeploy
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[760px] text-xl text-slate-300/90">
              Whether you prefer reading or building hands-on, our resources help you ship with confidence.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-[1160px] px-5 sm:px-8">
            <div className="flex items-center justify-center gap-3">
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-2">
                <Database className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="text-4xl font-bold text-slate-50">Backend as a Service</h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {backendResources.map((resource) => (
                <article
                  key={resource.title}
                  className="group rounded-2xl border border-slate-200/10 bg-gradient-to-b from-[#1a2f4d]/90 to-[#142843]/88 p-6 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] transition duration-300 hover:border-emerald-400/35 hover:from-[#17334f]/90 hover:to-[#12314a]/90"
                >
                  <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2.5 w-fit">
                    <resource.icon className="h-6 w-6 text-cyan-200" />
                  </div>
                  <h3 className="mt-5 text-3xl font-semibold text-slate-100">{resource.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-300/85">{resource.description}</p>

                  <Link
                    href={resource.href}
                    className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-emerald-300 transition group-hover:text-emerald-200"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/10 py-16 sm:py-20">
          <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
            <div className="flex items-center justify-center gap-3">
              <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-2">
                <Boxes className="h-5 w-5 text-cyan-200" />
              </div>
              <h2 className="text-4xl font-bold text-slate-50">Container as a Service</h2>
            </div>

            <div className="mx-auto mt-8 grid max-w-[420px] gap-6">
              {containerResources.map((resource) => (
                <article
                  key={resource.title}
                  className="group rounded-2xl border border-slate-200/10 bg-gradient-to-b from-[#1a2f4d]/90 to-[#142843]/88 p-6 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] transition duration-300 hover:border-emerald-400/35 hover:from-[#17334f]/90 hover:to-[#12314a]/90"
                >
                  <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2.5 w-fit">
                    <resource.icon className="h-6 w-6 text-cyan-200" />
                  </div>
                  <h3 className="mt-5 text-3xl font-semibold text-slate-100">{resource.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-300/85">{resource.description}</p>

                  <Link
                    href={resource.href}
                    className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-emerald-300 transition group-hover:text-emerald-200"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
            <div className="mx-auto max-w-[860px] rounded-2xl border border-slate-200/10 bg-gradient-to-r from-[#1a2f4d]/90 to-[#1f3f66]/90 px-6 py-12 text-center shadow-[0_18px_45px_rgba(2,8,24,0.32)] sm:px-10">
              <h2 className="text-5xl font-bold tracking-tight text-slate-50">Ready to build exceptional experiences?</h2>
              <p className="mx-auto mt-5 max-w-2xl text-2xl text-slate-300/90">
                Join teams that use InnoDeploy to build faster, focus on user experience, and reduce costs.
              </p>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-10 text-2xl font-semibold text-[#062515] transition hover:bg-emerald-300"
                >
                  Start building now
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200/10 bg-[#010a1d] py-9">
          <div className="mx-auto w-full max-w-[1160px] px-5 sm:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-100">{column.title}</h3>
                    {column.badge ? <span className="text-xs font-semibold text-emerald-300">{column.badge}</span> : null}
                  </div>
                  <ul className="mt-2.5 space-y-1 text-base text-slate-200/90">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="transition hover:text-cyan-200">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200/10 pt-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-emerald-300">
                <Link href="/" className="transition hover:text-emerald-200">Terms of Service</Link>
                <Link href="/" className="transition hover:text-emerald-200">Privacy Notice</Link>
                <Link href="/" className="transition hover:text-emerald-200">Copyright Policy</Link>
                <Link href="/" className="transition hover:text-emerald-200">Data Processing Addendum</Link>
                <Link href="/" className="transition hover:text-emerald-200">GDPR</Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300/90">
                <p>© 2026 InnoDeploy Inc.</p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Made with code and coffee.
                </p>
                <div className="flex items-center gap-2.5">
                  <Link href="#" aria-label="GitHub" className="transition hover:text-cyan-200"><Github className="h-3.5 w-3.5" /></Link>
                  <Link href="#" aria-label="LinkedIn" className="transition hover:text-cyan-200"><Linkedin className="h-3.5 w-3.5" /></Link>
                  <Link href="#" aria-label="Twitter" className="transition hover:text-cyan-200"><Twitter className="h-3.5 w-3.5" /></Link>
                  <Link href="#" aria-label="YouTube" className="transition hover:text-cyan-200"><Youtube className="h-3.5 w-3.5" /></Link>
                  <Link href="#" aria-label="Community" className="transition hover:text-cyan-200"><MessageCircle className="h-3.5 w-3.5" /></Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
