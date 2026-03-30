"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import RecentPipelinesTable from "@/components/homepage/RecentPipelinesTable";

export default function PipelinesPage() {
  const language = useLanguagePreference();
  const isReady = useRequireAuth();

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t(language, "pipelines.pageTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t(language, "pipelines.pageSubtitle")}
            </p>
          </div>

          <RecentPipelinesTable />
        </main>
      </div>
    </div>
  );
}
