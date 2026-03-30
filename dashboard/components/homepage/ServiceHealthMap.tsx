"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import { projectApi } from "@/lib/apiClient";
import type { Project } from "@/types";

interface ServiceTile {
  name: string;
  status: "healthy" | "degraded" | "down";
}

const statusColors = {
  healthy: "bg-emerald-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
};

export default function ServiceHealthMap() {
  const language = useLanguagePreference();
  const [services, setServices] = useState<ServiceTile[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await projectApi.getProjects();
        const projects = (data?.projects || []) as Project[];

        const mapped = projects.map((project) => ({
          name: project.name,
          status:
            project.status === "running"
              ? "healthy"
              : project.status === "failed"
                ? "down"
                : "degraded",
        })) as ServiceTile[];

        setServices(mapped);
      } catch {
        setServices([]);
      }
    };

    void load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t(language, "health.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 && <p className="text-sm text-muted-foreground">{t(language, "health.none")}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  statusColors[svc.status]
                )}
              />
              <span className="truncate">{svc.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
