import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Organization } from "@/generated/prisma/client";
import auth from "@/lib/auth";
import { currentUser } from "@/modules/authentication/server/auth.actions";
import Header from "@/modules/apis/layout/components/header";
import { AppSidebar } from "@/modules/apis/layout/components/sidebar/AppSidebar";
import RightSidebar from "@/modules/apis/layout/components/sidebar/right-sidebar";
import { getRequestSideBarTree } from "@/modules/apis/layout/server/sidebar.actions";

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
    (workspace) => workspace.slug === awaitParams?.slug
  ) ||
    workspaces?.find(
      (val) => val.id === currentUserSession?.session?.activeOrganizationId
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
    <div className="flex h-svh w-full flex-col [--header-height:calc(--spacing(14))] bg-muted/20 dark:bg-muted/10 relative">
      {/* Global Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <SidebarProvider className="flex h-full w-full flex-col z-10 relative bg-transparent">
        <Header currentUserSession={currentUserSession!} />
        <div className="flex h-full w-full flex-1 overflow-hidden">
          <AppSidebar
            sidebarData={await getRequestSideBarTree(activeWorkspace.id)}
            workspaceId={activeWorkspace.id}
          />
          <SidebarInset className="h-full overflow-hidden overflow-y-auto bg-transparent">
            {children}
          </SidebarInset>
          <RightSidebar />
        </div>
      </SidebarProvider>
    </div>
  );
};

export default WorkspaceLayout;
