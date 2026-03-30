"use client";

import { useState } from "react";
import { Play, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

const BRANCHES = ["main", "develop", "staging", "feature/pipeline-page"];

interface TriggerPipelineButtonProps {
  onTrigger: (branch: string) => Promise<void>;
}

export default function TriggerPipelineButton({ onTrigger }: TriggerPipelineButtonProps) {
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const language = useLanguagePreference();

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await onTrigger(branch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          disabled={loading}
          className="appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {BRANCHES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <Button onClick={handleTrigger} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Play className="h-4 w-4 mr-2" fill="currentColor" />
        )}
        {loading ? t(language, "pipeline.triggering") : t(language, "pipeline.trigger")}
      </Button>
    </div>
  );
}
