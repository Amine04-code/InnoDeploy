"use client";

import { useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button size="sm" onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <BellRing className="mr-1.5 h-3.5 w-3.5" />}
      {loading ? t(language, "alerts.notificationSending") : t(language, "alerts.notificationTest")}
    </Button>
  );
}
