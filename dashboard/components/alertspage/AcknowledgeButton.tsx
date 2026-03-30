"use client";

import { useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface AcknowledgeButtonProps {
  alertId: string;
  disabled?: boolean;
  onAcknowledge: (alertId: string) => Promise<void>;
}

export default function AcknowledgeButton({ alertId, disabled, onAcknowledge }: AcknowledgeButtonProps) {
  const language = useLanguagePreference();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onAcknowledge(alertId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" disabled={disabled || loading} onClick={handleClick}>
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="mr-1.5 h-3.5 w-3.5" />}
      {loading ? t(language, "settings.saving") : t(language, "alerts.acknowledge")}
    </Button>
  );
}
