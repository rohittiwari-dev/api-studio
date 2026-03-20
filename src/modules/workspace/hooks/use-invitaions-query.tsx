import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  deleteInvitation,
  inviteMember,
  listInvitations,
  listMembers,
  listUserInvitations,
  rejectInvitation,
  removeMember,
  updateMemberRole,
} from "../server/invitation.actions";
import useWorkspaceState from "../store";

export const useListMembersQuery = () => {
  const { activeWorkspace } = useWorkspaceState();
  return useQuery({
    queryKey: ["members", activeWorkspace?.id],
    queryFn: async () => {
      const members = await listMembers(activeWorkspace?.id || "");
      if (members?.error) {
        return { members: [], total: 0 };
      }
      return {
        members: members?.data,
        total: members?.data?.length || 0,
      };
    },
    enabled: !!activeWorkspace?.id,
  });
};

export const useListInvitationsQuery = () => {
  const { activeWorkspace } = useWorkspaceState();
  return useQuery({
    queryKey: ["invitations", activeWorkspace?.id],
    queryFn: async () => {
      const invitations = await listInvitations(activeWorkspace?.id || "");
      if (invitations?.error) {
        return [];
      }
      return invitations?.data || [];
    },
    enabled: !!activeWorkspace?.id,
  });
};

import { useAuthStore } from "@/modules/authentication/store";

export const useUserInvitationsQuery = () => {
  const { data: session } = useAuthStore();
  const email = session?.user?.email;

  return useQuery({
    queryKey: ["user-invitations", email],
    queryFn: async () => {
      const invitations = await listUserInvitations(email || "");
      if (invitations?.error) {
        return [];
      }
      return invitations?.data || [];
    },
    enabled: !!email,
  });
};

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceState();
  return useMutation({
    mutationFn: async ({
      email,
      role = "member",
      resend = false,
    }: {
      email: string;
      role?: "member" | "admin" | "owner";
      resend?: boolean;
    }) => {
      const member = await inviteMember({
        workspaceId: activeWorkspace?.id || "",
        email,
        role,
        resend,
      });
      if (member?.error) {
        throw member?.error;
      }
      return member?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["invitations", activeWorkspace?.id],
      });
    },
  });
};

export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceState();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const member = await acceptInvitation(invitationId);
      if (member?.error) {
        throw member?.error;
      }
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
    },
  });
};

export const useRejectInvitationMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceState();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const member = await rejectInvitation(invitationId);
      if (member?.error) {
        throw member?.error;
      }
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
    },
  });
};

export const useCancelInvitationMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceState();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const member = await deleteInvitation(invitationId);
      if (member?.error) {
        throw member?.error;
      }
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["invitations", activeWorkspace?.id],
      });
    },
  });
};

export const useUpdateMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceState();
  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "member" | "admin" | "owner";
    }) => {
      const member = await updateMemberRole(memberId, role);
      if (member?.error) {
        throw member?.error;
      }
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceState();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const member = await removeMember(memberId, activeWorkspace?.id || "");
      if (member?.error) {
        throw member?.error;
      }
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
    },
  });
};

export const useLeaveOrganizationMutation = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace, reset } = useWorkspaceState();
  return useMutation({
    mutationFn: async () => {
      const { default: authClient } = await import("@/lib/authClient");
      const result = await authClient.organization.leave({
        organizationId: activeWorkspace?.id || "",
      });
      if (result?.error) {
        throw result?.error;
      }
      return result?.data;
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspace?.id],
      });
    },
  });
};

export const useOrganizationPermissions = () => {
  const { activeWorkspace } = useWorkspaceState();

  return useQuery({
    queryKey: ["organization-permissions", activeWorkspace?.id],
    queryFn: async () => {
      const { default: authClient } = await import("@/lib/authClient");

      // Check permissions in parallel
      const [canInvite, canUpdateRole, canRemoveMember] = await Promise.all([
        authClient.organization.hasPermission({
          permissions: { invitation: ["create"] },
        }),
        authClient.organization.hasPermission({
          permissions: { member: ["update"] },
        }),
        authClient.organization.hasPermission({
          permissions: { member: ["delete"] },
        }),
      ]);

      return {
        canInvite: canInvite?.data?.success ?? false,
        canUpdateRole: canUpdateRole?.data?.success ?? false,
        canRemoveMember: canRemoveMember?.data?.success ?? false,
      };
    },
    enabled: !!activeWorkspace?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useActiveMember = () => {
  const { activeWorkspace } = useWorkspaceState();

  return useQuery({
    queryKey: ["active-member", activeWorkspace?.id],
    queryFn: async () => {
      const { default: authClient } = await import("@/lib/authClient");
      const result = await authClient.organization.getActiveMember();
      return result?.data ?? null;
    },
    enabled: !!activeWorkspace?.id,
  });
};
