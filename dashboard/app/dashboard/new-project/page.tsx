"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import DeployWebApplicationView from "@/components/newprojectpage/DeployWebApplicationView";

export default function NewProjectPage() {
  const isReady = useRequireAuth();

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />
        <DeployWebApplicationView />
      </div>
    </div>
  );
}
