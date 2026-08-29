import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import type { Organization } from "@/generated/prisma/client";
import auth from "@/lib/auth";
import { getCurrentUser } from "@/modules/authentication/server/session";
import { listUserWorkspaces } from "@/modules/workspace/server/workspace.actions";
import WorkspaceProvider from "@/modules/workspace/store/WorkspaceProvider";

type Params = Promise<{ slug: string }>;

/**
 * Resolves the active workspace, seeds the workspace store, and handles the
 * routing redirects (no session / no workspace / slug mismatch).
 *
 * This runs as a `<Suspense>`-wrapped leaf rather than blocking the layout.
 * `WorkspaceProvider` only hydrates zustand stores and provides no React
 * context, so children don't need to wait on it -- they paint immediately and
 * populate once the store fills in.
 *
 * Trade-off: because this streams, a redirect resolves *after* children have
 * started rendering, so a mismatched slug briefly shows the destination shell
 * before bouncing. Unauthenticated users never get here -- `src/proxy.ts`
 * already redirects `/workspace/:path*` to `/sign-in` before the page renders.
 */
const WorkspaceGate = async ({ params }: { params: Params }) => {
  const awaitParams = await params;
  const headersData = await headers();
  const currentUserSession = await getCurrentUser();

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
    />
  );
};

const WorkspaceLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) => {
  return (
    <>
      <Suspense fallback={null}>
        <WorkspaceGate params={params} />
      </Suspense>
      {children}
    </>
  );
};

export default WorkspaceLayout;
