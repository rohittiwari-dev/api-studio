import useWorkspaceState from "@/modules/workspace/store";
import useRequestStore from "../store/request.store";
import useTabsStore from "../store/tabs.store";
import { RequestStateInterface } from "../types/request.types";

// Request state management hook which combines request and tabs stores for compatibility
const useRequestSyncStoreState = () => {
  const { activeWorkspace } = useWorkspaceState();
  const requestStore = useRequestStore();
  const tabsStore = useTabsStore();

  const requests = requestStore.getAllRequests();

  const activeRequest = tabsStore.activeTab
    ? requestStore.getRequestById(tabsStore.activeTab) || null
    : null;

  const tabs = tabsStore.tabs
    .map((tabId) => requestStore.getRequestById(tabId))
    .filter(
      (r): r is RequestStateInterface =>
        r !== undefined && r.workspaceId === activeWorkspace?.id,
    );

  const setActiveRequest = (id: string | null) => {
    if (id) {
      tabsStore.openTab(id);
    } else {
      tabsStore.setActiveTab(null);
    }
  };

  const openRequest = (request: RequestStateInterface) => {
    requestStore.upsertRequest(request);
    if (!request.unsaved) {
      requestStore.setSnapshot(request.id, request);
    }
    tabsStore.openTab(request.id);
  };

  const closeTab = (tabId: string) => {
    tabsStore.closeTab(tabId);
  };

  const closeAllTabs = () => {
    tabsStore.closeAllTabs();
  };

  const closeOtherTabs = (keepTabId: string) => {
    tabsStore.closeOtherTabs(keepTabId);
  };

  const updateRequest = (
    id: string,
    updates: Partial<RequestStateInterface>,
  ) => {
    requestStore.updateRequest(id, updates);
  };

  const removeRequest = (id: string) => {
    tabsStore.closeTab(id);
    requestStore.removeRequest(id);
  };

  const getRequestById = (id: string) => requestStore.getRequestById(id);

  const setRequestsState = (state: {
    requests?: RequestStateInterface[];
    tabIds?: string[];
    activeRequest?: RequestStateInterface | null;
  }) => {
    if (state.requests) {
      requestStore.setRequests(state.requests);
    }
    if (state.tabIds !== undefined) {
      tabsStore.closeAllTabs();
      state.tabIds.forEach((id) => tabsStore.openTab(id));
    }
    if (state.activeRequest !== undefined) {
      tabsStore.setActiveTab(state.activeRequest?.id || null);
    }
  };

  const reset = () => {
    requestStore.reset();
    tabsStore.reset();
  };

  return {
    requests,
    activeRequest,
    tabs,
    tabIds: tabsStore.tabs,
    activeWorkspace,

    setActiveRequest,
    openRequest,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    updateRequest,
    removeRequest,
    getRequestById,
    setRequestsState,
    reset,

    requestStore,
    tabsStore,
  };
};

export default useRequestSyncStoreState;
