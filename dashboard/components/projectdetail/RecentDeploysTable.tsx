"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";
import type { Deployment } from "@/types";

const statusStyle: Record<Deployment["status"], string> = {
  success: "text-green-600",
  failed: "text-red-600",
  "in-progress": "text-blue-600",
};

interface RecentDeploysTableProps {
  deployments: Deployment[];
}

export default function RecentDeploysTable({ deployments }: RecentDeploysTableProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t(language, "projectDetail.recentDeployments")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">{t(language, "projects.version")}</th>
              <th className="pb-2 font-medium">{t(language, "projects.strategy")}</th>
              <th className="pb-2 font-medium">{t(language, "projects.duration")}</th>
              <th className="pb-2 font-medium">{t(language, "projectDetail.triggeredBy")}</th>
              <th className="pb-2 font-medium">{t(language, "projects.status")}</th>
              <th className="pb-2 font-medium">{t(language, "table.date")}</th>
            </tr>
          </thead>
          <tbody>
            {deployments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  {t(language, "projectDetail.noDeployments")}
                </td>
              </tr>
            ) : (
              deployments.map((dep) => (
                <tr key={dep.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{dep.version}</td>
                  <td className="py-2 capitalize">{dep.strategy}</td>
                  <td className="py-2">{dep.duration}</td>
                  <td className="py-2">{dep.triggeredBy}</td>
                  <td className={cn("py-2 capitalize font-medium", statusStyle[dep.status])}>
                    {dep.status}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(dep.createdAt).toLocaleString(locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
