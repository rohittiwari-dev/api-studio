"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import authClient from "@/lib/authClient";
import { addCredentialsAccount } from "../server/auth.actions";

// Types
export type Session = {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type Account = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date;
};

// Query Keys
export const securityKeys = {
  all: ["security"] as const,
  sessions: () => [...securityKeys.all, "sessions", "two-factor"] as const,
  accounts: () => [...securityKeys.all, "accounts", "two-factor"] as const,
  twoFactorStatus: () =>
    [...securityKeys.all, "2fa-status", "two-factor"] as const,
};

// ============ SESSIONS ============

export function useSessionsQuery() {
  return useQuery({
    queryKey: securityKeys.sessions(),
    queryFn: async () => {
      const result = await authClient.listSessions();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return (result.data || []) as Session[];
    },
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const result = await authClient.revokeSession({ token });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: securityKeys.sessions(),
      });
      toast.success("Session revoked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });
}

export function useRevokeAllSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeSessions();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: securityKeys.sessions(),
      });
      toast.success("All other sessions revoked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke sessions");
    },
  });
}

// ============ ACCOUNTS ============

export function useAccountsQuery() {
  return useQuery({
    queryKey: securityKeys.accounts(),
    queryFn: async () => {
      const result = await authClient.listAccounts();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return (result.data || []) as Account[];
    },
  });
}

export function useLinkSocialMutation() {
  return useMutation({
    mutationFn: async ({
      provider,
      callbackURL,
    }: {
      provider: "google" | "microsoft" | "email-password";
      callbackURL: string;
    }) => {
      // This will redirect, so no return expected
      await authClient.linkSocial({
        provider,
        callbackURL,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to link account");
    },
  });
}

export function useUnlinkAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: string) => {
      const result = await authClient.unlinkAccount({ providerId });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: securityKeys.accounts(),
      });
      toast.success("Account unlinked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unlink account");
    },
  });
}

export function useAddCredentialsAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (password: string) => {
      const result = await addCredentialsAccount(password);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: securityKeys.accounts(),
      });
      toast.success("Account added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add account");
    },
  });
}

// ============ PASSWORD ============

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}

// ============ TWO FACTOR ============

export function useTwoFactorStatusQuery() {
  return useQuery({
    queryKey: securityKeys.twoFactorStatus(),
    queryFn: async () => {
      const session = await authClient.getSession();
      return { enabled: !!session.data?.user?.twoFactorEnabled };
    },
  });
}

export function useEnableTwoFactorMutation() {
  return useMutation({
    mutationFn: async (password: string) => {
      const result = await authClient.twoFactor.enable({ password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enable 2FA");
    },
  });
}

export function useVerifyTotpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const result = await authClient.twoFactor.verifyTotp({ code });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: securityKeys.twoFactorStatus(),
      });
      toast.success("Two-factor authentication enabled!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid verification code");
    },
  });
}

export function useDisableTwoFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: securityKeys.twoFactorStatus(),
      });
      toast.success("Two-factor authentication disabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disable 2FA");
    },
  });
}

export function useGetTotpUriMutation() {
  return useMutation({
    mutationFn: async (password: string) => {
      const result = await authClient.twoFactor.getTotpUri({ password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to get TOTP URI");
    },
  });
}

export function useGenerateBackupCodesMutation() {
  return useMutation({
    mutationFn: async (password: string) => {
      const result = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate backup codes");
    },
  });
}
