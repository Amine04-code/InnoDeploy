"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, Rocket, Settings2, BarChart3 } from "lucide-react";
import { authApi } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthResponse } from "@/types";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path d="M21.35 12.23c0-.72-.06-1.25-.2-1.8H12v3.4h5.37c-.1.84-.66 2.1-1.9 2.95l-.02.11 2.77 2.15.2.02c1.81-1.67 2.93-4.11 2.93-6.83Z" fill="#4285F4" />
      <path d="M12 21.75c2.63 0 4.84-.86 6.46-2.35l-3.08-2.39c-.82.57-1.92.96-3.38.96-2.57 0-4.75-1.67-5.53-3.98l-.1.01-2.88 2.23-.03.1A9.75 9.75 0 0 0 12 21.75Z" fill="#34A853" />
      <path d="M6.47 13.99A5.9 5.9 0 0 1 6.14 12c0-.7.12-1.37.32-1.99l-.01-.13-2.92-2.27-.1.05A9.75 9.75 0 0 0 2.25 12c0 1.58.38 3.07 1.18 4.34l3.04-2.35Z" fill="#FBBC05" />
      <path d="M12 6.02c1.85 0 3.1.8 3.82 1.47l2.8-2.74C16.82 3.08 14.63 2.25 12 2.25c-3.82 0-7.23 2.18-8.57 5.4l3.03 2.35c.8-2.31 2.97-3.98 5.54-3.98Z" fill="#EA4335" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `${apiBase}/auth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Full name is required");
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.register(
        trimmedName,
        email,
        password,
        organisationName || undefined
      );
      const res = data as AuthResponse;
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push("/auth/terms");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex items-center justify-center border-b border-slate-200/10 px-6 py-8 lg:border-b-0 lg:border-r">
          <div className="w-full max-w-md space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-cyan-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to welcome page
            </Link>

            <div className="text-center lg:text-left">
              <Link href="/" className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030711]">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 text-cyan-300">
                  <Rocket className="h-5 w-5" />
                </div>
                <h1 className="text-4xl font-bold leading-tight text-slate-50">
                  Create your
                  <span className="block text-cyan-300">InnoDeploy account</span>
                </h1>
              </Link>
              <p className="mt-3 text-sm text-slate-300/85">
                Sign up with social auth or create an account with your name and email.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200/20 bg-[#06132b]/75 text-sm font-semibold text-slate-50 transition hover:border-cyan-300/45 hover:bg-[#0c2145]"
              >
                <GoogleIcon />
                Sign up with Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("github")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200/20 bg-[#06132b]/75 text-sm font-semibold text-slate-50 transition hover:border-cyan-300/45 hover:bg-[#0c2145]"
              >
                <Github className="h-4 w-4" />
                Sign up with GitHub
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200/15" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#030711] px-2 text-slate-400">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="rounded-md border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-slate-200/20 bg-[#06132b]/75 text-slate-50 placeholder:text-slate-300/70 placeholder:italic placeholder:font-medium placeholder:tracking-[0.02em]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-slate-200/20 bg-[#06132b]/75 text-slate-50 placeholder:text-slate-300/70 placeholder:italic placeholder:font-medium placeholder:tracking-[0.02em]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="border-slate-200/20 bg-[#06132b]/75 text-slate-50 placeholder:text-slate-300/70 placeholder:italic placeholder:font-medium placeholder:tracking-[0.02em]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org" className="text-slate-200">
                  Organisation name (optional)
                </Label>
                <Input
                  id="org"
                  type="text"
                  placeholder="My Company"
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  className="border-slate-200/20 bg-[#06132b]/75 text-slate-50 placeholder:text-slate-300/70 placeholder:italic placeholder:font-medium placeholder:tracking-[0.02em]"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full border border-cyan-300/45 bg-cyan-300/15 text-cyan-100 transition hover:bg-cyan-300/25"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="space-y-2 text-center lg:text-left">
              <p className="text-sm text-slate-300/85">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-slate-400/80">
                By continuing, you agree to InnoDeploy terms and privacy policy.
              </p>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(45,212,191,0.2),rgba(3,7,17,0)_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative flex h-full items-center px-16">
            <div className="max-w-lg space-y-10">
              <div className="space-y-3">
                <h2 className="text-4xl font-bold leading-tight text-slate-50">Ship your first deployment faster</h2>
                <p className="text-lg text-slate-300/85">
                  Set up your workspace once, then monitor, deploy, and scale with confidence.
                </p>
              </div>

              <div className="space-y-6 text-slate-300/85">
                <div className="flex items-start gap-3">
                  <Rocket className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="font-semibold text-slate-50">Fast onboarding</p>
                    <p className="text-sm">Create your workspace and run your first deployment quickly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="font-semibold text-slate-50">Simple setup</p>
                    <p className="text-sm">Connect hosts, configure secrets, and control environments from one dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="font-semibold text-slate-50">Clear visibility</p>
                    <p className="text-sm">Track alerts, monitor health, and improve reliability as you scale.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
