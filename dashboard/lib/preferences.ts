import type { LanguagePreference, ThemePreference, UserSettingsPreferences } from "@/types";

const PREFERENCES_STORAGE_KEY = "innodeploy:user-preferences";
const PREFERENCES_UPDATED_EVENT = "innodeploy:preferences-updated";

type StoredPreferences = Partial<UserSettingsPreferences>;

const THEME_VALUES: ThemePreference[] = ["light", "dark", "system"];
const LANGUAGE_VALUES: LanguagePreference[] = ["english", "french", "arabic"];

const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === "string" && THEME_VALUES.includes(value as ThemePreference);

const isLanguagePreference = (value: unknown): value is LanguagePreference =>
  typeof value === "string" && LANGUAGE_VALUES.includes(value as LanguagePreference);

const resolveTheme = (theme: ThemePreference) => {
  if (theme !== "system") return theme;

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const applyThemePreference = (theme: ThemePreference) => {
  if (typeof document === "undefined") return;

  const activeTheme = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", activeTheme === "dark");
  document.documentElement.dataset.theme = theme;
};

export const applyLanguagePreference = (language: LanguagePreference) => {
  if (typeof document === "undefined") return;

  const langMap: Record<LanguagePreference, string> = {
    english: "en",
    french: "fr",
    arabic: "ar",
  };

  document.documentElement.lang = langMap[language];
  document.documentElement.dir = language === "arabic" ? "rtl" : "ltr";
};

export const applyPreferences = (preferences: UserSettingsPreferences) => {
  applyThemePreference(preferences.theme);
  applyLanguagePreference(preferences.language);
};

export const getStoredPreferences = (): StoredPreferences | null => {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as StoredPreferences;
    const nextValue: StoredPreferences = {};

    if (isThemePreference(parsed.theme)) {
      nextValue.theme = parsed.theme;
    }

    if (isLanguagePreference(parsed.language)) {
      nextValue.language = parsed.language;
    }

    return nextValue;
  } catch {
    return null;
  }
};

export const persistPreferences = (preferences: UserSettingsPreferences) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new Event(PREFERENCES_UPDATED_EVENT));
};

export const applyStoredPreferences = () => {
  const stored = getStoredPreferences();
  if (!stored) return;

  applyPreferences({
    theme: stored.theme ?? "system",
    language: stored.language ?? "english",
  });
};
