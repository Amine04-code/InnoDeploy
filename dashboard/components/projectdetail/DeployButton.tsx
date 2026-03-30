"use client";

import { Rocket, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface DeployButtonProps {
  environmentName: string;
  onDeploy: () => Promise<void>;
}

export default function DeployButton({ environmentName, onDeploy }: DeployButtonProps) {
  const [loading, setLoading] = useState(false);
  const language = useLanguagePreference();

  const handleClick = async () => {
    setLoading(true);
    try {
      await onDeploy();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Rocket className="h-4 w-4 mr-2" />
      )}
      {loading ? t(language, "projectDetail.deploying") : t(language, "projectDetail.deployTo", { env: environmentName })}
    </Button>
  );
}
