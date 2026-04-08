"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface RemoveHostButtonProps {
  disabled?: boolean;
  hostId: string;
  onRemove: (hostId: string) => Promise<void>;
}

export default function RemoveHostButton({ disabled, hostId, onRemove }: RemoveHostButtonProps) {
  const language = useLanguagePreference();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onRemove(hostId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-1.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/10 disabled:opacity-50 disabled:pointer-events-none"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      {loading ? t(language, "hosts.removing") : t(language, "hosts.removeHost")}
    </button>
  );
}
