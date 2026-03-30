"use client";

import { useEffect, useState } from "react";
import type { LanguagePreference } from "@/types";

const PREFERENCES_STORAGE_KEY = "innodeploy:user-preferences";
const EVENT_NAME = "innodeploy:preferences-updated";

const isLanguagePreference = (value: unknown): value is LanguagePreference =>
  value === "english" || value === "french" || value === "arabic";

const readLanguagePreference = (): LanguagePreference => {
  if (typeof window === "undefined") return "english";

  try {
    const rawValue = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!rawValue) return "english";

    const parsed = JSON.parse(rawValue) as { language?: unknown };
    return isLanguagePreference(parsed.language) ? parsed.language : "english";
  } catch {
    return "english";
  }
};

export const useLanguagePreference = () => {
  const [language, setLanguage] = useState<LanguagePreference>("english");

  useEffect(() => {
    const sync = () => setLanguage(readLanguagePreference());

    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return language;
};
