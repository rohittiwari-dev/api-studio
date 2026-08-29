import { ArrowRight, LayoutGrid, Webhook } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/modules/authentication/server/session";
import WorkspaceDashboardHeader from "@/modules/workspace/components/WorkspaceDashboardHeader";

type Params = Promise<{ slug: string }>;

/** Session-bound chrome, streamed in behind its own boundary. */
const DashboardHeader = async () => {
  const currentUserSession = await getCurrentUser();
  return <WorkspaceDashboardHeader currentUserSession={currentUserSession!} />;
};

const DashboardHeaderFallback = () => (
  <div className="sticky top-0 z-50 w-full h-14 border-b border-white/5 bg-background/60 backdrop-blur-xl flex items-center justify-between px-4">
    <div className="flex items-center gap-3">
      <Skeleton className="size-8 rounded-xl" />
      <Skeleton className="h-4 w-28" />
    </div>
    <Skeleton className="size-8 rounded-full" />
  </div>
);

/**
 * The card hrefs depend on `slug`, which is URL data. It can't live in the
 * shared App Shell, so it awaits `params` behind its own boundary while the
 * page heading stays static.
 */
const DashboardCards = async ({ params }: { params: Params }) => {
  const { slug } = await params;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href={`/workspace/${slug}/requests`} className="group">
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
              Create, test, and manage your API requests and collections in one
              central hub.
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

      <Link href={`/workspace/${slug}/webhooks`} className="group">
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
  );
};

const DashboardCardSkeleton = () => (
  <div className="h-full min-h-64 rounded-xl border border-border/50 bg-card/40 p-6 flex flex-col gap-4">
    <Skeleton className="size-14 rounded-lg" />
    <Skeleton className="h-6 w-48" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
    <Skeleton className="h-4 w-36 mt-auto" />
  </div>
);

const DashboardCardsFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>
);

const WorkspacePage = ({ params }: { params: Params }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Suspense fallback={<DashboardHeaderFallback />}>
        <DashboardHeader />
      </Suspense>
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

        <Suspense fallback={<DashboardCardsFallback />}>
          <DashboardCards params={params} />
        </Suspense>
      </main>
    </div>
  );
};

export default WorkspacePage;
