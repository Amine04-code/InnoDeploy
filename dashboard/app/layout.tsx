"use client";

import { useEffect } from "react";
import { Manrope, Sora } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { applyStoredPreferences, getStoredPreferences, applyThemePreference } from "@/lib/preferences";
import { useAuthStore } from "@/store/authStore";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  // Rehydrate auth state from localStorage on first mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    applyStoredPreferences();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const stored = getStoredPreferences();
      if ((stored?.theme ?? "system") === "system") {
        applyThemePreference("system");
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen antialiased ${bodyFont.variable} ${displayFont.variable}`}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
