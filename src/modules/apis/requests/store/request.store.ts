import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { RequestStateInterface } from "../types/request.types";

interface RequestStoreState {
  requests: Record<string, RequestStateInterface>;
  snapshots: Record<string, RequestStateInterface>;
}

interface RequestStoreActions {
  setRequests: (requests: RequestStateInterface[]) => void;
  upsertRequest: (request: RequestStateInterface) => void;
  updateRequest: (id: string, updates: Partial<RequestStateInterface>) => void;
  removeRequest: (id: string) => void;
  getRequestById: (id: string) => RequestStateInterface | undefined;
  getAllRequests: () => RequestStateInterface[];
  setSnapshot: (id: string, request: RequestStateInterface) => void;
  getSnapshot: (id: string) => RequestStateInterface | undefined;
  resetToSnapshot: (id: string) => void;
  hasChanges: (id: string) => boolean;
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
            if (!req.unsaved) {
              snapshotsMap[req.id] = JSON.parse(JSON.stringify(req));
            }
          });

          set({ requests: requestsMap, snapshots: snapshotsMap });
        },

        upsertRequest: (request) => {
          set((state) => ({
            requests: { ...state.requests, [request.id]: request },
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
            const { [id]: _, ...requests } = state.requests;
            const { [id]: __, ...snapshots } = state.snapshots;
            return { requests, snapshots };
          });
        },

        getRequestById: (id) => get().requests[id],

        getAllRequests: () => Object.values(get().requests),

        setSnapshot: (id, request) => {
          set((state) => ({
            snapshots: {
              ...state.snapshots,
              [id]: JSON.parse(JSON.stringify(request)),
            },
          }));
        },

        getSnapshot: (id) => get().snapshots[id],

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
          if (!current) return false;
          if (!snapshot) return true;

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
            })
          );
        },

        reset: () => set(initialState),
      }),
      { name: "request-store-v2" },
    ),
  ),
);

export default useRequestStore;
