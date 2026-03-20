import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { deepEqual } from "@/lib/utils/deepEqual";
import type { RequestStateInterface } from "../types/request.types";

interface RequestStoreState {
  requests: Record<string, RequestStateInterface>;
  snapshots: Record<string, RequestStateInterface>;
  /** Tracks in-flight AbortControllers per request id */
  controllers: Record<string, AbortController>;
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
  /**
   * Returns a fresh AbortSignal for the given request id,
   * automatically aborting any previously registered in-flight request.
   */
  getAbortSignal: (id: string) => AbortSignal;
  /** Abort an in-flight request by id */
  abortRequest: (id: string) => void;
  /**
   * Sends the API request for the given id.
   * - Targets localhost URLs directly from the browser (no proxy hop)
   * - All other URLs go through /api/proxy
   * Returns the raw fetch Response.
   */
  sendProxyRequest: (
    id: string,
    payload: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: string;
      cookies?: { key: string; value: string }[];
      auth?: unknown;
    },
  ) => Promise<Response>;
}

const initialState: RequestStoreState = {
  requests: {},
  snapshots: {},
  controllers: {},
};

// Helper to extract comparable fields for diffing
const getComparableFields = (req: RequestStateInterface) => ({
  name: req.name,
  url: req.url,
  method: req.method,
  headers: req.headers,
  parameters: req.parameters,
  body: req.body,
  auth: req.auth,
  bodyType: req.bodyType,
});

/** Returns true when the URL targets the local machine */
function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

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
              snapshotsMap[req.id] = JSON.parse(
                JSON.stringify(req),
              ) as RequestStateInterface;
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
            if (!existing) {
              return state;
            }

            const isSaveAction = updates.unsaved === false;

            const newState = { ...existing, ...updates };

            let finalSnapshot = state.snapshots[id];
            let finalUnsaved = true;

            if (isSaveAction) {
              finalUnsaved = false;
              finalSnapshot = JSON.parse(
                JSON.stringify(newState),
              ) as RequestStateInterface;
            } else {
              if (!finalSnapshot) {
                finalUnsaved = true;
              } else {
                const hasChanges = !deepEqual(
                  getComparableFields(newState),
                  getComparableFields(finalSnapshot),
                );
                finalUnsaved = hasChanges;
              }
            }

            newState.unsaved = finalUnsaved;

            const nextSnapshots = isSaveAction
              ? { ...state.snapshots, [id]: finalSnapshot }
              : state.snapshots;

            return {
              requests: {
                ...state.requests,
                [id]: newState,
              },
              snapshots: nextSnapshots,
            };
          });
        },

        removeRequest: (id) => {
          set((state) => {
            const { [id]: _, ...requests } = state.requests;
            const { [id]: __, ...snapshots } = state.snapshots;
            const { [id]: ___, ...controllers } = state.controllers;
            return { requests, snapshots, controllers };
          });
        },

        getRequestById: (id) => get().requests[id],

        getAllRequests: () => Object.values(get().requests),

        setSnapshot: (id, request) => {
          set((state) => ({
            snapshots: {
              ...state.snapshots,
              [id]: JSON.parse(
                JSON.stringify(request),
              ) as RequestStateInterface,
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
                [id]: JSON.parse(
                  JSON.stringify(snapshot),
                ) as RequestStateInterface,
              },
            }));
          }
        },

        hasChanges: (id) => {
          const current = get().requests[id];
          const snapshot = get().snapshots[id];
          if (!current) {
            return false;
          }
          if (!snapshot) {
            return true;
          }

          return !deepEqual(
            getComparableFields(current),
            getComparableFields(snapshot),
          );
        },

        getAbortSignal: (id) => {
          // Abort any existing in-flight request for this tab
          const existing = get().controllers[id];
          if (existing) {
            existing.abort();
          }
          const controller = new AbortController();
          set((state) => ({
            controllers: { ...state.controllers, [id]: controller },
          }));
          return controller.signal;
        },

        abortRequest: (id) => {
          const controller = get().controllers[id];
          if (controller) {
            controller.abort();
            set((state) => {
              const { [id]: _, ...controllers } = state.controllers;
              return { controllers };
            });
          }
        },

        sendProxyRequest: async (id, payload) => {
          const signal = get().getAbortSignal(id);

          // ---------------------------------------------------------------
          // Localhost bypass — browser makes the call directly, no proxy hop
          // ---------------------------------------------------------------
          if (isLocalhostUrl(payload.url)) {
            const headers: Record<string, string> = {
              "User-Agent": "API-Client/1.0",
              Accept: "*/*",
              ...payload.headers,
            };

            if (payload.cookies && payload.cookies.length > 0) {
              headers.Cookie = payload.cookies
                .map((c) => `${c.key}=${c.value}`)
                .join("; ");
            }

            return fetch(payload.url, {
              method: payload.method || "GET",
              headers,
              body: payload.body,
              signal,
            });
          }

          // ---------------------------------------------------------------
          // Remote URLs — go through server-side proxy
          // ---------------------------------------------------------------
          return fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal,
          });
        },

        reset: () => set(initialState),
      }),
      {
        name: "request-store-v2",
        // Only persist the minimal display fields — not the full request data
        // or snapshots, which can be very large and cause localStorage jank.
        partialize: (state) => ({
          requests: Object.fromEntries(
            Object.entries(state.requests).map(([k, v]) => [
              k,
              {
                id: v.id,
                name: v.name,
                url: v.url,
                method: v.method,
                type: v.type,
                workspaceId: v.workspaceId,
                collectionId: v.collectionId,
                unsaved: v.unsaved,
              },
            ]),
          ),
          snapshots: {},
          controllers: {},
        }),
      },
    ),
  ),
);

export default useRequestStore;
