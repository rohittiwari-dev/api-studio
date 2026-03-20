"use client";

import { Loader2 } from "lucide-react";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { WebhookDetail } from "@/modules/webhooks/components";
import { useWebhooks } from "@/modules/webhooks/hooks/queries";
import useWebhookStore from "@/modules/webhooks/store/webhook.store";
import useWorkspaceState from "@/modules/workspace/store";

const WebhookDetailPage = () => {
  const params = useParams();
  const hookId = params.hookid as string; // This is the 'url' slug
  const [successfullyDeleted, setSuccessfullyDeleted] = useState(false);

  const { activeWorkspace } = useWorkspaceState();
  const { setActiveWebhook } = useWebhookStore();

  // Fetch all webhooks to find the one matching the current URL slug
  const { data: webhooks = [], isLoading } = useWebhooks(
    activeWorkspace?.id || "",
  );

  const matchedWebhook = webhooks.find((w) => w.url === hookId);

  // Sync active webhook for sidebar highlighting
  useEffect(() => {
    if (matchedWebhook) {
      setActiveWebhook(matchedWebhook);
    }
  }, [matchedWebhook, setActiveWebhook]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (successfullyDeleted) {
        setSuccessfullyDeleted(false);
        redirect(`/workspace/${params.slug}/webhooks`);
      }
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, [successfullyDeleted, params.slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading webhook...
          </p>
        </div>
      </div>
    );
  }

  /* 
     If we are in the process of deleting (optimistic UI), 
     we show a redirecting state instead of checking !matchedWebhook.
     This prevents the "Not Found" flash.
  */
  if (successfullyDeleted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (!matchedWebhook) {
    return (
      <div className="h-full flex items-center justify-center bg-background/50 p-6">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
          {/* Left Column: Main Card */}
          <div className="flex-1 relative overflow-hidden rounded-2xl bg-linear-to-br from-red-500/5 via-orange-500/5 to-transparent border border-white/5 dark:border-white/5 p-6">
            {/* ... Rest of Not Found UI ... */}
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <svg
                className="size-48 -rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={0.5}
                aria-label="Webhook Not Found"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-600 dark:text-red-400">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                Not Found
              </span>

              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Webhook Not Found
              </h1>

              <p className="text-muted-foreground max-w-lg">
                The webhook you&apos;re looking for doesn&apos;t exist or may
                have been removed.
              </p>

              {/* Webhook ID Display */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/40 backdrop-blur-sm border border-white/5 dark:border-white/5 shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                  <svg
                    className="size-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-label="Webhook ID"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Requested Webhook ID
                  </p>
                  <code className="text-sm font-mono text-red-600 dark:text-red-400">
                    {hookId}
                  </code>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={`/workspace/${params.slug}/webhooks`}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:-translate-y-0.5 font-medium cursor-pointer"
              >
                <svg
                  className="size-4 group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-label="Back to All Webhooks"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Back to All Webhooks
              </a>
            </div>
          </div>

          {/* Right Column: Possible Reasons Card */}
          <div className="lg:w-80 shrink-0 rounded-2xl bg-muted/20 border border-white/5 dark:border-white/5 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 dark:border-white/5">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <svg
                  className="size-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-label="Why am I seeing this?"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
                Why am I seeing this?
              </h2>
            </div>
            <div className="p-5 space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Webhook was deleted
                  </p>
                  <p className="text-xs mt-0.5">
                    The webhook may have been removed by you or a team member.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Access permissions
                  </p>
                  <p className="text-xs mt-0.5">
                    You may not have permission to view this webhook.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Incorrect URL</p>
                  <p className="text-xs mt-0.5">
                    The webhook ID in the URL may be mistyped or corrupted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WebhookDetail
      webhookId={matchedWebhook.id}
      workspaceId={activeWorkspace?.id || ""}
      workspaceSlug={activeWorkspace?.slug || ""}
      onSuccessfullyDeleted={() => setSuccessfullyDeleted(true)}
    />
  );
};

export default WebhookDetailPage;
