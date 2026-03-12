"use client";

import { useAuthStore } from "@/store/authStore";

export default function GreetingHeader() {
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {user?.name ?? "User"} 👋
      </h1>
      <p className="text-muted-foreground mt-1">{today}</p>
    </div>
  );
}
