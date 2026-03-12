"use client";

import { Button } from "@/components/ui/button";
import { Plus, Rocket, Server } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </Button>
      <Button variant="secondary">
        <Rocket className="h-4 w-4 mr-2" />
        Trigger Deploy
      </Button>
      <Button variant="secondary">
        <Server className="h-4 w-4 mr-2" />
        Add Host
      </Button>
    </div>
  );
}
