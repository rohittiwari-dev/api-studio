import { headers } from "next/headers";
import { redirect } from "next/navigation";
import auth from "@/lib/auth";
import WorkspaceSetup from "@/modules/workspace/components/workspace-setup";

const GettingStartedPage = async () => {
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

export default GettingStartedPage;
