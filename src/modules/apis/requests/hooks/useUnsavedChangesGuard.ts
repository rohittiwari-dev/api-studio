"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequestStateInterface } from "../types/request.types";
import { upsertRequestAction } from "../actions";
import useRequestStore from "../store/request.store";
import useTabsStore from "../store/tabs.store";
import useWorkspaceState from "@/modules/workspace/store";
import {
  UnsavedChangesAction,
  UnsavedChangesDialogProps,
} from "../components/UnsavedChangesDialog";
import { hasRequestChanges } from "../utils/requestDiff";

interface PendingAction {
  type: UnsavedChangesAction;
  unsavedRequests: RequestStateInterface[];
  onConfirm: () => void;
  tabIdsToClose?: string[];
}

/**
 * Unsaved Changes Guard Hook
 *
 * Uses diff-based detection to determine if requests have unsaved changes.
 * On discard: Resets to snapshot locally (NO API calls)
 * On save: Saves to DB, updates snapshot
 *
 * DB data is prioritized for conflict resolution.
 */
export function useUnsavedChangesGuard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const { activeWorkspace } = useWorkspaceState();
  const queryClient = useQueryClient();

  const {
    getAllRequests,
    getSnapshot,
    resetToSnapshot,
    removeRequest,
    updateRequest,
    setSnapshot,
    upsertRequest,
  } = useRequestStore();

  const { tabs, closeTab, closeAllTabs, closeOtherTabs } = useTabsStore();

  // Get requests that are currently open as tabs
  const getTabRequests = useCallback((): RequestStateInterface[] => {
    const allRequests = getAllRequests();
    return allRequests.filter(
      (r) => tabs.includes(r.id) && r.workspaceId === activeWorkspace?.id,
    );
  }, [getAllRequests, tabs, activeWorkspace?.id]);

  // Get unsaved requests from given tab IDs using diff detection
  const getUnsavedRequests = useCallback(
    (tabIdsToCheck: string[]): RequestStateInterface[] => {
      const allRequests = getAllRequests();
      return allRequests.filter((r) => {
        if (!tabIdsToCheck.includes(r.id)) return false;
        if (r.workspaceId !== activeWorkspace?.id) return false;

        // Check if request has a snapshot (has been saved to DB before)
        const snapshot = getSnapshot(r.id);

        // No snapshot = newly created request, not yet in DB
        // Should prompt to save
        if (!snapshot) return true;

        // Use diff detection for existing requests
        return hasRequestChanges(r, snapshot);
      });
    },
    [getAllRequests, getSnapshot, activeWorkspace?.id],
  );

  // Check if any tabs have unsaved changes
  const hasUnsavedChanges = useCallback(
    (tabIdsToCheck: string[]): boolean => {
      return getUnsavedRequests(tabIdsToCheck).length > 0;
    },
    [getUnsavedRequests],
  );

  // Save all unsaved requests to DB
  const saveAllRequests = async (requestsToSave: RequestStateInterface[]) => {
    const savePromises = requestsToSave
      .filter((req) => req.type !== "NEW")
      .map(async (request) => {
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

        // Update snapshot after successful save
        if (savedRequest) {
          const updatedRequest: RequestStateInterface = {
            ...savedRequest,
            headers: savedRequest.headers as RequestStateInterface["headers"],
            parameters:
              savedRequest.parameters as RequestStateInterface["parameters"],
            body: savedRequest.body as RequestStateInterface["body"],
            auth: savedRequest.auth as RequestStateInterface["auth"],
            savedMessages:
              savedRequest.savedMessages as RequestStateInterface["savedMessages"],
            unsaved: false,
          };
          upsertRequest(updatedRequest);
          setSnapshot(request.id, updatedRequest);
        }

        return savedRequest;
      });

    await Promise.all(savePromises);

    // Invalidate queries to refresh data
    const workspaceId = activeWorkspace?.id;
    if (workspaceId) {
      queryClient.invalidateQueries({ queryKey: ["requests", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });
    }
  };

  // Handle save action
  const handleSave = async () => {
    if (!pendingAction) return;

    const requestsToSave = pendingAction.unsavedRequests.filter(
      (req) => req.type !== "NEW",
    );
    const currentPendingAction = pendingAction;

    setIsSaving(true);
    try {
      // Optimistically close dialog
      setDialogOpen(false);

      // Save to database
      await saveAllRequests(requestsToSave);

      // Execute the pending action
      currentPendingAction.onConfirm();
      setPendingAction(null);

      toast.success(
        requestsToSave.length === 1
          ? "Request saved"
          : `${requestsToSave.length} requests saved`,
      );
    } catch (error) {
      console.error("Failed to save requests:", error);
      toast.error("Failed to save requests");
      // Reopen dialog on error
      setDialogOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle discard action (LOCAL ONLY - no API calls)
  const handleDiscard = async () => {
    if (!pendingAction) return;

    setIsDiscarding(true);
    try {
      // Reset each request to its snapshot (LOCAL ONLY)
      pendingAction.unsavedRequests.forEach((req) => {
        const snapshot = getSnapshot(req.id);

        if (!snapshot) {
          // No snapshot = new request never saved to DB, remove entirely
          removeRequest(req.id);
        } else {
          // Has snapshot = existing request with changes, reset to snapshot
          resetToSnapshot(req.id);
        }
      });

      // Close dialog and execute action
      setDialogOpen(false);
      pendingAction.onConfirm();
      setPendingAction(null);
    } catch (error) {
      console.error("Failed to discard changes:", error);
      toast.error("Failed to discard changes");
    } finally {
      setIsDiscarding(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    setDialogOpen(false);
    setPendingAction(null);
  };

  // Confirm close single tab
  const confirmClose = useCallback(
    (tabId: string, onConfirm: () => void) => {
      const unsavedRequests = getUnsavedRequests([tabId]);

      if (unsavedRequests.length === 0) {
        // No unsaved changes, proceed directly
        onConfirm();
        return;
      }

      setPendingAction({
        type: "close",
        unsavedRequests,
        onConfirm,
        tabIdsToClose: [tabId],
      });
      setDialogOpen(true);
    },
    [getUnsavedRequests],
  );

  // Confirm close all tabs
  const confirmCloseAll = useCallback(
    (onConfirm: () => void) => {
      const tabRequests = getTabRequests();
      const allTabIds = tabRequests.map((t) => t.id);
      const unsavedRequests = getUnsavedRequests(allTabIds);

      if (unsavedRequests.length === 0) {
        onConfirm();
        return;
      }

      setPendingAction({
        type: "close-all",
        unsavedRequests,
        onConfirm,
        tabIdsToClose: allTabIds,
      });
      setDialogOpen(true);
    },
    [getTabRequests, getUnsavedRequests],
  );

  // Confirm close other tabs
  const confirmCloseOthers = useCallback(
    (keepTabId: string, onConfirm: () => void) => {
      const tabRequests = getTabRequests();
      const otherTabIds = tabRequests
        .filter((t) => t.id !== keepTabId)
        .map((t) => t.id);
      const unsavedRequests = getUnsavedRequests(otherTabIds);

      if (unsavedRequests.length === 0) {
        onConfirm();
        return;
      }

      setPendingAction({
        type: "close-others",
        unsavedRequests,
        onConfirm,
        tabIdsToClose: otherTabIds,
      });
      setDialogOpen(true);
    },
    [getTabRequests, getUnsavedRequests],
  );

  // Confirm workspace switch
  const confirmWorkspaceSwitch = useCallback(
    (onConfirm: () => void) => {
      const tabRequests = getTabRequests();
      const allTabIds = tabRequests.map((t) => t.id);
      const unsavedRequests = getUnsavedRequests(allTabIds);

      if (unsavedRequests.length === 0) {
        onConfirm();
        return;
      }

      setPendingAction({
        type: "switch-workspace",
        unsavedRequests,
        onConfirm,
        tabIdsToClose: allTabIds,
      });
      setDialogOpen(true);
    },
    [getTabRequests, getUnsavedRequests],
  );

  return {
    // State
    dialogOpen,
    isSaving,
    isDiscarding,
    pendingAction,

    // Dialog props
    dialogProps: pendingAction
      ? ({
          open: dialogOpen,
          onOpenChange: setDialogOpen,
          unsavedRequests: pendingAction.unsavedRequests,
          onSave: handleSave,
          onDiscard: handleDiscard,
          onCancel: handleCancel,
          isSaving,
          isDiscarding,
          actionType: pendingAction.type,
        } as UnsavedChangesDialogProps)
      : null,

    // Actions
    hasUnsavedChanges,
    getUnsavedRequests,
    confirmClose,
    confirmCloseAll,
    confirmCloseOthers,
    confirmWorkspaceSwitch,
  };
}

export default useUnsavedChangesGuard;
