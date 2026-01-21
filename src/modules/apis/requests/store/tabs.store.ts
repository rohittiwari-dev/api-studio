import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Tabs Store
 * - Manages open tabs (request IDs)
 * - Tracks active tab
 * - Workspace-scoped tab management
 */

export interface TabsStoreState {
  // Array of open tab IDs (request IDs)
  tabs: string[];
  // Currently active tab ID
  activeTab: string | null;
}

interface TabsStoreActions {
  // Open a tab (add to list if not exists, set as active)
  openTab: (tabId: string) => void;
  // Close a tab
  closeTab: (tabId: string) => void;
  // Set active tab
  setActiveTab: (tabId: string | null) => void;
  // Close all tabs
  closeAllTabs: () => void;
  // Close other tabs (keep one)
  closeOtherTabs: (keepTabId: string) => void;
  // Check if tab is open
  isTabOpen: (tabId: string) => boolean;
  // Get tabs in order
  getTabs: () => string[];
  // Reorder tabs
  reorderTabs: (newOrder: string[]) => void;
  // Reset store
  reset: () => void;
}

const initialState: TabsStoreState = {
  tabs: [],
  activeTab: null,
};

const useTabsStore = create<TabsStoreState & TabsStoreActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        openTab: (tabId) => {
          set((state) => {
            // If tab already exists, just set it active
            if (state.tabs.includes(tabId)) {
              return { activeTab: tabId };
            }
            // Add new tab and set active
            return {
              tabs: [...state.tabs, tabId],
              activeTab: tabId,
            };
          });
        },

        closeTab: (tabId) => {
          set((state) => {
            const currentIndex = state.tabs.indexOf(tabId);
            if (currentIndex === -1) return state;

            const newTabs = state.tabs.filter((id) => id !== tabId);

            // Calculate next active tab
            let newActiveTab: string | null = null;
            if (state.activeTab === tabId && newTabs.length > 0) {
              // Try previous tab, then next tab
              const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
              newActiveTab = newTabs[nextIndex] || null;
            } else if (state.activeTab !== tabId) {
              // Keep current active tab
              newActiveTab = state.activeTab;
            }

            return {
              tabs: newTabs,
              activeTab: newActiveTab,
            };
          });
        },

        setActiveTab: (tabId) => {
          set({ activeTab: tabId });
        },

        closeAllTabs: () => {
          set({ tabs: [], activeTab: null });
        },

        closeOtherTabs: (keepTabId) => {
          set((state) => {
            if (!state.tabs.includes(keepTabId)) {
              return { tabs: [], activeTab: null };
            }
            return {
              tabs: [keepTabId],
              activeTab: keepTabId,
            };
          });
        },

        isTabOpen: (tabId) => get().tabs.includes(tabId),

        getTabs: () => get().tabs,

        reorderTabs: (newOrder) => {
          set({ tabs: newOrder });
        },

        reset: () => set(initialState),
      }),
      {
        name: "tabs-store",
      },
    ),
  ),
);

export default useTabsStore;
