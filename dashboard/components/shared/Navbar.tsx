"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/apiClient";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { roleLabel, t } from "@/lib/settingsI18n";
import { Button } from "@/components/ui/button";
import type { MemberRole } from "@/types";

export default function Navbar() {
  const language = useLanguagePreference();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      clearAuth();
      router.replace("/login");
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-blue-200/15 bg-[#0a2148]/70 backdrop-blur">
      {/* ── Page title area ──────────────────── */}
      <div className="text-lg font-semibold text-blue-50">{t(language, "navbar.dashboard")}</div>

      {/* ── User info + logout ───────────────── */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-blue-100/70">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
            <span className="text-xs bg-cyan-300/15 text-cyan-200 px-2 py-0.5 rounded-full border border-cyan-300/30">
              {roleLabel(language, user.role as MemberRole)}
            </span>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-blue-100 hover:bg-blue-100/10 hover:text-blue-50">
          <LogOut className="h-4 w-4 mr-2" />
          {t(language, "navbar.logout")}
        </Button>
      </div>
    </header>
  );
}
