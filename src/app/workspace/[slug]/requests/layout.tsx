import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { currentUser } from "@/modules/authentication/server/auth.actions";
import Header from "@/modules/apis/layout/components/header";
import { AppSidebar } from "@/modules/apis/layout/components/sidebar/AppSidebar";
import RightSidebar from "@/modules/apis/layout/components/sidebar/right-sidebar";
import { RequestAndCollectionProvider } from "@/modules/apis/requests/providers/RequestAndCollectionProvider";
import { KeyboardShortcutsProvider } from "@/modules/apis/requests/providers/KeyboardShortcutsProvider";
import { getAllCollectionsFlat } from "@/modules/apis/collections/server/collection.action";
import { getAllRequests } from "@/modules/apis/requests/server/request";

// Force dynamic rendering since we use headers()
export const dynamic = "force-dynamic";

const WorkspaceLayout = async ({ children }: { children: React.ReactNode }) => {
  const currentUserSession = await currentUser();

  return (
    <RequestAndCollectionProvider
      activeWorkspaceId={
        currentUserSession?.session?.activeOrganizationId || ""
      }
      collections={await getAllCollectionsFlat(
        currentUserSession?.session?.activeOrganizationId || "",
      )}
      requests={await getAllRequests(
        currentUserSession?.session?.activeOrganizationId || "",
      )}
    >
      <KeyboardShortcutsProvider>
        <div className="flex h-svh w-full flex-col [--header-height:calc(--spacing(14))] bg-muted/20 dark:bg-muted/10 relative">
          {/* Global Background Gradient */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
          </div>

          <SidebarProvider className="flex h-full w-full flex-col z-10 relative bg-transparent">
            <Header currentUserSession={currentUserSession!} />
            <div className="flex h-full w-full flex-1 overflow-hidden">
              <AppSidebar />
              <SidebarInset className="h-full overflow-hidden overflow-y-auto bg-transparent">
                {children}
              </SidebarInset>
              <RightSidebar />
            </div>
          </SidebarProvider>
        </div>
      </KeyboardShortcutsProvider>
    </RequestAndCollectionProvider>
  );
};

export default WorkspaceLayout;
