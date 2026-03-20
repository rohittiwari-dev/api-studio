"use client";

import { Check, CloudUpload, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { upsertRequestAction } from "@/modules/apis/requests/actions";
import useRequestStore from "@/modules/apis/requests/store/request.store";
import useWorkspaceState from "@/modules/workspace/store";

const CloudSyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const { requests, upsertRequest, setSnapshot, hasChanges } =
    useRequestStore();
  const { activeWorkspace } = useWorkspaceState();

  // Get unsaved requests that are NOT of type "NEW"
  const unsavedRequests = useMemo(() => {
    const allRequests = Object.values(requests);
    return allRequests.filter(
      (r) =>
        r.type !== "NEW" &&
        r.workspaceId === activeWorkspace?.id &&
        hasChanges(r.id),
    );
  }, [requests, activeWorkspace?.id, hasChanges]);

  const hasUnsavedChanges = unsavedRequests.length > 0;

  const handleSync = async () => {
    if (!hasUnsavedChanges || isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      const savePromises = unsavedRequests.map(async (request) => {
        const savedRequest = await upsertRequestAction(request.id, {
          name: request.name,
          url: request.url || "",
          workspaceId: request.workspaceId,
          collectionId: request.collectionId,
          type: (request.type || "API") as "API" | "WEBSOCKET" | "SOCKET_IO",
          method: request.method,
          headers: request.headers,
          parameters: request.parameters,
          body: request.body,
          auth: request.auth,
          bodyType: request.bodyType,
          savedMessages: request.savedMessages ?? [],
        });

        // Update store and snapshot after successful save
        if (savedRequest) {
          const updatedRequest = {
            ...savedRequest,
            headers: savedRequest.headers as any[],
            parameters: savedRequest.parameters as any[],
            body: savedRequest.body as any,
            auth: savedRequest.auth as any,
            savedMessages: savedRequest.savedMessages as any[],
            unsaved: false,
          };
          upsertRequest(updatedRequest as any);
          setSnapshot(savedRequest.id, updatedRequest as any);
        }
      });

      await Promise.all(savePromises);

      toast.success(
        unsavedRequests.length === 1
          ? "Request synced to cloud"
          : `${unsavedRequests.length} requests synced to cloud`,
      );

      // Show success state briefly
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (error) {
      console.error("Failed to sync requests:", error);
      toast.error("Failed to sync requests");
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't render if no unsaved changes
  if (!hasUnsavedChanges && !justSynced) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || justSynced}
            className={cn(
              "relative h-8 gap-2 px-3 transition-all duration-300",
              hasUnsavedChanges &&
                !justSynced &&
                "text-amber-500 hover:text-amber-400",
              justSynced && "text-emerald-500",
            )}
          >
            {isSyncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : justSynced ? (
              <Check className="size-4" />
            ) : (
              <>
                <CloudUpload className="size-4" />
                {/* Pulse indicator */}
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500 animate-pulse" />
              </>
            )}
            <span className="hidden sm:inline text-xs font-medium">
              {isSyncing ? "Syncing..." : justSynced ? "Synced" : "Sync"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {isSyncing
            ? "Syncing changes..."
            : justSynced
              ? "All changes synced!"
              : `Sync ${unsavedRequests.length} unsaved request${
                  unsavedRequests.length > 1 ? "s" : ""
                } to cloud`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CloudSyncButton;
