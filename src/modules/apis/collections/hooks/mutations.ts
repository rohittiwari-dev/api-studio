import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	moveCollectionAction,
	reorderCollectionsAction,
	reorderRequestsAction,
} from '../server/collection.action';
import { moveRequestToCollectionAction } from '@/modules/apis/requests/actions';
import useCollectionStore from '../store/collection.store';
import useRequestStore from '@/modules/apis/requests/store/request.store';

/**
 * Hook for moving a collection to a new parent
 */
export function useMoveCollection(
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
			newParentId,
			sortOrder,
		}: {
			collectionId: string;
			newParentId: string | null;
			sortOrder?: number;
		}) => moveCollectionAction(collectionId, newParentId, sortOrder),
		onMutate: async ({ collectionId, newParentId }) => {
			// Optimistically move collection
			useCollectionStore.getState().updateCollection(collectionId, {
				parentId: newParentId,
			});
		},
		onError: (error) => {
			onError?.(error);
			// Refresh to restore correct state on error
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({
				queryKey: ['collections', workspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
	});
}

/**
 * Hook for reordering collections within a parent
 */
export function useReorderCollections(
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
			orderedIds,
			parentId,
		}: {
			orderedIds: string[];
			parentId: string | null;
		}) => reorderCollectionsAction(orderedIds),
		onMutate: async ({ orderedIds }) => {
			// Optimistically reorder collections
			const store = useCollectionStore.getState();
			orderedIds.forEach((id, index) => {
				store.updateCollection(id, { sortOrder: index });
			});
		},
		onError: (error) => {
			onError?.(error);
			// Refresh to restore correct state on error
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({
				queryKey: ['collections', workspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
	});
}

/**
 * Hook for reordering requests within a collection
 */
export function useReorderRequests(
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
			orderedIds,
			parentId,
		}: {
			orderedIds: string[];
			parentId: string | null;
		}) => reorderRequestsAction(orderedIds),
		onMutate: async ({ orderedIds }) => {
			// Optimistically reorder requests
			const store = useRequestStore.getState();
			orderedIds.forEach((id, index) => {
				store.updateRequest(id, { sortOrder: index });
			});
		},
		onError: (error) => {
			onError?.(error);
			// Refresh to restore correct state on error
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({
				queryKey: ['requests', workspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
	});
}

/**
 * Hook for moving a request to a different collection
 */
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
		onMutate: async ({ requestId, collectionId }) => {
			// Optimistically move request
			useRequestStore.getState().updateRequest(requestId, {
				collectionId: collectionId,
			});
		},
		onError: (error) => {
			onError?.(error);
			// Refresh to restore correct state on error
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({
				queryKey: ['requests', workspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		},
	});
}
