import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutGrid, Webhook, ArrowRight } from "lucide-react";
import WorkspaceDashboardHeader from "@/modules/workspace/components/WorkspaceDashboardHeader";
import { currentUser } from "@/modules/authentication/server/auth.actions";

const WorkspacePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const awaitParams = await params;
  const currentUserSession = await currentUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <WorkspaceDashboardHeader currentUserSession={currentUserSession!} />
      <main className="flex-1 flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-violet-500 to-indigo-500">
              Workspace Overview
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your API collections and monitor webhook events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href={`/workspace/${awaitParams.slug}/requests`}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 group-hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutGrid size={100} />
              </div>
              <CardHeader>
                <div className="p-3 w-fit rounded-lg bg-violet-500/10 mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <LayoutGrid className="w-8 h-8 text-violet-500" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  API(s) Dashboard
                </CardTitle>
                <CardDescription className="text-base">
                  Create, test, and manage your API requests and collections in
                  one central hub.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-primary mt-4">
                  Enter Dashboard{" "}
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href={`/workspace/${awaitParams.slug}/webhooks`}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-pink-500/50 group-hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Webhook size={100} />
              </div>
              <CardHeader>
                <div className="p-3 w-fit rounded-lg bg-pink-500/10 mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Webhook className="w-8 h-8 text-pink-500" />
                </div>
                <CardTitle className="text-xl group-hover:text-pink-600 transition-colors">
                  Webhook(s) Dashboard
                </CardTitle>
                <CardDescription className="text-base">
                  Real-time debugging and monitoring tools for incoming webhook
                  events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-pink-600 mt-4">
                  Manage Webhooks{" "}
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default WorkspacePage;
