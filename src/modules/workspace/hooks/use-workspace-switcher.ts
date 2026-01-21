import { useCallback } from "react";
import useWorkspaceStateCache from "../store/workspace-state-cache";
import useEnvironmentStore from "@/modules/apis/environment/store/environment.store";
import useWorkspaceState from "../store";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";
import { RequestStateInterface } from "@/modules/apis/requests/types/request.types";
import { Organization } from "@/generated/prisma/browser";

/**
 * Hook to manage workspace switching with state preservation
 */
export function useWorkspaceSwitcher() {
  const {
    saveSnapshot,
    getSnapshot,
    setCurrentWorkspaceId,
    currentWorkspaceId,
    createSnapshotFromState,
    mergeWithDatabaseRequests,
    setPendingRestore,
    clearPendingRestore,
    getPendingRestore,
    pendingRestoreWorkspaceId,
    // Optional now with simplified logic, but kept if you want strict prevention
    // appliedRestoreWorkspaceId, setAppliedRestore, hasAppliedRestore...
  } = useWorkspaceStateCache();
  const { setActiveWorkspace, activeWorkspace } = useWorkspaceState();

  // Request store (Unified)
  const { setRequestsState, getState, requests } = useRequestSyncStoreState();

  // Environment store
  const { activeEnvironmentId, setActiveEnvironment } = useEnvironmentStore();

  /**
   * Save the current workspace state to cache
   */
  const saveCurrentWorkspaceState = useCallback(() => {
    if (!currentWorkspaceId) return;

    const requestState = getState();
    const snapshot = createSnapshotFromState(
      currentWorkspaceId,
      requestState,
      [], // Sidebar is now derived, no need to cache items
      activeEnvironmentId,
    );

    saveSnapshot(snapshot);
  }, [
    currentWorkspaceId,
    getState,
    activeEnvironmentId,
    saveSnapshot,
    createSnapshotFromState,
  ]);

  /**
   * Restore a workspace's state from cache
   * This should be called AFTER DB requests are loaded
   */
  const restoreWorkspaceState = useCallback(
    (workspaceId: string, dbRequests?: RequestStateInterface[]) => {
      const snapshot = getSnapshot(workspaceId);

      if (snapshot) {
        // Restore environment
        if (snapshot.activeEnvironmentId) {
          setActiveEnvironment(snapshot.activeEnvironmentId);
        }

        // If we have DB requests, merge with cached state
        if (dbRequests && dbRequests.length > 0) {
          const mergedState = mergeWithDatabaseRequests(snapshot, dbRequests);
          setRequestsState(mergedState);
        } else {
          // No DB requests yet, restore fully from cache
          setRequestsState({
            tabIds: snapshot.tabIds,
            requests: snapshot.requests,
            activeRequest: snapshot.activeRequest,
          });
        }
      } else {
        // No cached state - clear stores for fresh workspace
        setRequestsState({
          requests: [],
          tabIds: [],
          activeRequest: null,
        });
        // Sidebar will be populated by the page query
      }
    },
    [
      getSnapshot,
      setRequestsState,
      setActiveEnvironment,
      mergeWithDatabaseRequests,
    ],
  );

  /**
   * Apply cached state to existing DB requests
   * Call this from WorkspaceProvider after DB requests are loaded
   */
  const applyCachedStateToRequests = useCallback(
    (workspaceId: string, dbRequests: RequestStateInterface[]) => {
      const snapshot = getSnapshot(workspaceId);

      if (snapshot) {
        const mergedState = mergeWithDatabaseRequests(snapshot, dbRequests);
        setRequestsState(mergedState);
      }
    },
    [getSnapshot, mergeWithDatabaseRequests, setRequestsState],
  );

  /**
   * Switch to a new workspace, saving current state and marking for restore
   * Note: Actual restore happens via applyPendingRestore AFTER reset/navigation
   */
  const switchWorkspace = useCallback(
    (targetWorkspace: Organization | null | undefined) => {
      if (!targetWorkspace) return;

      // Save current workspace state before switching
      saveCurrentWorkspaceState();

      // Update current workspace ID
      setCurrentWorkspaceId(targetWorkspace.id);

      // Set the new active workspace
      setActiveWorkspace(targetWorkspace);

      // Mark for pending restore - don't restore now as resetCollectionsRequestsAndCookies
      // will clear it. The actual restore will happen when applyPendingRestore is called.
      setPendingRestore(targetWorkspace.id);
    },
    [
      saveCurrentWorkspaceState,
      setCurrentWorkspaceId,
      setActiveWorkspace,
      setPendingRestore,
    ],
  );

  /**
   * Initialize workspace state tracking (call on app load)
   */
  const initializeWorkspaceTracking = useCallback(
    (workspaceId: string) => {
      setCurrentWorkspaceId(workspaceId);
    },
    [setCurrentWorkspaceId],
  );

  /**
   * Apply pending restore for a workspace
   * Call this from WorkspaceProvider AFTER DB requests are loaded to merge cached state
   */
  const applyPendingRestore = useCallback(
    (workspaceId: string, dbRequests: RequestStateInterface[]) => {
      const pendingId = getPendingRestore();

      // Only apply if this is the pending workspace
      if (pendingId !== workspaceId && pendingId !== null) {
        return false;
      }

      const snapshot = getSnapshot(workspaceId);

      if (snapshot) {
        // Restore environment
        if (snapshot.activeEnvironmentId) {
          setActiveEnvironment(snapshot.activeEnvironmentId);
        }

        // Merge cached state with DB requests
        const mergedState = mergeWithDatabaseRequests(snapshot, dbRequests);
        setRequestsState(mergedState);

        // Clear the pending flag
        clearPendingRestore();
        return true;
      }

      // No cached state - just clear the pending flag
      clearPendingRestore();
      return false;
    },
    [
      getPendingRestore,
      getSnapshot,
      setActiveEnvironment,
      mergeWithDatabaseRequests,
      setRequestsState,
      clearPendingRestore,
    ],
  );

  return {
    switchWorkspace,
    saveCurrentWorkspaceState,
    restoreWorkspaceState,
    applyCachedStateToRequests,
    applyPendingRestore,
    initializeWorkspaceTracking,
    currentWorkspaceId,
    pendingRestoreWorkspaceId,
  };
}
