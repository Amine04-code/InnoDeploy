"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook: redirect to /login if the user is not authenticated.
 * Call at the top of any protected page component.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  return isHydrated && isAuthenticated;
}
