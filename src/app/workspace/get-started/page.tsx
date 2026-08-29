import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import auth from "@/lib/auth";
import WorkspaceSetup from "@/modules/workspace/components/workspace-setup";

/**
 * Resolves the session and bounces users who already have a workspace.
 * Kept behind `<Suspense>` so the page itself stays prerenderable and the
 * setup form paints from the static shell on the common (new user) path.
 */
const GettingStarted = async () => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Check if user already has organizations - if so, redirect to workspace
  if (session.session.activeOrganizationId) {
    const activeOrg = await auth.api
      .getFullOrganization({
        query: { organizationId: session.session.activeOrganizationId },
        headers: headersList,
      })
      .catch(() => null);

    if (activeOrg?.slug) {
      redirect(`/workspace/${activeOrg.slug}`);
    }
  }

  const orgs = await auth.api
    .listOrganizations({
      headers: headersList,
    })
    .catch(() => []);

  if (orgs && orgs.length > 0) {
    redirect(`/workspace/${orgs[0].slug}`);
  }

  // No organizations - show the setup form
  return <WorkspaceSetup type={"get-started-page"} session={session} />;
};

const GettingStartedFallback = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

const GettingStartedPage = () => {
  return (
    <Suspense fallback={<GettingStartedFallback />}>
      <GettingStarted />
    </Suspense>
  );
};

export default GettingStartedPage;
