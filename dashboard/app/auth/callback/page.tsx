"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

const decodeUserParam = (raw: string): User | null => {
  try {
    const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as User;
  } catch {
    return null;
  }
};

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const encodedUser = params.get("user");
    const callbackError = params.get("error");
    const callbackReason = params.get("reason");

    if (callbackError) {
      const reason = callbackReason ? ` (${callbackReason})` : "";
      setError(`Social login failed${reason}. Please try again.`);
      return;
    }

    if (!accessToken || !refreshToken || !encodedUser) {
      setError("Login data is missing. Please retry.");
      return;
    }

    const user = decodeUserParam(encodedUser);
    if (!user) {
      setError("Unable to decode user session. Please retry.");
      return;
    }

    setAuth(user, accessToken, refreshToken);
    router.replace("/dashboard");
  }, [router, setAuth]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#061634] px-4 text-blue-50">
      <div className="w-full max-w-md rounded-xl border border-blue-100/20 bg-[#0b234a]/60 p-6 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">Authentication Error</h1>
            <p className="mt-3 text-sm text-blue-100/75">{error}</p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-6 rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-[#05122f] transition hover:bg-blue-50"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-300" />
            <h1 className="mt-4 text-xl font-semibold">Completing sign in...</h1>
            <p className="mt-2 text-sm text-blue-100/75">Please wait while we prepare your workspace.</p>
          </>
        )}
      </div>
    </main>
  );
}
