"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, FolderKanban, RefreshCcw, Play, Square, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import SearchBar from "@/components/projectpage/SearchBar";
import FilterChips from "@/components/projectpage/FilterChips";
import ProjectCard from "@/components/projectpage/ProjectCard";
import CreateProjectModal from "@/components/projectpage/CreateProjectModal";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { projectApi } from "@/lib/apiClient";
import { t } from "@/lib/settingsI18n";
import type { Project, ProjectStatus } from "@/types";

export default function ProjectsPage() {
  const language = useLanguagePreference();
  const isReady = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectApi.getProjects();
      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void loadProjects();
  }, [isReady, loadProjects]);

  useEffect(() => {
    if (!isReady) return;
    if (searchParams.get("new") === "1") {
      router.replace("/dashboard/new-project");
    }
  }, [isReady, searchParams, router]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = filter === "all" || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const statCards = useMemo(() => [
    { label: "Total", value: projects.length, icon: FolderKanban, color: "text-cyan-400", borderColor: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-500/5" },
    { label: "Running", value: projects.filter((p) => p.status === "running").length, icon: Play, color: "text-emerald-400", borderColor: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Stopped", value: projects.filter((p) => p.status === "stopped").length, icon: Square, color: "text-amber-400", borderColor: "border-amber-500/20", gradient: "from-amber-500/20 to-amber-500/5" },
    { label: "Failed", value: projects.filter((p) => p.status === "failed").length, icon: XCircle, color: "text-rose-400", borderColor: "border-rose-500/20", gradient: "from-rose-500/20 to-rose-500/5" },
  ], [projects]);

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-[#030711]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="relative flex-1 p-6 space-y-6 overflow-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.06),transparent)]" />

          {/* Header row */}
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                <FolderKanban className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t(language, "projects.pageTitle")}</h1>
                <p className="text-sm text-slate-500">Manage and monitor your projects.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void loadProjects()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => router.push("/dashboard/new-project")}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-[#030711] transition-all hover:shadow-[0_0_24px_rgba(34,211,238,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                {t(language, "projects.create")}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="relative grid gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60 p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] animate-rise-fade"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b ${stat.gradient.replace('/20', '/60').replace('/5', '/30')}`} />
                <div className="relative flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.borderColor} bg-white/[0.03]`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="relative mt-3 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} />
            <FilterChips active={filter} onChange={setFilter} />
            {filteredProjects.length !== projects.length && (
              <span className="ml-auto text-xs text-slate-600">
                {filteredProjects.length} of {projects.length} projects
              </span>
            )}
          </div>

          {/* Project grid */}
          {loading ? (
            <div className="relative text-center py-16 rounded-2xl border border-white/[0.06] bg-[#0a1628]/40">
              <RefreshCcw className="mx-auto h-8 w-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="relative text-center py-16 rounded-2xl border border-white/[0.06] bg-[#0a1628]/40">
              <FolderKanban className="mx-auto h-10 w-10 text-slate-600 mb-3" />
              <p className="text-slate-500">{projects.length === 0 ? t(language, "projects.none") : "No projects match your search."}</p>
            </div>
          ) : (
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
