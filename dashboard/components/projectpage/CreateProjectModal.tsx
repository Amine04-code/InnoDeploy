"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { projectApi } from "@/lib/apiClient";
import { t } from "@/lib/settingsI18n";
import type { CreateProjectPayload, Project } from "@/types";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const language = useLanguagePreference();
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [envSetup, setEnvSetup] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !repoUrl.trim()) {
      setError(t(language, "projects.nameRepoRequired"));
      return;
    }

    setLoading(true);
    try {
      const payload: CreateProjectPayload = {
        name: name.trim(),
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || "main",
      };
      if (envSetup.trim()) payload.envSetup = envSetup.trim();

      const { data } = await projectApi.createProject(payload);
      onCreated(data.project ?? data);
      setName("");
      setRepoUrl("");
      setBranch("main");
      setEnvSetup("");
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || t(language, "projects.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t(language, "projects.modalTitle")}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">{t(language, "projects.projectName")}</Label>
            <Input
              id="project-name"
              placeholder="my-awesome-app"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repo-url">{t(language, "projects.repoUrl")}</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/org/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">{t(language, "projects.branch")}</Label>
            <Input
              id="branch"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="env-setup">{t(language, "projects.envSetup")}</Label>
            <Input
              id="env-setup"
              placeholder="e.g. Node 18, Docker"
              value={envSetup}
              onChange={(e) => setEnvSetup(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t(language, "hosts.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? t(language, "projects.creating") : t(language, "projects.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
