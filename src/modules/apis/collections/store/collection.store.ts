import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Collection Store
 * - Stores collections indexed by ID
 * - Supports nested collection structure
 */

export interface CollectionInterface {
  id: string;
  name: string;
  workspaceId: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionStoreState {
  // Collections indexed by ID
  collections: Record<string, CollectionInterface>;
}

interface CollectionStoreActions {
  // Bulk set collections
  setCollections: (collections: CollectionInterface[]) => void;
  // Add or update a collection
  upsertCollection: (collection: CollectionInterface) => void;
  // Update specific fields
  updateCollection: (id: string, updates: Partial<CollectionInterface>) => void;
  // Remove a collection
  removeCollection: (id: string) => void;
  // Get collection by ID
  getCollectionById: (id: string) => CollectionInterface | undefined;
  // Get all collections as array
  getAllCollections: () => CollectionInterface[];
  // Get workspace collections
  getWorkspaceCollections: (workspaceId: string) => CollectionInterface[];
  // Get root collections (no parent)
  getRootCollections: (workspaceId: string) => CollectionInterface[];
  // Get child collections
  getChildCollections: (parentId: string) => CollectionInterface[];
  // Reset store
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
          const collectionsMap: Record<string, CollectionInterface> = {};
          collections.forEach((col) => {
            collectionsMap[col.id] = col;
          });
          set({ collections: collectionsMap });
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
            if (!existing) return state;

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
            const { [id]: removed, ...rest } = state.collections;
            return { collections: rest };
          });
        },

        getCollectionById: (id) => get().collections[id],

        getAllCollections: () => Object.values(get().collections),

        getWorkspaceCollections: (workspaceId) =>
          Object.values(get().collections).filter(
            (c) => c.workspaceId === workspaceId,
          ),

        getRootCollections: (workspaceId) =>
          Object.values(get().collections)
            .filter((c) => c.workspaceId === workspaceId && c.parentId === null)
            .sort((a, b) => a.sortOrder - b.sortOrder),

        getChildCollections: (parentId) =>
          Object.values(get().collections)
            .filter((c) => c.parentId === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder),

        reset: () => set(initialState),
      }),
      {
        name: "collection-store",
      },
    ),
  ),
);

export default useCollectionStore;
