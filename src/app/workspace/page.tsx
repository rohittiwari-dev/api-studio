import { headers } from "next/headers";
import { redirect } from "next/navigation";
import auth from "@/lib/auth";

const WorkspacePage = async () => {
  const headersList = await headers();

  // Get session with active organization
  const session = await auth.api
    .getSession({
      headers: headersList,
    })
    .catch(() => null);

  if (!session) {
    redirect("/sign-in");
  }

  // Check for active organization
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

  // Check if user has any organizations
  const orgs = await auth.api
    .listOrganizations({
      headers: headersList,
    })
    .catch(() => []);

  if (orgs && orgs.length > 0) {
    redirect(`/workspace/${orgs[0].slug}`);
  }

  // No organizations, redirect to get-started
  redirect("/workspace/get-started");
};

export default WorkspacePage;
