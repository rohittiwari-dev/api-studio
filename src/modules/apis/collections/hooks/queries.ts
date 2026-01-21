import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCollectionAction,
  deleteCollectionAction,
  getAllCollections,
  getAllCollectionsOnLevelOne,
  renameCollectionAction,
} from "../server/collection.action";
import { NestedCollection } from "../types/sidebar.types";
import useCollectionStore from "../store/collection.store";

export function useCollectionsOnTopLevel(workspaceId: string) {
  return useQuery({
    queryKey: ["collections-top-level", workspaceId],
    queryFn: async () => getAllCollectionsOnLevelOne(workspaceId),
  });
}

export function useCollections(
  workspaceId: string,
  initialData?: NestedCollection[],
) {
  return useQuery<NestedCollection[]>({
    queryKey: ["collections", workspaceId],
    queryFn: async () => {
      const { data } = await getAllCollections(workspaceId);
      if (!data) throw new Error("Failed to fetch collections");
      return data;
    },
    initialData,
  });
}

export function useCreateCollection(
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
    }) => createCollectionAction(name, workspaceId, parentId),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["collections", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["collections-top-level", workspaceId],
      });
    },
  });
}

export function useDeleteCollection(
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
    mutationFn: async (collectionId: string) =>
      deleteCollectionAction(collectionId),
    onMutate: async (collectionId) => {
      // Optimistically remove from collection store
      useCollectionStore.getState().removeCollection(collectionId);
    },
    onError: (error) => {
      onError?.(error);
      // Invalidate to restore state
      queryClient.invalidateQueries({
        queryKey: ["collections", workspaceId],
      });
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["collections-top-level"],
      });
    },
  });
}

export function useRenameCollection(
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
      collectionId,
      name,
    }: {
      collectionId: string;
      name: string;
    }) => renameCollectionAction(collectionId, name),
    onMutate: async ({ collectionId, name }) => {
      // Optimistically update collection store
      useCollectionStore.getState().updateCollection(collectionId, { name });
    },
    onError: (error) => {
      onError?.(error);
      // Invalidate to restore state
      queryClient.invalidateQueries({
        queryKey: ["collections", workspaceId],
      });
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["collections-top-level"],
      });
    },
  });
}
