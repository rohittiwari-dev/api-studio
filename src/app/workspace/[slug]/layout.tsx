import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Organization } from "@/generated/prisma/client";
import auth from "@/lib/auth";
import { currentUser } from "@/modules/authentication/server/auth.actions";
import WorkspaceProvider from "@/modules/workspace/store/WorkspaceProvider";

// Force dynamic rendering since we use headers()
export const dynamic = "force-dynamic";

const WorkspaceLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) => {
  const awaitParams = await params;
  const headersData = await headers();
  const currentUserSession = await currentUser();
  const workspaces = await auth.api.listOrganizations({
    headers: headersData,
  });

  const activeWorkspace = (workspaces.find(
    (workspace) => workspace.slug === awaitParams?.slug,
  ) ||
    workspaces?.find(
      (val) => val.id === currentUserSession?.session?.activeOrganizationId,
    ) ||
    workspaces[0]) as Organization;

  if (!activeWorkspace) {
    return redirect("/workspace/get-started");
  }
  if (activeWorkspace.slug !== awaitParams.slug) {
    await auth.api.setActiveOrganization({
      body: {
        organizationId: activeWorkspace.id,
      },
      headers: headersData,
    });

    return redirect(`/workspace/${activeWorkspace.slug}`);
  }

  return (
    <WorkspaceProvider
      activeOrg={activeWorkspace}
      workspaces={(workspaces || []) as Organization[]}
    >
      {children}
    </WorkspaceProvider>
  );
};

export default WorkspaceLayout;
