import Link from "next/link";
import { CircleHelp } from "lucide-react";
import SupportNavbar from "@/components/supportpage/SupportNavbar";

const faqItems = [
  "How do I deploy my first app?",
  "How can I monitor logs and metrics?",
  "Can I connect multiple hosts to one project?",
  "How do rollbacks work?",
  "Where can I manage team access and permissions?",
  "How can I contact support quickly?",
];

export default function SupportFaqPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <SupportNavbar />
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="rounded-2xl border border-slate-200/10 bg-[#07152c]/70 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <CircleHelp className="h-3.5 w-3.5" />
            Support
          </p>

          <h1 className="mt-4 text-4xl font-bold text-slate-50 sm:text-5xl">FAQ</h1>
          <p className="mt-3 text-slate-300/90">Find quick answers to common platform and deployment questions.</p>

          <ul className="mt-8 divide-y divide-slate-200/10 rounded-xl border border-slate-200/10 bg-[#091a33]/60">
            {faqItems.map((item) => (
              <li key={item} className="px-5 py-4 text-slate-200/95">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/support/chat-with-experts" className="rounded-lg bg-emerald-400 px-5 py-2.5 font-semibold text-[#062515] transition hover:bg-emerald-300">
              Chat with experts
            </Link>
            <Link href="/support/ask-our-community" className="rounded-lg border border-slate-200/20 px-5 py-2.5 font-semibold text-slate-100 transition hover:bg-white/5">
              Ask our community
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
