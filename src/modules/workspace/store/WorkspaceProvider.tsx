"use client";

import React, { useEffect } from "react";
import type { Organization } from "@/generated/prisma/browser";
import authClient from "@/lib/authClient";
import useCookieStore from "@/modules/apis/cookies/store/cookie.store";
import useWorkspaceState from ".";

const WorkspaceProvider = ({
  children,
  activeOrg,
  workspaces,
}: {
  activeOrg: Organization;
  workspaces: Organization[];
  /**
   * Optional: this component only hydrates zustand stores, it provides no
   * React context. It can be rendered as a leaf inside its own `<Suspense>`
   * boundary so its data fetches don't block the surrounding layout.
   */
  children?: React.ReactNode;
}) => {
  const { setWorkspaces, setActiveWorkspace } = useWorkspaceState();
  const { setCurrentWorkspaceId } = useCookieStore();

  useEffect(() => {
    if (activeOrg) {
      setCurrentWorkspaceId(activeOrg.id);
    }
  }, [activeOrg, setCurrentWorkspaceId]);

  React.useEffect(() => {
    setWorkspaces(workspaces);
    setActiveWorkspace(activeOrg);
    authClient.organization.setActive({
      organizationId: activeOrg.id,
      organizationSlug: activeOrg.slug || "",
    });
  }, [activeOrg, setActiveWorkspace, setWorkspaces, workspaces]);

  return <>{children}</>;
};

export default WorkspaceProvider;
