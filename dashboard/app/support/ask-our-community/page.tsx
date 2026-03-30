import Link from "next/link";
import { MessageCircle } from "lucide-react";
import SupportNavbar from "@/components/supportpage/SupportNavbar";

const channels = [
  {
    title: "Community Discussions",
    description: "Ask implementation questions and get responses from builders using InnoDeploy every day.",
  },
  {
    title: "Show and Tell",
    description: "Share your deployment setup and get feedback on reliability and performance improvements.",
  },
  {
    title: "Tips and Troubleshooting",
    description: "Search previous answers and discover practical fixes for common issues.",
  },
];

export default function SupportCommunityPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <SupportNavbar />
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="rounded-2xl border border-slate-200/10 bg-[#07152c]/70 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <MessageCircle className="h-3.5 w-3.5" />
            Community
          </p>

          <h1 className="mt-4 text-4xl font-bold text-slate-50 sm:text-5xl">Ask our community</h1>
          <p className="mt-3 text-slate-300/90">Learn from other teams, share deployment patterns, and get practical guidance from peers.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {channels.map((channel) => (
              <article key={channel.title} className="rounded-xl border border-slate-200/10 bg-[#091a33]/60 p-5">
                <h2 className="text-lg font-semibold text-slate-50">{channel.title}</h2>
                <p className="mt-2 text-sm text-slate-300/85">{channel.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/support/chat-with-experts" className="rounded-lg bg-emerald-400 px-5 py-2.5 font-semibold text-[#062515] transition hover:bg-emerald-300">
              Chat with experts
            </Link>
            <Link href="/support/faq" className="rounded-lg border border-slate-200/20 px-5 py-2.5 font-semibold text-slate-100 transition hover:bg-white/5">
              View FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
