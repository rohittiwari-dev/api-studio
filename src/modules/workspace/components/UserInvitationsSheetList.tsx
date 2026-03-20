"use client";

import { Loader2, Mail } from "lucide-react";
import { useUserInvitationsQuery } from "@/modules/workspace/hooks/use-invitaions-query";
import UserInvitationItem from "./UserInvitationItem";

export default function UserInvitationsSheetList() {
  const { data: invitations, isPending: isLoading } = useUserInvitationsQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center flex-1">
        <Loader2 className="animate-spin size-7 w-[30px] h-[30px] text-indigo-500/60" />
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex flex-col min-h-[200px] items-center justify-center flex-1 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Mail className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No pending invitations</p>
        <p className="text-xs text-muted-foreground mt-1">
          You don&apos;t have any pending invitations at the moment
        </p>
      </div>
    );
  }

  const pendingInvitations = invitations.filter(
    (invitation: any) => invitation.status === "pending",
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {pendingInvitations.map((invitation: any) => (
          <UserInvitationItem
            key={invitation.id}
            invitation={invitation}
            variant="sheet"
          />
        ))}
      </div>
    </div>
  );
}
