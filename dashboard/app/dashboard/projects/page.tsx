"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import SearchBar from "@/components/projectpage/SearchBar";
import FilterChips from "@/components/projectpage/FilterChips";
import ProjectCard from "@/components/projectpage/ProjectCard";
import CreateProjectModal from "@/components/projectpage/CreateProjectModal";
import { Button } from "@/components/ui/button";
import type { Project, ProjectStatus } from "@/types";

/** Mock data — replace with API call (projectApi.getProjects) */
const mockProjects: Project[] = [
  {
    id: "p1",
    name: "inno-web",
    repoUrl: "https://github.com/innodeploy/inno-web",
    branch: "main",
    status: "running",
    lastDeployAt: "2026-03-11T15:30:00Z",
    envCount: 3,
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "p2",
    name: "billing-service",
    repoUrl: "https://github.com/innodeploy/billing-service",
    branch: "main",
    status: "stopped",
    lastDeployAt: "2026-03-09T08:45:00Z",
    envCount: 2,
    createdAt: "2026-02-01T12:00:00Z",
  },
  {
    id: "p3",
    name: "auth-gateway",
    repoUrl: "https://github.com/innodeploy/auth-gateway",
    branch: "develop",
    status: "failed",
    lastDeployAt: "2026-03-10T20:12:00Z",
    envCount: 1,
    createdAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "p4",
    name: "data-pipeline",
    repoUrl: "https://github.com/innodeploy/data-pipeline",
    branch: "main",
    status: "running",
    lastDeployAt: null,
    envCount: 4,
    createdAt: "2026-03-01T14:00:00Z",
  },
];

export default function ProjectsPage() {
  const isReady = useRequireAuth();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = filter === "all" || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 space-y-6">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} />
            <FilterChips active={filter} onChange={setFilter} />
          </div>

          {/* Project grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No projects found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(project) =>
          setProjects((prev) => [project, ...prev])
        }
      />
    </div>
  );
}
