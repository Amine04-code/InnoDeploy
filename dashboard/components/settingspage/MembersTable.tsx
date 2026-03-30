"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InviteMemberButton from "@/components/settingspage/InviteMemberButton";
import RoleEditor from "@/components/settingspage/RoleEditor";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { roleLabel, t } from "@/lib/settingsI18n";
import type { MemberRole, OrganisationInvitation, OrganisationMember } from "@/types";

interface MembersTableProps {
  members: OrganisationMember[];
  invitations: OrganisationInvitation[];
  canManage: boolean;
  currentUserId?: string;
  onInvite: (payload: { email: string; role: MemberRole }) => Promise<void>;
  onRoleChange: (memberId: string, role: MemberRole) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
  onRevokeInvitation: (invitationId: string) => Promise<void>;
  busyMemberId?: string | null;
  inviting?: boolean;
}

export default function MembersTable({
  members,
  invitations,
  canManage,
  currentUserId,
  onInvite,
  onRoleChange,
  onRemove,
  onRevokeInvitation,
  busyMemberId,
  inviting,
}: MembersTableProps) {
  const language = useLanguagePreference();

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-xl">{t(language, "members.title")}</CardTitle>
          <CardDescription>{t(language, "members.description")}</CardDescription>
        </div>
        {canManage && <InviteMemberButton onInvite={onInvite} loading={inviting} />}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t(language, "members.member")}</th>
                <th className="px-4 py-3 font-medium">{t(language, "members.role")}</th>
                <th className="px-4 py-3 font-medium">{t(language, "members.joined")}</th>
                <th className="px-4 py-3 font-medium">{t(language, "members.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {members.map((member) => {
                const isBusy = busyMemberId === member.id;
                const isCurrentUser = member.id === currentUserId;

                return (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-muted-foreground">{member.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {canManage ? (
                        <RoleEditor value={member.role} disabled={isBusy} onChange={(role) => void onRoleChange(member.id, role)} />
                      ) : (
                        <span className="capitalize">{roleLabel(language, member.role)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(member.joinedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {canManage ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isBusy || isCurrentUser}
                          onClick={() => void onRemove(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t(language, "members.remove")}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">{t(language, "members.noAccess")}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div className="text-sm font-medium">{t(language, "members.pendingInvitations")}</div>
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(language, "members.noInvites")}</p>
          ) : (
            <div className="space-y-2">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">{invite.email}</div>
                    <div className="text-muted-foreground">
                      {roleLabel(language, invite.role)} · {invite.status} · {new Date(invite.invitedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {canManage && invite.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => void onRevokeInvitation(invite.id)}>
                      {t(language, "members.revoke")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}