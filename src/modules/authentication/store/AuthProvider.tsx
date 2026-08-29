"use client";

import type React from "react";
import { useEffect } from "react";
import authClient from "@/lib/authClient";
import type { AuthStoreState } from "@/modules/authentication/store/index";
import { useAuthStore } from "@/modules/authentication/store/index";

const AuthProvider = ({
  state,
  children,
}: {
  state?: AuthStoreState;
  /**
   * Optional: this component only hydrates the zustand auth store, it provides
   * no React context. It can be rendered as a leaf inside its own `<Suspense>`
   * boundary so the server session read doesn't block the provider tree.
   */
  children?: React.ReactNode;
}) => {
  const {
    setAuthStoreState,
    setError,
    setAuthSession,
    setIsLoading,
    triggerRefetch,
    setTriggerRefetch,
  } = useAuthStore();
  const { error, data, isPending, refetch } = authClient.useSession();

  useEffect(() => {
    if (state) {
      setAuthStoreState(state);
    }
  }, [setAuthStoreState, state]);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error, setError]);

  useEffect(() => {
    if (data) {
      setAuthSession(data);
    }
  }, [data, setAuthSession]);

  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending, setIsLoading]);

  useEffect(() => {
    if (triggerRefetch) {
      refetch();
      setTriggerRefetch(false);
    }
  }, [triggerRefetch, refetch, setTriggerRefetch]);

  return children ?? null;
};

export default AuthProvider;
