"use client";

import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import UserInvitationItem from "@/modules/workspace/components/UserInvitationItem";
import { useUserInvitationsQuery } from "@/modules/workspace/hooks/use-invitaions-query";

export default function UserInvitationsPage() {
  const { data: invitations, isPending: isLoading } = useUserInvitationsQuery();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Your Invitations
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your pending invitations to join other workspaces
        </p>
      </div>

      <Separator />

      {/* Invitations List */}
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center flex-1">
          <Loader2 className="animate-spin size-7 w-[30px] h-[30px] text-indigo-500/60" />
        </div>
      ) : !invitations || invitations.length === 0 ? (
        <div className="flex flex-col min-h-[200px] items-center justify-center flex-1 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Mail className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No pending invitations</p>
          <p className="text-xs text-muted-foreground mt-1">
            You don&apos;t have any pending invitations at the moment
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pending Requests</h3>
          <div className="space-y-2">
            {invitations.map((invitation: any) => (
              <UserInvitationItem
                key={invitation.id}
                invitation={invitation}
                variant="default"
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
