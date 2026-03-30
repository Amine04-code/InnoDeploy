"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Github, Info, LayoutGrid, Loader2, Ghost, Search } from "lucide-react";
import Link from "next/link";
import { githubApi, projectApi } from "@/lib/apiClient";

type GithubRepository = {
  id: number;
  name: string;
  fullName: string;
  defaultBranch: string;
  updatedAt: string;
  cloneUrl: string;
};

type GithubListResponse = {
  repositories: GithubRepository[];
  githubUsername?: string | null;
};

type GithubApiError = {
  response?: {
    data?: {
      message?: string;
      connectUrl?: string;
    };
  };
};

const GITHUB_INSTALLATIONS_URL = "https://github.com/settings/installations";

export default function DeployWebApplicationView() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [creatingRepoId, setCreatingRepoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadRepositories = async () => {
      setIsLoading(true);
      setError("");
      setConnectUrl(null);

      try {
        const { data } = await githubApi.listRepositories();
        const payload = data as GithubListResponse;
        if (!mounted) return;
        setRepositories(Array.isArray(payload.repositories) ? payload.repositories : []);
      } catch (err: unknown) {
        if (!mounted) return;
        const apiErr = err as GithubApiError;
        setError(apiErr.response?.data?.message || "Unable to load GitHub repositories.");
        setConnectUrl(apiErr.response?.data?.connectUrl || null);
        setRepositories([]);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRepositories();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedRepos = useMemo(() => {
    return [...repositories].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });
  }, [repositories]);

  const filteredRepos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedRepos;
    return sortedRepos.filter((repo) => {
      return repo.fullName.toLowerCase().includes(query) || repo.name.toLowerCase().includes(query);
    });
  }, [sortedRepos, searchQuery]);

  const handleImportGithub = () => {
    if (connectUrl) {
      window.location.href = connectUrl;
      return;
    }
    window.open("https://github.com/new/import", "_blank", "noopener,noreferrer");
  };

  const handleEditGithubPermissions = () => {
    window.open(GITHUB_INSTALLATIONS_URL, "_blank", "noopener,noreferrer");
  };

  const handleSelectRepository = async (repo: GithubRepository) => {
    setCreatingRepoId(repo.id);
    setError("");
    try {
      await projectApi.createProject({
        name: repo.name,
        repoUrl: repo.cloneUrl,
        branch: repo.defaultBranch || "main",
      });
      router.push("/dashboard/projects");
    } catch (err: unknown) {
      const apiErr = err as GithubApiError;
      setError(apiErr.response?.data?.message || "Failed to create project from selected repository.");
    } finally {
      setCreatingRepoId(null);
    }
  };

  return (
    <main className="flex-1 p-6">
      <section className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 transition hover:bg-cyan-300/20"
            aria-label="Back to projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="inline-flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-50">
              <LayoutGrid className="h-7 w-7 text-cyan-200" />
              Deploy a Web Application
            </h1>
            <div className="mt-2 h-[2px] w-10 rounded-full bg-emerald-400" />
          </div>
        </div>

        <p className="mt-5 text-base text-slate-300/90">
          Easily deploy a new web application from your source code by selecting an existing GitHub repository.
        </p>

        <article className="mt-6 overflow-hidden rounded-xl border border-cyan-300/20 bg-[#071b36]/80 shadow-[inset_0_1px_0_rgba(148,163,184,0.08),0_20px_35px_rgba(2,8,24,0.25)]">
          <header className="flex flex-col gap-3 border-b border-slate-200/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300/12 text-cyan-200">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-semibold text-slate-50">Select a GitHub repository</h2>
            </div>

            <div className="relative w-full sm:max-w-[320px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-md border border-cyan-300/30 bg-[#091d3b] pl-3 pr-10 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
              <p className="mt-4 text-base text-slate-300/90">Importing repositories...</p>
            </div>
          ) : sortedRepos.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="rounded-xl border border-slate-200/15 bg-slate-200/5 p-3 text-cyan-200">
                <Ghost className="h-8 w-8" />
              </span>
              <p className="mt-4 text-3xl font-semibold text-slate-50">Nothing here, yet!</p>

              <button
                type="button"
                onClick={handleImportGithub}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                <Github className="h-4 w-4" />
                {connectUrl ? "Connect GitHub" : "Import GitHub Repo"}
                <ExternalLink className="h-4 w-4" />
              </button>

              {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

              <p className="mt-6 inline-flex items-start gap-2 text-sm text-amber-200/90">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                A Dockerfile is mandatory for deploying your applications, please ensure it&apos;s included in your repo.
              </p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="text-xl font-semibold text-slate-100">No repositories found</p>
              <p className="mt-2 text-sm text-slate-400">Try another search term.</p>
            </div>
          ) : (
            <div className="px-0 py-0">
              <div className="max-h-[460px] overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-200/10 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-100">{repo.fullName}</p>
                      <p className="text-xs text-slate-400">Updated {new Date(repo.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      disabled={creatingRepoId === repo.id}
                      onClick={() => void handleSelectRepository(repo)}
                      className="inline-flex h-8 items-center justify-center rounded-md bg-emerald-500 px-4 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {creatingRepoId === repo.id ? "Creating..." : "Select"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-6 py-6 text-center">
                <button
                  type="button"
                  onClick={handleEditGithubPermissions}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  <Github className="h-4 w-4" />
                  Edit GitHub Permissions
                  <ExternalLink className="h-4 w-4" />
                </button>
                {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
                <p className="mt-5 inline-flex items-start gap-2 text-sm text-amber-200/90">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  A Dockerfile is mandatory for deploying your applications, please ensure it&apos;s included in your repo.
                </p>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
