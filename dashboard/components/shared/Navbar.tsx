"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";

export default function Navbar() {
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
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      {/* ── Page title area ──────────────────── */}
      <div className="text-lg font-semibold">Dashboard</div>

      {/* ── User info + logout ───────────────── */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{user.role}</span>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
