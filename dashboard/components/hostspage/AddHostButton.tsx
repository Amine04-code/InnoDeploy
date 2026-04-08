"use client";

import { Plus } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface AddHostButtonProps {
  onClick: () => void;
}

export default function AddHostButton({ onClick }: AddHostButtonProps) {
  const language = useLanguagePreference();
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 active:scale-[0.97]"
    >
      <Plus className="h-4 w-4" />
      {t(language, "hosts.add")}
    </button>
  );
}
