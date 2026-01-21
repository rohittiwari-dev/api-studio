import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequestAction,
  deleteRequestAction,
  renameRequestAction,
  upsertRequestAction,
  moveRequestToCollectionAction,
  duplicateRequestAction,
} from "../actions";
import {
  BodyType,
  HttpMethod,
  RequestType,
  Request,
} from "@/generated/prisma/client";
import { createId } from "@paralleldrive/cuid2";
import useSidebarStore, {
  SidebarItemInterface,
} from "@/modules/apis/layout/store/sidebar.store";
import { getAllRequests } from "../server/request";
import useRequestStore from "../store/request.store";

/**
 * Helper to sync request store with server data in background
 * This ensures the Zustand store stays in sync after operations
 */
const syncRequestStoreWithServer = async (workspaceId: string) => {
  try {
    const dbRequests = await getAllRequests(workspaceId);
    const store = useRequestStore.getState();

    // Update store with fresh data from server
    dbRequests.forEach((dbRequest) => {
      const existingRequest = store.requests[dbRequest.id];
      // Only update if not currently being edited (check via hasChanges)
      if (!existingRequest || !store.hasChanges(dbRequest.id)) {
        const requestData = {
          ...dbRequest,
          headers: dbRequest.headers as any[],
          parameters: dbRequest.parameters as any[],
          body: dbRequest.body as any,
          auth: dbRequest.auth as any,
          savedMessages: dbRequest.savedMessages as any[],
          unsaved: false,
        };
        store.upsertRequest(requestData as any);
        store.setSnapshot(dbRequest.id, requestData as any);
      }
    });
  } catch (error) {
    console.error("Background sync failed:", error);
  }
};

export function useCreateRequest(
  workspaceId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      parentId,
    }: {
      name: string;
      parentId?: string;
    }) => createRequestAction(name, workspaceId, parentId),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["requests", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-top-level", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });
    },
  });
}

export function useDeleteRequest(
  workspaceId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => deleteRequestAction(requestId),
    onMutate: async (requestId) => {
      // Cancel refetches
      await queryClient.cancelQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });

      // Snapshot previous value
      const previousSidebarTree = queryClient.getQueryData([
        "requests-side-bar-tree",
        workspaceId,
      ]);

      // Helper to remove from tree
      const removeFromTree = (items: any[]): any[] => {
        return items
          .filter((item) => item.id !== requestId)
          .map((item) => {
            if (item.type === "COLLECTION" && item.children) {
              return { ...item, children: removeFromTree(item.children) };
            }
            return item;
          });
      };

      // Optimistically remove from sidebar cache
      queryClient.setQueryData(
        ["requests-side-bar-tree", workspaceId],
        (old: any[] | undefined) => (old ? removeFromTree(old) : old),
      );

      // Optimistically remove from request store
      useRequestStore.getState().removeRequest(requestId);

      return { previousSidebarTree };
    },
    onError: (error, requestId, context) => {
      // Rollback sidebar cache
      if (context?.previousSidebarTree) {
        queryClient.setQueryData(
          ["requests-side-bar-tree", workspaceId],
          context.previousSidebarTree,
        );
      }
      onError?.(error);
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["requests", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-top-level", workspaceId],
      });
      // Background sync request store
      syncRequestStoreWithServer(workspaceId);
    },
  });
}

export function useMoveRequest(
  workspaceId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      collectionId,
    }: {
      requestId: string;
      collectionId: string | null;
    }) => moveRequestToCollectionAction(requestId, collectionId),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["requests", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-top-level", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });
    },
  });
}

export function useRenameRequest(
  workspaceId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      name,
    }: {
      requestId: string;
      name: string;
    }) => renameRequestAction(requestId, name),
    onMutate: async ({ requestId, name }) => {
      // Cancel refetches
      await queryClient.cancelQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });

      // Snapshot previous value
      const previousSidebarTree = queryClient.getQueryData([
        "requests-side-bar-tree",
        workspaceId,
      ]);

      // Helper to update name in tree
      const updateNameInTree = (items: any[]): any[] => {
        return items.map((item) => {
          if (item.id === requestId) {
            return { ...item, name };
          }
          if (item.type === "COLLECTION" && item.children) {
            return { ...item, children: updateNameInTree(item.children) };
          }
          return item;
        });
      };

      // Optimistically update sidebar cache
      queryClient.setQueryData(
        ["requests-side-bar-tree", workspaceId],
        (old: any[] | undefined) => (old ? updateNameInTree(old) : old),
      );

      // Optimistically update request store
      useRequestStore.getState().updateRequest(requestId, { name });

      return { previousSidebarTree };
    },
    onError: (error, variables, context) => {
      // Rollback sidebar cache
      if (context?.previousSidebarTree) {
        queryClient.setQueryData(
          ["requests-side-bar-tree", workspaceId],
          context.previousSidebarTree,
        );
      }
      onError?.(error);
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["requests", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-top-level", workspaceId],
      });
      // Background sync request store
      syncRequestStoreWithServer(workspaceId);
    },
  });
}

/**
 * Hook for saving (upserting) a request with automatic query invalidation
 */
export function useUpsertRequest(
  workspaceId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      requestId: string;
      name: string;
      url: string;
      workspaceId: string;
      collectionId?: string | null;
      type: "API" | "WEBSOCKET" | "SOCKET_IO";
      method?: HttpMethod | null;
      headers?: any[];
      parameters?: any[];
      body?: any;
      auth?: any;
      bodyType?: BodyType | null;
      savedMessages?: any[];
    }) =>
      upsertRequestAction(data.requestId, {
        name: data.name,
        url: data.url,
        workspaceId: data.workspaceId,
        collectionId: data.collectionId,
        type: data.type,
        method: data.method,
        headers: data.headers,
        parameters: data.parameters,
        body: data.body,
        auth: data.auth,
        bodyType: data.bodyType,
        savedMessages: data.savedMessages,
      }),
    // Optimistic update for sidebar
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });

      // Snapshot previous value for rollback
      const previousSidebarTree = queryClient.getQueryData([
        "requests-side-bar-tree",
        workspaceId,
      ]);

      // Optimistically update sidebar tree cache
      queryClient.setQueryData(
        ["requests-side-bar-tree", workspaceId],
        (old: any[] | undefined) => {
          if (!old) return old;

          // Helper to find and update request in tree
          const updateRequestInTree = (items: any[]): any[] => {
            return items.map((item) => {
              if (item.id === data.requestId) {
                // Update existing request
                return {
                  ...item,
                  name: data.name,
                  path: data.url,
                  method: data.method || "GET",
                  type: data.type,
                };
              }
              if (item.type === "COLLECTION" && item.children) {
                return {
                  ...item,
                  children: updateRequestInTree(item.children),
                };
              }
              return item;
            });
          };

          // Check if request exists in tree
          const findInTree = (items: any[], id: string): boolean => {
            for (const item of items) {
              if (item.id === id) return true;
              if (item.type === "COLLECTION" && item.children) {
                if (findInTree(item.children, id)) return true;
              }
            }
            return false;
          };

          if (findInTree(old, data.requestId)) {
            // Update existing
            return updateRequestInTree(old);
          } else {
            // Add new request (at end if no collection, or inside collection)
            const newRequest = {
              id: data.requestId,
              name: data.name,
              path: data.url,
              method: data.method || "GET",
              type: data.type,
              workspaceId: data.workspaceId,
              collectionId: data.collectionId || null,
            };

            if (data.collectionId) {
              const addToCollection = (items: any[]): any[] => {
                return items.map((item) => {
                  if (
                    item.id === data.collectionId &&
                    item.type === "COLLECTION"
                  ) {
                    return {
                      ...item,
                      children: [...(item.children || []), newRequest],
                    };
                  }
                  if (item.type === "COLLECTION" && item.children) {
                    return {
                      ...item,
                      children: addToCollection(item.children),
                    };
                  }
                  return item;
                });
              };
              return addToCollection(old);
            }
            return [...old, newRequest];
          }
        },
      );

      return { previousSidebarTree };
    },
    onError: (error, variables, context) => {
      // Rollback to previous cache on error
      if (context?.previousSidebarTree) {
        queryClient.setQueryData(
          ["requests-side-bar-tree", workspaceId],
          context.previousSidebarTree,
        );
      }
      onError?.(error);
    },
    onSuccess: (data) => {
      // Add/update the saved request in the store so it's available in listings
      if (data) {
        const store = useRequestStore.getState();
        const requestData = {
          ...data,
          headers: data.headers as any[],
          parameters: data.parameters as any[],
          body: data.body as any,
          auth: data.auth as any,
          savedMessages: data.savedMessages as any[],
          unsaved: false,
        };
        store.upsertRequest(requestData as any);
        store.setSnapshot(data.id, requestData as any);
      }

      onSuccess?.();
      // Invalidate to ensure consistency with server
      queryClient.invalidateQueries({
        queryKey: ["requests", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-top-level", workspaceId],
      });
      // Background sync request store with server
      syncRequestStoreWithServer(workspaceId);
    },
  });
}

/**
 * Hook for duplicating a request with automatic query invalidation
 */
export function useDuplicateRequest(
  workspaceId: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (originalRequest: any) =>
      duplicateRequestAction(originalRequest.requestId),
    onMutate: async (originalRequest) => {
      // Cancel refetches
      await queryClient.cancelQueries({
        queryKey: ["requests-side-bar-tree", workspaceId],
      });

      const tempId = createId();
      const optimisticName = `${originalRequest.requestName} (Copy)`;

      // Optimistic Sidebar Item
      const optimisticSidebarItem: SidebarItemInterface = {
        id: tempId,
        name: optimisticName,
        type: originalRequest.type,
        method: originalRequest.method || "GET",
        workspaceId,
        collectionId: originalRequest.collectionId || null,
        path: "", // Path isn't crucial for immediate sidebar display
      };

      const optimisticRequestItem: any = {
        // Using any temporarily to bypass strict Prisma type checks for optimistic UI
        id: tempId,
        name: optimisticName,
        type: originalRequest.type as RequestType,
        method: (originalRequest.method as HttpMethod) || "GET",
        url: originalRequest.url || "",
        headers: [],
        parameters: [],
        body: {
          raw: "",
          formData: [],
          urlEncoded: [],
          file: null,
          json: null,
        },
        auth: { type: "NONE" },
        bodyType: "NONE",
        workspaceId,
        collectionId: originalRequest.collectionId || null,
        unsaved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: 0,
        description: null,
        messageType: originalRequest.type !== "API" ? "CONNECTION" : null,
        savedMessages: [],
      };

      // 1. Add to Sidebar Store immediately
      useSidebarStore
        .getState()
        .addItem(optimisticSidebarItem, originalRequest.collectionId);

      // 2. Add to Request Store
      useRequestStore.getState().upsertRequest(optimisticRequestItem as any);

      return { tempId, collectionId: originalRequest.collectionId };
    },
    onError: (error, variables, context) => {
      onError?.(error);
      if (context?.tempId) {
        useSidebarStore.getState().removeItem(context.tempId);
        useRequestStore.getState().removeRequest(context.tempId);
      }
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.();

      if (context?.tempId) {
        // Remove optimistic item and add real item
        useSidebarStore.getState().removeItem(context.tempId);
        useRequestStore.getState().removeRequest(context.tempId);

        // Transform server response to Sidebar Item
        const realSidebarItem: SidebarItemInterface = {
          id: data.id,
          name: data.name,
          type: data.type as RequestType,
          method: (data.method as HttpMethod) || null,
          workspaceId: data.workspaceId,
          collectionId: data.collectionId,
          path: "",
        };

        // Add real item to Sidebar Store
        useSidebarStore.getState().addItem(realSidebarItem, data.collectionId);

        // Helper to add to request store if needed (optional since we might fetch on click)
        // But good for consistency
        const store = useRequestStore.getState();
        const requestData = {
          ...data,
          headers: data.headers as any[],
          parameters: data.parameters as any[],
          body: data.body as any,
          auth: data.auth as any,
          savedMessages: data.savedMessages as any[],
          unsaved: false,
        };
        store.upsertRequest(requestData as any);
        store.setSnapshot(data.id, requestData as any);
      }

      // Soft refresh other lists, but NOT the tree to avoid shake
      queryClient.invalidateQueries({
        queryKey: ["requests", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-top-level", workspaceId],
      });
    },
  });
}

export function useFetchAllRequests(
  workspaceId: string,
  initialData: Request[],
) {
  return useQuery({
    queryKey: ["requests", workspaceId],
    queryFn: () => getAllRequests(workspaceId),
    initialData,
  });
}
