"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button variant="destructive" size="sm" onClick={handleClick} disabled={disabled || loading}>
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
      {loading ? t(language, "hosts.removing") : t(language, "hosts.removeHost")}
    </Button>
  );
}
