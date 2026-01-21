import useWorkspaceState from "@/modules/workspace/store";
import useRequestStore from "../store/request.store";
import useTabsStore from "../store/tabs.store";
import { RequestStateInterface } from "../types/request.types";

/**
 * Request Sync Store Hook (Compatibility Layer)
 *
 * This hook provides a similar API to the old requestSyncStore
 * but uses the new simplified stores internally.
 *
 * Use this during migration, then gradually update components
 * to use the individual stores directly.
 */
const useRequestSyncStoreState = () => {
  const { activeWorkspace } = useWorkspaceState();

  // New stores
  const requestStore = useRequestStore();
  const tabsStore = useTabsStore();

  // Get all requests as array
  const requests = requestStore.getAllRequests();

  // Get active request from active tab
  const activeRequest = tabsStore.activeTab
    ? requestStore.getRequestById(tabsStore.activeTab) || null
    : null;

  // Get tabs with full request data (filtered by workspace)
  const tabs = tabsStore.tabs
    .map((tabId) => requestStore.getRequestById(tabId))
    .filter(
      (r): r is RequestStateInterface =>
        r !== undefined && r.workspaceId === activeWorkspace?.id,
    );

  // Set active request by ID
  const setActiveRequest = (id: string | null) => {
    if (id) {
      tabsStore.openTab(id);
    } else {
      tabsStore.setActiveTab(null);
    }
  };

  // Open a request (add to tabs and set active)
  const openRequest = (request: RequestStateInterface) => {
    // Add to request store if not exists
    requestStore.upsertRequest(request);
    // Set snapshot for saved requests
    if (request.type !== "NEW") {
      requestStore.setSnapshot(request.id, request);
    }
    // Open as tab
    tabsStore.openTab(request.id);
  };

  // Close a tab
  const closeTab = (tabId: string) => {
    const request = requestStore.getRequestById(tabId);

    // Remove NEW requests from store when closing
    if (request?.type === "NEW") {
      requestStore.removeRequest(tabId);
    }

    // Close the tab
    tabsStore.closeTab(tabId);
  };

  // Close all tabs
  const closeAllTabs = () => {
    // Remove NEW requests from store
    tabs
      .filter((t) => t.type === "NEW")
      .forEach((t) => requestStore.removeRequest(t.id));

    // Reset other requests to snapshots
    tabs
      .filter((t) => t.type !== "NEW")
      .forEach((t) => requestStore.resetToSnapshot(t.id));

    tabsStore.closeAllTabs();
  };

  // Close other tabs
  const closeOtherTabs = (keepTabId: string) => {
    const tabsToClose = tabs.filter((t) => t.id !== keepTabId);

    // Remove NEW requests from store
    tabsToClose
      .filter((t) => t.type === "NEW")
      .forEach((t) => requestStore.removeRequest(t.id));

    // Reset saved requests to snapshots
    tabsToClose
      .filter((t) => t.type !== "NEW")
      .forEach((t) => requestStore.resetToSnapshot(t.id));

    tabsStore.closeOtherTabs(keepTabId);
  };

  // Add request to store
  const addRequest = (request: RequestStateInterface) => {
    requestStore.upsertRequest(request);
    if (request.type !== "NEW") {
      requestStore.setSnapshot(request.id, request);
    }
  };

  // Update request
  const updateRequest = (
    id: string,
    updates: Partial<RequestStateInterface>,
  ) => {
    requestStore.updateRequest(id, updates);
  };

  // Remove request
  const removeRequest = (id: string) => {
    tabsStore.closeTab(id);
    requestStore.removeRequest(id);
  };

  // Get request by ID
  const getRequestById = (id: string) => requestStore.getRequestById(id);

  // Set requests state (bulk update)
  const setRequestsState = (state: {
    requests?: RequestStateInterface[];
    tabIds?: string[];
    activeRequest?: RequestStateInterface | null;
  }) => {
    if (state.requests) {
      requestStore.setRequests(state.requests);
    }
    if (state.tabIds !== undefined) {
      // Clear and set new tabs
      tabsStore.closeAllTabs();
      state.tabIds.forEach((id) => tabsStore.openTab(id));
    }
    if (state.activeRequest !== undefined) {
      tabsStore.setActiveTab(state.activeRequest?.id || null);
    }
  };

  // Get store state (for compatibility)
  const getState = () => ({
    requests,
    tabIds: tabsStore.tabs,
    activeRequest,
  });

  // Reset
  const reset = () => {
    requestStore.reset();
    tabsStore.reset();
  };

  return {
    // State
    requests,
    activeRequest,
    tabs,
    tabIds: tabsStore.tabs,
    activeWorkspace,
    requestLoading: false, // Removed loading state
    activeRequestLoading: false,

    // Actions
    setActiveRequest,
    openRequest,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    addRequest,
    updateRequest,
    removeRequest,
    getRequestById,
    setRequestsState,
    getState,
    reset,

    // Direct store access for advanced use
    requestStore,
    tabsStore,
  };
};

export default useRequestSyncStoreState;
