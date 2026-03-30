"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Rocket, Server } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

export default function QuickActions() {
  const language = useLanguagePreference();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => router.push("/dashboard/new-project")}>
        <Plus className="h-4 w-4 mr-2" />
        {t(language, "quickActions.newProject")}
      </Button>
      <Button variant="secondary" onClick={() => router.push("/dashboard/projects")}>
        <Rocket className="h-4 w-4 mr-2" />
        {t(language, "quickActions.triggerDeploy")}
      </Button>
      <Button variant="secondary" onClick={() => router.push("/dashboard/hosts?add=1")}>
        <Server className="h-4 w-4 mr-2" />
        {t(language, "quickActions.addHost")}
      </Button>
    </div>
  );
}
