import Link from "next/link";

export default function SupportNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/10 bg-[#06132b]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-semibold tracking-tight text-slate-50 transition hover:text-cyan-200">
            InnoDeploy
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            <Link
              href="/support/faq"
              className="px-2 py-5 text-[1.04rem] font-medium text-slate-100/95 transition hover:text-white"
            >
              FAQ
            </Link>
            <Link
              href="/support/chat-with-experts"
              className="px-2 py-5 text-[1.04rem] font-medium text-slate-100/95 transition hover:text-white"
            >
              Chat with experts
            </Link>
            <Link
              href="/support/ask-our-community"
              className="px-2 py-5 text-[1.04rem] font-medium text-slate-100/95 transition hover:text-white"
            >
              Ask our community
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md border border-slate-200/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-[#062515] transition hover:bg-emerald-300"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
