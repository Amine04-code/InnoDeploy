"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import APIKeysSection from "@/components/settingspage/APIKeysSection";
import DangerZone from "@/components/settingspage/DangerZone";
import DockerRegistryConfig from "@/components/settingspage/DockerRegistryConfig";
import GitProviderConfig from "@/components/settingspage/GitProviderConfig";
import LanguagePicker from "@/components/settingspage/LanguagePicker";
import MembersTable from "@/components/settingspage/MembersTable";
import NotificationChannels from "@/components/settingspage/NotificationChannels";
import OrgProfileForm from "@/components/settingspage/OrgProfileForm";
import ThemeToggle from "@/components/settingspage/ThemeToggle";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { settingsApi } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import type {
  DockerRegistrySettings,
  GitProviderSettings,
  MemberRole,
  NotificationChannelsConfig,
  OrganisationSettingsProfile,
  SettingsPayload,
  UserSettingsPreferences,
} from "@/types";

type SavingKey =
  | "organisation"
  | "notifications"
  | "notificationsTest"
  | "registry"
  | "provider"
  | "preferences"
  | "invite"
  | "member"
  | "apiKey"
  | "danger";

export default function SettingsPage() {
  const isReady = useRequireAuth();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [organisationForm, setOrganisationForm] = useState<OrganisationSettingsProfile | null>(null);
  const [notificationsForm, setNotificationsForm] = useState<NotificationChannelsConfig | null>(null);
  const [registryForm, setRegistryForm] = useState<DockerRegistrySettings | null>(null);
  const [providerForm, setProviderForm] = useState<GitProviderSettings | null>(null);
  const [preferencesForm, setPreferencesForm] = useState<UserSettingsPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<Partial<Record<SavingKey, boolean>>>({});
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const canManage = useMemo(() => user?.role === "owner" || user?.role === "admin", [user?.role]);
  const isOwner = user?.role === "owner";

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await settingsApi.getSettings();
      const payload = data as SettingsPayload;
      setSettings(payload);
      setOrganisationForm(payload.organisation);
      setNotificationsForm(payload.notificationChannels);
      setRegistryForm(payload.dockerRegistry);
      setProviderForm(payload.gitProvider);
      setPreferencesForm(payload.preferences);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    void loadSettings();
  }, [isReady]);

  if (!isReady) return null;

  const setSavingState = (key: SavingKey, value: boolean) => {
    setSaving((current) => ({ ...current, [key]: value }));
  };

  const runAction = async (key: SavingKey, action: () => Promise<void>) => {
    setSavingState(key, true);
    setError(null);
    setSuccess(null);
    try {
      await action();
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : "Request failed");
    } finally {
      setSavingState(key, false);
    }
  };

  const handleOrganisationSave = async () => {
    if (!organisationForm) return;
    await runAction("organisation", async () => {
      const { data } = await settingsApi.updateOrganisation(organisationForm);
      setSettings((current) => current ? { ...current, organisation: data.organisation as OrganisationSettingsProfile } : current);
      setSuccess(String(data.message ?? "Organisation updated"));
    });
  };

  const handleInvite = async (payload: { email: string; role: MemberRole }) => {
    await runAction("invite", async () => {
      await settingsApi.inviteMember(payload);
      await loadSettings();
      setSuccess("Invitation saved");
    });
  };

  const handleMemberRoleChange = async (memberId: string, role: MemberRole) => {
    setBusyMemberId(memberId);
    await runAction("member", async () => {
      await settingsApi.updateMemberRole(memberId, { role });
      await loadSettings();
      setSuccess("Member role updated");
    });
    setBusyMemberId(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Remove this member from the organisation?")) return;
    setBusyMemberId(memberId);
    await runAction("member", async () => {
      await settingsApi.removeMember(memberId);
      await loadSettings();
      setSuccess("Member removed");
    });
    setBusyMemberId(null);
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    await runAction("member", async () => {
      await settingsApi.revokeInvitation(invitationId);
      await loadSettings();
      setSuccess("Invitation revoked");
    });
  };

  const handleNotificationsSave = async () => {
    if (!notificationsForm) return;
    await runAction("notifications", async () => {
      const { data } = await settingsApi.updateNotifications(notificationsForm);
      setSettings((current) => current ? { ...current, notificationChannels: data.notificationChannels as NotificationChannelsConfig } : current);
      setSuccess(String(data.message ?? "Channels updated"));
    });
  };

  const handleNotificationsTest = async (channels?: string[]) => {
    await runAction("notificationsTest", async () => {
      const { data } = await settingsApi.testNotifications({
        channels,
        severity: "info",
        title: "InnoDeploy channel test",
        message: "This is a test notification from settings.",
        serviceName: "settings-ui",
      });

      const channelStates = Object.entries((data.result?.channels || {}) as Record<string, { status?: string }>);
      const summary = channelStates
        .map(([name, state]) => `${name}:${String(state?.status || "unknown")}`)
        .join(", ");

      setSuccess(summary ? `Notification test completed (${summary})` : String(data.message ?? "Notification test completed"));
    });
  };

  const handleRegistrySave = async () => {
    if (!registryForm) return;
    await runAction("registry", async () => {
      const { data } = await settingsApi.updateDockerRegistry(registryForm);
      setSettings((current) => current ? { ...current, dockerRegistry: data.dockerRegistry as DockerRegistrySettings } : current);
      setSuccess(String(data.message ?? "Registry updated"));
    });
  };

  const handleProviderSave = async () => {
    if (!providerForm) return;
    await runAction("provider", async () => {
      const { data } = await settingsApi.updateGitProvider(providerForm);
      setSettings((current) => current ? { ...current, gitProvider: data.gitProvider as GitProviderSettings } : current);
      setSuccess(String(data.message ?? "Git provider updated"));
    });
  };

  const handlePreferencesSave = async () => {
    if (!preferencesForm) return;
    await runAction("preferences", async () => {
      const { data } = await settingsApi.updatePreferences(preferencesForm);
      setSettings((current) => current ? { ...current, preferences: data.preferences as UserSettingsPreferences } : current);
      setSuccess(String(data.message ?? "Preferences updated"));
    });
  };

  const handleCreateApiKey = async (name: string) => {
    await runAction("apiKey", async () => {
      const { data } = await settingsApi.createApiKey({ name });
      setRevealedSecret(String(data.secret));
      await loadSettings();
      setSuccess("API key created");
    });
  };

  const handleRevokeApiKey = async (apiKeyId: string) => {
    await runAction("apiKey", async () => {
      await settingsApi.revokeApiKey(apiKeyId);
      await loadSettings();
      setSuccess("API key revoked");
    });
  };

  const handleDeleteOrganisation = async (confirmation: string) => {
    await runAction("danger", async () => {
      await settingsApi.deleteOrganisation({ confirmation });
      clearAuth();
      router.push("/register");
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">Configure organisation identity, access, integrations, and operator preferences.</p>
            </div>
            <Button variant="outline" onClick={() => void loadSettings()} disabled={loading}>
              Refresh
            </Button>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          {loading || !settings || !organisationForm || !notificationsForm || !registryForm || !providerForm || !preferencesForm ? (
            <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">Loading settings...</div>
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
                <OrgProfileForm
                  value={organisationForm}
                  onChange={setOrganisationForm}
                  onSubmit={handleOrganisationSave}
                  saving={Boolean(saving.organisation)}
                  disabled={!canManage}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Workspace Controls</CardTitle>
                    <CardDescription>Personal appearance settings and local operating defaults.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <SlidersHorizontal className="h-4 w-4 text-primary" />
                        Theme
                      </div>
                      <ThemeToggle value={preferencesForm.theme} onChange={(theme) => setPreferencesForm({ ...preferencesForm, theme })} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Globe2 className="h-4 w-4 text-primary" />
                        Language
                      </div>
                      <LanguagePicker value={preferencesForm.language} onChange={(language) => setPreferencesForm({ ...preferencesForm, language })} />
                    </div>

                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      Theme controls are stored per user. App-wide color-system behavior can be connected later if you want the dashboard shell to react to this preference.
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => void handlePreferencesSave()} disabled={Boolean(saving.preferences)}>
                        {saving.preferences ? "Saving..." : "Save preferences"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="members">
                <MembersTable
                  members={settings.members}
                  invitations={settings.invitations}
                  canManage={canManage}
                  currentUserId={user?.id}
                  onInvite={handleInvite}
                  onRoleChange={handleMemberRoleChange}
                  onRemove={handleRemoveMember}
                  onRevokeInvitation={handleRevokeInvitation}
                  busyMemberId={busyMemberId}
                  inviting={Boolean(saving.invite)}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <NotificationChannels
                  value={notificationsForm}
                  onChange={setNotificationsForm}
                  onSubmit={handleNotificationsSave}
                  onTest={handleNotificationsTest}
                  saving={Boolean(saving.notifications)}
                  testing={Boolean(saving.notificationsTest)}
                  disabled={!canManage}
                />
                <DockerRegistryConfig
                  value={registryForm}
                  onChange={setRegistryForm}
                  onSubmit={handleRegistrySave}
                  saving={Boolean(saving.registry)}
                  disabled={!canManage}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <GitProviderConfig
                  value={providerForm}
                  onChange={setProviderForm}
                  onSubmit={handleProviderSave}
                  saving={Boolean(saving.provider)}
                  disabled={!canManage}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Access Posture</CardTitle>
                    <CardDescription>Current role and platform guardrails for this workspace.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium capitalize">Your role: {user?.role ?? "unknown"}</div>
                        <div className="text-muted-foreground">Owners can delete the organisation. Owners and admins can manage members, integrations, and API keys.</div>
                      </div>
                    </div>
                    <div className="rounded-lg border px-4 py-3 text-muted-foreground">
                      Git provider, Docker registry, and outbound notification credentials are organisation-scoped and currently stored directly in MongoDB for this workspace.
                    </div>
                  </CardContent>
                </Card>
              </div>

              <APIKeysSection
                apiKeys={settings.apiKeys}
                canManage={canManage}
                creating={Boolean(saving.apiKey)}
                onCreate={handleCreateApiKey}
                onRevoke={handleRevokeApiKey}
                revealedSecret={revealedSecret}
              />

              {isOwner && <DangerZone slug={settings.organisation.slug} deleting={Boolean(saving.danger)} onDelete={handleDeleteOrganisation} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}