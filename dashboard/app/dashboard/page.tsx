"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import GreetingHeader from "@/components/homepage/GreetingHeader";
import StatsGrid from "@/components/homepage/StatsGrid";
import RecentPipelinesTable from "@/components/homepage/RecentPipelinesTable";
import ServiceHealthMap from "@/components/homepage/ServiceHealthMap";
import DeployActivityChart from "@/components/homepage/DeployActivityChart";
import AlertsFeed from "@/components/homepage/AlertsFeed";
import QuickActions from "@/components/homepage/QuickActions";

export default function DashboardPage() {
  const isReady = useRequireAuth();

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 space-y-6">
          <GreetingHeader />
          <StatsGrid />
          <QuickActions />

          <div className="grid gap-6 lg:grid-cols-2">
            <DeployActivityChart />
            <ServiceHealthMap />
          </div>

          <RecentPipelinesTable />
          <AlertsFeed />
        </main>
      </div>
    </div>
  );
}
