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
      // Optimistically remove from request store
      useRequestStore.getState().removeRequest(requestId);
    },
    onError: (error, requestId) => {
      onError?.(error);
      // We could try to restore from a backup, but simple re-fetch on error might be safer/easier
      queryClient.invalidateQueries({ queryKey: ["requests", workspaceId] });
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
      // Optimistically update request store
      useRequestStore.getState().updateRequest(requestId, { name });
    },
    onError: (error) => {
      onError?.(error);
      queryClient.invalidateQueries({ queryKey: ["requests", workspaceId] });
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
    onMutate: async (data) => {
      // Optimistically update request store
      const store = useRequestStore.getState();

      const optimisticRequest = {
        id: data.requestId,
        name: data.name,
        url: data.url,
        type: data.type,
        method: data.method || "GET",
        workspaceId: data.workspaceId,
        collectionId: data.collectionId || null,
        headers: data.headers || [],
        parameters: data.parameters || [],
        body: data.body || {
          raw: "",
          formData: [],
          urlEncoded: [],
          file: null,
          json: null,
        },
        auth: data.auth || { type: "NONE" },
        bodyType: data.bodyType || "NONE",
        savedMessages: data.savedMessages || [],
        unsaved: false, // Optimistically assumed saved
        createdAt: new Date(), // approximations
        updatedAt: new Date(),
        sortOrder: 0,
      };

      store.upsertRequest(optimisticRequest as any);
    },
    onError: (error) => {
      onError?.(error);
      queryClient.invalidateQueries({ queryKey: ["requests", workspaceId] });
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
      const tempId = createId();
      const optimisticName = `${originalRequest.requestName} (Copy)`;

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

      // Add to Request Store (sidebar will auto-update)
      useRequestStore.getState().upsertRequest(optimisticRequestItem as any);

      return { tempId, collectionId: originalRequest.collectionId };
    },
    onError: (error, variables, context) => {
      onError?.(error);
      if (context?.tempId) {
        useRequestStore.getState().removeRequest(context.tempId);
      }
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.();

      if (context?.tempId) {
        // Remove optimistic item
        useRequestStore.getState().removeRequest(context.tempId);

        // Add real item to Request Store
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
