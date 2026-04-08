"use client";

import { useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface NotificationTestButtonProps {
  onTest: () => Promise<void>;
}

export default function NotificationTestButton({ onTest }: NotificationTestButtonProps) {
  const language = useLanguagePreference();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onTest();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-sm font-medium text-amber-300 transition-all hover:border-amber-500/30 hover:bg-amber-500/[0.12] disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
      {loading ? t(language, "alerts.notificationSending") : t(language, "alerts.notificationTest")}
    </button>
  );
}
