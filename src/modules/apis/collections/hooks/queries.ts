import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createCollectionAction,
	deleteCollectionAction,
	getAllCollections,
	getAllCollectionsFlat,
	getAllCollectionsOnLevelOne,
	renameCollectionAction,
} from '../server/collection.action';
import { NestedCollection } from '../types/sidebar.types';
import useCollectionStore from '../store/collection.store';
import { Collection } from '@/generated/prisma/browser';

export function useCollectionsOnTopLevel(workspaceId: string) {
	return useQuery({
		queryKey: ['collections-top-level', workspaceId],
		queryFn: async () => getAllCollectionsOnLevelOne(workspaceId),
	});
}

export function useCollections(
	workspaceId: string,
	initialData?: NestedCollection[],
) {
	return useQuery<NestedCollection[]>({
		queryKey: ['collections', workspaceId],
		queryFn: async () => {
			const { data } = await getAllCollections(workspaceId);
			if (!data) {
				throw new Error('Failed to fetch collections');
			}
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
		onSuccess?: (collection: { id: string; name: string }) => void;
		onError?: (error: unknown) => void;
	},
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			name,
			parentId,
			tempId,
		}: {
			name: string;
			parentId?: string;
			tempId: string;
		}) => {
			const result = await createCollectionAction({
				name,
				workspaceId,
				parentID: parentId,
				id: tempId,
			});
			return { ...result };
		},
		onMutate: async ({ name, parentId, tempId }) => {
			// Optimistically add collection to store with temp ID
			const optimisticCollection = {
				id: tempId,
				name,
				workspaceId,
				parentId: parentId || null,
				sortOrder: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			useCollectionStore
				.getState()
				.upsertCollection(optimisticCollection);
			return { tempId };
		},
		onError: (error, variables, context) => {
			if (context?.tempId) {
				useCollectionStore.getState().removeCollection(context.tempId);
			}
			onError?.(error);
		},
		onSuccess: (data, variables, context) => {
			if (context?.tempId) {
				useCollectionStore.getState().removeCollection(context.tempId);
			}
			useCollectionStore.getState().upsertCollection({
				id: data.id,
				name: data.name,
				workspaceId: data.workspaceId,
				parentId: data.parentId,
				sortOrder: data.sortOrder ?? 0,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			});
			onSuccess?.({ id: data.id, name: data.name });
			queryClient.invalidateQueries({
				queryKey: ['collections', workspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['collections-top-level', workspaceId],
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
				queryKey: ['collections', workspaceId],
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({
				queryKey: ['collections'],
			});
			queryClient.invalidateQueries({
				queryKey: ['collections-top-level'],
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
			useCollectionStore
				.getState()
				.updateCollection(collectionId, { name });
		},
		onError: (error) => {
			onError?.(error);
			// Invalidate to restore state
			queryClient.invalidateQueries({
				queryKey: ['collections', workspaceId],
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({
				queryKey: ['collections'],
			});
			queryClient.invalidateQueries({
				queryKey: ['collections-top-level'],
			});
		},
	});
}

export function useFetchAllCollectionsFlat(
	workspaceId?: string,
	initialData?: Collection[],
) {
	return useQuery({
		queryKey: ['collections', workspaceId],
		queryFn: async () => {
			if (workspaceId) {
				const data = await getAllCollectionsFlat(workspaceId);
				if (data.length > 0) {
					return data;
				}
			}
			return [];
		},
		initialData,
	});
}
