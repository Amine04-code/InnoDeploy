"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TermsGatePage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.replace("/login");
    }
  }, [router]);

  const handleContinue = () => {
    if (!accepted) {
      setShowError(true);
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#10274a] text-slate-100">
      <div className="flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-md rounded-md border border-cyan-300/30 bg-[#0f2a4e]/80 p-6 shadow-[0_18px_45px_rgba(2,8,24,0.35)]">
          <p className="text-center text-2xl leading-8 text-cyan-100">
            Our Terms of Service, Privacy Notice,
            <br />
            and Data Processing Addendum have
            <br />
            been updated. Please review and
            <br />
            accept them before logging in.
          </p>

          <label className="mt-5 flex items-start gap-2 text-base text-slate-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked);
                if (event.target.checked) {
                  setShowError(false);
                }
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300/70 bg-transparent accent-cyan-300"
            />
            <span>
              I accepted the updated{" "}
              <Link href="/" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href="/" className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
                Data Processing Addendum
              </Link>
            </span>
          </label>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-6 h-12 w-full rounded-md bg-emerald-500 text-xl font-semibold text-white transition hover:bg-emerald-400"
          >
            Continue
          </button>

          {showError ? (
            <p className="mt-4 text-base text-rose-400">
              Please accept our latest Terms of Service and Privacy Policy before logging in.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
