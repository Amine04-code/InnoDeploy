"use client";

import { useState } from "react";
import { Loader2, PlugZap } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface TestConnectionButtonProps {
  hostId: string;
  onTest: (hostId: string) => Promise<void>;
}

export default function TestConnectionButton({ hostId, onTest }: TestConnectionButtonProps) {
  const language = useLanguagePreference();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onTest(hostId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-400 transition-all hover:bg-cyan-500/10 disabled:opacity-50 disabled:pointer-events-none"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
      {loading ? t(language, "hosts.testing") : t(language, "hosts.testConnection")}
    </button>
  );
}
