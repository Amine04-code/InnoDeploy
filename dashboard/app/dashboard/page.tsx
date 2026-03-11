"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import GreetingHeader from "@/components/GreetingHeader";
import StatsGrid from "@/components/StatsGrid";
import RecentPipelinesTable from "@/components/RecentPipelinesTable";
import ServiceHealthMap from "@/components/ServiceHealthMap";
import DeployActivityChart from "@/components/DeployActivityChart";
import AlertsFeed from "@/components/AlertsFeed";
import QuickActions from "@/components/QuickActions";

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
