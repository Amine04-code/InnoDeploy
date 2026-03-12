"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Deployments</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">Version</th>
              <th className="pb-2 font-medium">Strategy</th>
              <th className="pb-2 font-medium">Duration</th>
              <th className="pb-2 font-medium">Triggered by</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {deployments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No deployments yet.
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
                    {new Date(dep.createdAt).toLocaleString()}
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
