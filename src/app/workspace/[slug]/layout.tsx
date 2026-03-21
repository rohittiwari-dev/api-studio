import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import type { Organization } from "@/generated/prisma/client";
import auth from "@/lib/auth";
import { currentUser } from "@/modules/authentication/server/auth.actions";
import { listUserWorkspaces } from "@/modules/workspace/server/workspace.actions";
import WorkspaceProvider from "@/modules/workspace/store/WorkspaceProvider";

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
  if (!currentUserSession?.user?.id) {
    return redirect("/login");
  }

  const workspaces = await listUserWorkspaces(currentUserSession.user.id);

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
