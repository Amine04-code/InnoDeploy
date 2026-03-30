"use client";

import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { LanguagePreference } from "@/types";

interface LanguagePickerProps {
  value: LanguagePreference;
  disabled?: boolean;
  onChange: (value: LanguagePreference) => void;
}

const options: Array<{ value: LanguagePreference; labelKey: string }> = [
  { value: "arabic", labelKey: "language.arabic" },
  { value: "french", labelKey: "language.french" },
  { value: "english", labelKey: "language.english" },
];

export default function LanguagePicker({ value, disabled, onChange }: LanguagePickerProps) {
  const language = useLanguagePreference();

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="language"
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 border-input text-primary focus:ring-primary"
          />
          {t(language, option.labelKey)}
        </label>
      ))}
    </div>
  );
}