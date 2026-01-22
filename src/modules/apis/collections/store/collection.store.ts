import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface CollectionInterface {
	id: string;
	name: string;
	workspaceId: string;
	parentId: string | null;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
}

interface CollectionStoreState {
	collections: Record<string, CollectionInterface>;
}

interface CollectionStoreActions {
	setCollections: (collections: CollectionInterface[]) => void;
	upsertCollection: (collection: CollectionInterface) => void;
	updateCollection: (
		id: string,
		updates: Partial<CollectionInterface>,
	) => void;
	removeCollection: (id: string) => void;
	getAllCollections: () => CollectionInterface[];
	reset: () => void;
}

const initialState: CollectionStoreState = {
	collections: {},
};

const useCollectionStore = create<
	CollectionStoreState & CollectionStoreActions
>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				setCollections: (collections) => {
					const map: Record<string, CollectionInterface> = {};
					collections.forEach((col) => (map[col.id] = col));
					set({ collections: map });
				},

				upsertCollection: (collection) => {
					set((state) => ({
						collections: {
							...state.collections,
							[collection.id]: collection,
						},
					}));
				},

				updateCollection: (id, updates) => {
					set((state) => {
						const existing = state.collections[id];
						if (!existing) {
							return state;
						}
						return {
							collections: {
								...state.collections,
								[id]: { ...existing, ...updates },
							},
						};
					});
				},

				removeCollection: (id) => {
					set((state) => {
						const { [id]: _, ...rest } = state.collections;
						return { collections: rest };
					});
				},

				getAllCollections: () => Object.values(get().collections),

				reset: () => set(initialState),
			}),
			{ name: 'collection-store' },
		),
	),
);

export default useCollectionStore;
