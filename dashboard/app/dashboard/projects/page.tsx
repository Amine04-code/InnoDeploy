"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import SearchBar from "@/components/projectpage/SearchBar";
import FilterChips from "@/components/projectpage/FilterChips";
import ProjectCard from "@/components/projectpage/ProjectCard";
import CreateProjectModal from "@/components/projectpage/CreateProjectModal";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { projectApi } from "@/lib/apiClient";
import { t } from "@/lib/settingsI18n";
import type { Project, ProjectStatus } from "@/types";

export default function ProjectsPage() {
  const language = useLanguagePreference();
  const isReady = useRequireAuth();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!isReady) return;

    const loadProjects = async () => {
      try {
        const { data } = await projectApi.getProjects();
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
      } catch {
        setProjects([]);
      }
    };

    void loadProjects();
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    if (searchParams.get("new") === "1") {
      setModalOpen(true);
    }
  }, [isReady, searchParams]);

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
            <h1 className="text-2xl font-bold tracking-tight">{t(language, "projects.pageTitle")}</h1>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t(language, "projects.create")}
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
              {t(language, "projects.none")}
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
