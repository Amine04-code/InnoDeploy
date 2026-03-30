"use client";

import { useState } from "react";
import { Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface CancelRunButtonProps {
  runId: string;
  onCancel: (runId: string) => Promise<void>;
}

export default function CancelRunButton({ runId, onCancel }: CancelRunButtonProps) {
  const [loading, setLoading] = useState(false);
  const language = useLanguagePreference();

  const handleClick = async () => {
    setLoading(true);
    try {
      await onCancel(runId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : (
        <Square className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
      )}
      {loading ? t(language, "pipeline.cancelling") : t(language, "pipeline.cancelRun")}
    </Button>
  );
}
