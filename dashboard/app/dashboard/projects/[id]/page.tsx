"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import ProjectHeader from "@/components/projectdetail/ProjectHeader";
import SubNavTabs, { type SubNavTab } from "@/components/projectdetail/SubNavTabs";
import EnvironmentTabs from "@/components/projectdetail/EnvironmentTabs";
import EnvironmentPanel from "@/components/projectdetail/EnvironmentPanel";
import DeployButton from "@/components/projectdetail/DeployButton";
import RollbackButton from "@/components/projectdetail/RollbackButton";
import SecretsList from "@/components/projectdetail/SecretsList";
import PipelineConfigEditor from "@/components/projectdetail/PipelineConfigEditor";
import RecentDeploysTable from "@/components/projectdetail/RecentDeploysTable";
import MetricsSummaryCards from "@/components/projectdetail/MetricsSummaryCards";
import type { ProjectDetail, Secret } from "@/types";

/** Mock data — replace with API call */
const mockProject: ProjectDetail = {
  id: "p1",
  name: "inno-web",
  description: "Main web application",
  repoUrl: "https://github.com/innodeploy/inno-web",
  branch: "main",
  status: "running",
  lastDeployAt: "2026-03-11T15:30:00Z",
  envCount: 3,
  createdAt: "2026-01-10T10:00:00Z",
  environments: [
    {
      id: "env-staging",
      name: "Staging",
      image: "innodeploy/inno-web:staging-abc1234",
      domain: "staging.inno-web.innodeploy.app",
      replicas: 2,
      strategy: "rolling",
      status: "healthy",
    },
    {
      id: "env-production",
      name: "Production",
      image: "innodeploy/inno-web:v2.4.1",
      domain: "inno-web.innodeploy.app",
      replicas: 4,
      strategy: "blue-green",
      status: "healthy",
    },
    {
      id: "env-canary",
      name: "Canary",
      image: "innodeploy/inno-web:canary-def5678",
      domain: "canary.inno-web.innodeploy.app",
      replicas: 1,
      strategy: "canary",
      status: "degraded",
    },
  ],
  deployments: [
    {
      id: "d1",
      version: "v2.4.1",
      strategy: "blue-green",
      duration: "2m 14s",
      triggeredBy: "sarah@innodeploy.com",
      createdAt: "2026-03-11T15:30:00Z",
      status: "success",
    },
    {
      id: "d2",
      version: "v2.4.0",
      strategy: "rolling",
      duration: "1m 52s",
      triggeredBy: "CI/CD",
      createdAt: "2026-03-10T12:00:00Z",
      status: "success",
    },
    {
      id: "d3",
      version: "v2.3.9",
      strategy: "rolling",
      duration: "3m 01s",
      triggeredBy: "james@innodeploy.com",
      createdAt: "2026-03-09T09:15:00Z",
      status: "failed",
    },
    {
      id: "d4",
      version: "v2.3.8",
      strategy: "canary",
      duration: "4m 30s",
      triggeredBy: "CI/CD",
      createdAt: "2026-03-08T16:45:00Z",
      status: "success",
    },
  ],
  secrets: [
    { id: "s1", key: "DATABASE_URL", value: "postgresql://user:pass@db:5432/app" },
    { id: "s2", key: "REDIS_URL", value: "redis://redis:6379" },
    { id: "s3", key: "API_SECRET", value: "sk_live_abc123def456" },
  ],
  metrics: {
    cpu: "34%",
    memory: "512 MB",
    latency: "45 ms",
    uptime: "99.97%",
  },
  pipelineConfig: `# .innodeploy.yml
name: inno-web
build:
  image: node:18-alpine
  steps:
    - npm ci
    - npm run build
    - npm run test

deploy:
  strategy: blue-green
  replicas: 4
  health_check:
    path: /health
    interval: 30s
    timeout: 5s

environments:
  staging:
    branch: develop
    auto_deploy: true
  production:
    branch: main
    auto_deploy: false
    approval_required: true
`,
};

export default function ProjectDetailPage() {
  const isReady = useRequireAuth();
  const params = useParams();
  const _projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<SubNavTab>("Overview");
  const [activeEnvId, setActiveEnvId] = useState(mockProject.environments[0].id);
  const [secrets, setSecrets] = useState<Secret[]>(mockProject.secrets);
  const [pipelineConfig, setPipelineConfig] = useState(mockProject.pipelineConfig);

  const activeEnv = useMemo(
    () => mockProject.environments.find((e) => e.id === activeEnvId)!,
    [activeEnvId]
  );

  if (!isReady) return null;

  const handleDeploy = async () => {
    // TODO: call deploy API
    await new Promise((r) => setTimeout(r, 1500));
  };

  const handleRollback = async () => {
    // TODO: call rollback API
    await new Promise((r) => setTimeout(r, 1500));
  };

  const handleAddSecret = (key: string, value: string) => {
    setSecrets((prev) => [...prev, { id: `s_${Date.now()}`, key, value }]);
  };

  const handleEditSecret = (id: string, value: string) => {
    setSecrets((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 space-y-6">
          <ProjectHeader project={mockProject} />
          <SubNavTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === "Overview" && (
            <div className="space-y-6">
              <EnvironmentTabs
                environments={mockProject.environments}
                activeId={activeEnvId}
                onChange={setActiveEnvId}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <EnvironmentPanel environment={activeEnv} />
                <div className="flex flex-col gap-3">
                  <DeployButton
                    environmentName={activeEnv.name}
                    onDeploy={handleDeploy}
                  />
                  <RollbackButton onRollback={handleRollback} />
                </div>
              </div>

              <MetricsSummaryCards metrics={mockProject.metrics} />
              <RecentDeploysTable deployments={mockProject.deployments} />
            </div>
          )}

          {activeTab === "Pipelines" && (
            <PipelineConfigEditor
              config={pipelineConfig}
              readOnly={false}
              onChange={setPipelineConfig}
            />
          )}

          {activeTab === "Monitoring" && (
            <MetricsSummaryCards metrics={mockProject.metrics} />
          )}

          {activeTab === "Logs" && (
            <div className="rounded-md border bg-muted/50 p-4 font-mono text-xs min-h-[300px] text-muted-foreground">
              <p>[2026-03-11 15:30:12] Deployment v2.4.1 started</p>
              <p>[2026-03-11 15:30:14] Building image innodeploy/inno-web:v2.4.1</p>
              <p>[2026-03-11 15:31:45] Health check passed on /health</p>
              <p>[2026-03-11 15:32:26] Blue-green swap complete</p>
              <p>[2026-03-11 15:32:26] Deployment v2.4.1 succeeded</p>
            </div>
          )}

          {activeTab === "Settings" && (
            <SecretsList
              secrets={secrets}
              onAdd={handleAddSecret}
              onEdit={handleEditSecret}
              onDelete={handleDeleteSecret}
            />
          )}
        </main>
      </div>
    </div>
  );
}
