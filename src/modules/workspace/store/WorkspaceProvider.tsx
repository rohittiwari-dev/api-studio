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
  children: React.ReactNode;
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
