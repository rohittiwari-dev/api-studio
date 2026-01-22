import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TabsStoreState {
	tabs: string[];
	activeTab: string | null;
}

interface TabsStoreActions {
	openTab: (tabId: string) => void;
	closeTab: (tabId: string) => void;
	setActiveTab: (tabId: string | null) => void;
	closeAllTabs: () => void;
	closeOtherTabs: (keepTabId: string) => void;
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
						if (state.tabs.includes(tabId)) {
							return { activeTab: tabId };
						}
						return {
							tabs: [...state.tabs, tabId],
							activeTab: tabId,
						};
					});
				},

				closeTab: (tabId) => {
					set((state) => {
						const index = state.tabs.indexOf(tabId);
						if (index === -1) {
							return state;
						}

						const newTabs = state.tabs.filter((id) => id !== tabId);
						let newActiveTab: string | null = null;

						if (state.activeTab === tabId && newTabs.length > 0) {
							newActiveTab =
								newTabs[Math.max(0, index - 1)] || null;
						} else if (state.activeTab !== tabId) {
							newActiveTab = state.activeTab;
						}

						return { tabs: newTabs, activeTab: newActiveTab };
					});
				},

				setActiveTab: (tabId) => set({ activeTab: tabId }),

				closeAllTabs: () => set({ tabs: [], activeTab: null }),

				closeOtherTabs: (keepTabId) => {
					set((state) => {
						if (!state.tabs.includes(keepTabId)) {
							return { tabs: [], activeTab: null };
						}
						return { tabs: [keepTabId], activeTab: keepTabId };
					});
				},

				reset: () => set(initialState),
			}),
			{ name: 'tabs-store' },
		),
	),
);

export default useTabsStore;
