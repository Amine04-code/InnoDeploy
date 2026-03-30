"use client";

import { useAuthStore } from "@/store/authStore";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";

export default function GreetingHeader() {
  const language = useLanguagePreference();
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString(localeFromLanguage(language), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        {t(language, "greeting.welcomeBack", { name: user?.name ?? t(language, "greeting.user") })} 👋
      </h1>
      <p className="text-muted-foreground mt-1">{today}</p>
    </div>
  );
}
