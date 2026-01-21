import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { RequestStateInterface } from "../types/request.types";

/**
 * Simplified Request Store
 * - Stores requests indexed by ID
 * - Keeps original snapshots for diff-based unsaved detection
 * - Supports optimistic updates with rollback
 */

export interface RequestStoreState {
  // Requests indexed by ID for O(1) access
  requests: Record<string, RequestStateInterface>;
  // Original snapshots for diff comparison (keyed by request ID)
  snapshots: Record<string, RequestStateInterface>;
}

interface RequestStoreActions {
  // Bulk set requests (from DB fetch)
  setRequests: (requests: RequestStateInterface[]) => void;
  // Add or update a single request
  upsertRequest: (request: RequestStateInterface) => void;
  // Update specific fields of a request
  updateRequest: (id: string, updates: Partial<RequestStateInterface>) => void;
  // Remove a request
  removeRequest: (id: string) => void;
  // Get request by ID
  getRequestById: (id: string) => RequestStateInterface | undefined;
  // Get all requests as array
  getAllRequests: () => RequestStateInterface[];
  // Get requests for a workspace
  getWorkspaceRequests: (workspaceId: string) => RequestStateInterface[];
  // Snapshot management for diff detection
  setSnapshot: (id: string, request: RequestStateInterface) => void;
  getSnapshot: (id: string) => RequestStateInterface | undefined;
  clearSnapshot: (id: string) => void;
  // Reset request to its snapshot (discard changes)
  resetToSnapshot: (id: string) => void;
  // Check if request has changes from snapshot
  hasChanges: (id: string) => boolean;
  // Get all requests with unsaved changes
  getUnsavedRequests: (workspaceId: string) => RequestStateInterface[];
  // Reset store
  reset: () => void;
}

const initialState: RequestStoreState = {
  requests: {},
  snapshots: {},
};

const useRequestStore = create<RequestStoreState & RequestStoreActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setRequests: (requests) => {
          const requestsMap: Record<string, RequestStateInterface> = {};
          const snapshotsMap: Record<string, RequestStateInterface> = {};

          requests.forEach((req) => {
            requestsMap[req.id] = req;
            // Set snapshot for saved requests (not NEW type)
            if (req.type !== "NEW") {
              snapshotsMap[req.id] = JSON.parse(JSON.stringify(req));
            }
          });

          set({ requests: requestsMap, snapshots: snapshotsMap });
        },

        upsertRequest: (request) => {
          set((state) => ({
            requests: {
              ...state.requests,
              [request.id]: request,
            },
          }));
        },

        updateRequest: (id, updates) => {
          set((state) => {
            const existing = state.requests[id];
            if (!existing) return state;

            return {
              requests: {
                ...state.requests,
                [id]: { ...existing, ...updates },
              },
            };
          });
        },

        removeRequest: (id) => {
          set((state) => {
            const { [id]: removed, ...rest } = state.requests;
            const { [id]: removedSnapshot, ...restSnapshots } = state.snapshots;
            return { requests: rest, snapshots: restSnapshots };
          });
        },

        getRequestById: (id) => get().requests[id],

        getAllRequests: () => Object.values(get().requests),

        getWorkspaceRequests: (workspaceId) =>
          Object.values(get().requests).filter(
            (r) => r.workspaceId === workspaceId,
          ),

        setSnapshot: (id, request) => {
          set((state) => ({
            snapshots: {
              ...state.snapshots,
              [id]: JSON.parse(JSON.stringify(request)),
            },
          }));
        },

        getSnapshot: (id) => get().snapshots[id],

        clearSnapshot: (id) => {
          set((state) => {
            const { [id]: removed, ...rest } = state.snapshots;
            return { snapshots: rest };
          });
        },

        resetToSnapshot: (id) => {
          const snapshot = get().snapshots[id];
          if (snapshot) {
            set((state) => ({
              requests: {
                ...state.requests,
                [id]: JSON.parse(JSON.stringify(snapshot)),
              },
            }));
          }
        },

        hasChanges: (id) => {
          const current = get().requests[id];
          const snapshot = get().snapshots[id];

          if (!current || !snapshot) return false;
          if (current.type === "NEW") return true;

          // Deep comparison of relevant fields
          return (
            JSON.stringify({
              name: current.name,
              url: current.url,
              method: current.method,
              headers: current.headers,
              parameters: current.parameters,
              body: current.body,
              auth: current.auth,
              bodyType: current.bodyType,
              savedMessages: current.savedMessages,
            }) !==
            JSON.stringify({
              name: snapshot.name,
              url: snapshot.url,
              method: snapshot.method,
              headers: snapshot.headers,
              parameters: snapshot.parameters,
              body: snapshot.body,
              auth: snapshot.auth,
              bodyType: snapshot.bodyType,
              savedMessages: snapshot.savedMessages,
            })
          );
        },

        getUnsavedRequests: (workspaceId) => {
          const state = get();
          return Object.values(state.requests).filter((req) => {
            if (req.workspaceId !== workspaceId) return false;
            if (req.type === "NEW") return true;
            return state.hasChanges(req.id);
          });
        },

        reset: () => set(initialState),
      }),
      {
        name: "request-store-v2",
      },
    ),
  ),
);

export default useRequestStore;
