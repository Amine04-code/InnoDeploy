"use client";

import { Globe, Box, Copy, Layers, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Environment, EnvironmentStatus } from "@/types";

const statusStyle: Record<EnvironmentStatus, string> = {
  healthy: "text-green-600",
  degraded: "text-yellow-600",
  down: "text-red-600",
};

interface EnvironmentPanelProps {
  environment: Environment;
}

export default function EnvironmentPanel({ environment }: EnvironmentPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          {environment.name}
          <span className={cn("text-sm font-medium capitalize", statusStyle[environment.status])}>
            {environment.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Image:</span>
          <span className="font-mono text-xs truncate">{environment.image}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Domain:</span>
          <a
            href={`https://${environment.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary"
          >
            {environment.domain}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Copy className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Replicas:</span>
          <span>{environment.replicas}</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Strategy:</span>
          <span className="capitalize">{environment.strategy}</span>
        </div>
      </CardContent>
    </Card>
  );
}
