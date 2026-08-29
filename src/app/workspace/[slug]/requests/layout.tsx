import type React from "react";
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCollectionsFlat } from "@/modules/apis/collections/server/collection.action";
import Header from "@/modules/apis/layout/components/header";
import { AppSidebar } from "@/modules/apis/layout/components/sidebar/AppSidebar";
import RightSidebar from "@/modules/apis/layout/components/sidebar/right-sidebar";
import { KeyboardShortcutsProvider } from "@/modules/apis/requests/providers/KeyboardShortcutsProvider";
import { RequestAndCollectionProvider } from "@/modules/apis/requests/providers/RequestAndCollectionProvider";
import { getAllRequests } from "@/modules/apis/requests/server/request";
import { getCurrentUser } from "@/modules/authentication/server/session";

/**
 * Session-bound header. Streams into the header slot so the surrounding
 * layout chrome stays in the static shell.
 */
const RequestsHeader = async () => {
  const currentUserSession = await getCurrentUser();
  return <Header currentUserSession={currentUserSession!} />;
};

const HeaderFallback = () => (
  <header className="sticky top-0 z-50 w-full h-(--header-height)">
    <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5 supports-backdrop-filter:bg-background/60" />
    <div className="relative flex h-full items-center justify-between gap-2 px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Skeleton className="size-8 rounded-xl" />
        <div className="h-4 w-px bg-border/40 hidden sm:block" />
        <Skeleton className="h-4 w-32 hidden sm:block" />
      </div>
      <div className="flex-1 flex justify-center max-w-md w-full mx-2">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-8 w-20 rounded-md hidden sm:block" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  </header>
);

/**
 * Effect-only leaf: seeds the request/collection stores with server data.
 * React Query re-fetches these client side anyway, so this is purely a
 * hydration head start and must never block the layout.
 */
const RequestStoreHydrator = async () => {
  const currentUserSession = await getCurrentUser();
  const workspaceId = currentUserSession?.session?.activeOrganizationId || "";

  const [collections, requests] = await Promise.all([
    getAllCollectionsFlat(workspaceId),
    getAllRequests(workspaceId),
  ]);

  return (
    <RequestAndCollectionProvider
      activeWorkspaceId={workspaceId}
      collections={collections}
      requests={requests}
    />
  );
};

const RequestsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <KeyboardShortcutsProvider>
      <div className="flex h-svh w-full flex-col [--header-height:calc(--spacing(14))] bg-muted/20 dark:bg-muted/10 relative">
        {/* Global Background Gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <SidebarProvider className="flex h-full w-full flex-col z-10 relative bg-transparent">
          <Suspense fallback={<HeaderFallback />}>
            <RequestsHeader />
          </Suspense>
          <div className="flex h-full w-full flex-1 overflow-hidden">
            <AppSidebar />
            <SidebarInset className="h-full overflow-hidden overflow-y-auto bg-transparent">
              {children}
            </SidebarInset>
            <RightSidebar />
          </div>
        </SidebarProvider>
      </div>

      <Suspense fallback={null}>
        <RequestStoreHydrator />
      </Suspense>
    </KeyboardShortcutsProvider>
  );
};

export default RequestsLayout;
