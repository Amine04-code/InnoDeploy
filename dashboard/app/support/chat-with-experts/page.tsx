import Link from "next/link";
import { Headset } from "lucide-react";
import SupportNavbar from "@/components/supportpage/SupportNavbar";

export default function SupportChatWithExpertsPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <SupportNavbar />
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="rounded-2xl border border-slate-200/10 bg-[#07152c]/70 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Headset className="h-3.5 w-3.5" />
            Contact
          </p>

          <h1 className="mt-4 text-4xl font-bold text-slate-50 sm:text-5xl">Chat with experts</h1>
          <p className="mt-3 text-slate-300/90">Tell us what you are building and our team will help with architecture, deployment, and scaling guidance.</p>

          <form className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Your email"
              className="h-11 w-full rounded-lg border border-slate-200/15 bg-[#08142b] px-4 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Subject"
              className="h-11 w-full rounded-lg border border-slate-200/15 bg-[#08142b] px-4 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300"
            />
            <textarea
              rows={6}
              placeholder="Describe what you need help with"
              className="w-full rounded-lg border border-slate-200/15 bg-[#08142b] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300"
            />
            <button
              type="button"
              className="rounded-lg bg-emerald-400 px-5 py-2.5 font-semibold text-[#062515] transition hover:bg-emerald-300"
            >
              Submit request
            </button>
          </form>

          <div className="mt-8">
            <Link href="/support/faq" className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
              Browse FAQ instead
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
