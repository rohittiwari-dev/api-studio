'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getWebhooks,
	getWebhook,
	createWebhook,
	updateWebhook,
	deleteWebhook,
	getWebhookEvents,
	clearWebhookEvents,
	getWebhookEventCount,
} from '../server/webhooks.actions';
import type { UpdateWebhookInput } from '../types/webhook.types';

// Query keys
export const webhookKeys = {
	all: ['webhooks'] as const,
	lists: () => [...webhookKeys.all, 'list'] as const,
	list: (workspaceId: string) =>
		[...webhookKeys.lists(), workspaceId] as const,
	details: () => [...webhookKeys.all, 'detail'] as const,
	detail: (id: string) => [...webhookKeys.details(), id] as const,
	events: () => [...webhookKeys.all, 'events'] as const,
	eventList: (webhookId: string) =>
		[...webhookKeys.events(), webhookId] as const,
	eventCount: (webhookId: string) =>
		[...webhookKeys.events(), webhookId, 'count'] as const,
};

/**
 * Hook to fetch all webhooks for a workspace
 */
export function useWebhooks(workspaceId: string) {
	return useQuery({
		queryKey: webhookKeys.list(workspaceId),
		queryFn: () => getWebhooks(workspaceId),
		enabled: !!workspaceId,
		staleTime: 1000 * 60, // 1 minute
	});
}

/**
 * Hook to fetch a single webhook
 */
export function useWebhook(id: string) {
	return useQuery({
		queryKey: webhookKeys.detail(id),
		queryFn: () => getWebhook(id),
		enabled: !!id,
	});
}

/**
 * Hook to fetch webhook events
 */
export function useWebhookEvents(webhookId: string, limit = 100) {
	return useQuery({
		queryKey: webhookKeys.eventList(webhookId),
		queryFn: () => getWebhookEvents(webhookId, limit),
		enabled: !!webhookId,
		refetchInterval: 10000, // Refetch every 10 seconds as backup
	});
}

/**
 * Hook to fetch webhook event count
 */
export function useWebhookEventCount(webhookId: string) {
	return useQuery({
		queryKey: webhookKeys.eventCount(webhookId),
		queryFn: () => getWebhookEventCount(webhookId),
		enabled: !!webhookId,
	});
}

/**
 * Hook to create a webhook
 */
export function useCreateWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			name: string;
			description?: string;
			workspaceId: string;
		}) => createWebhook(data),
		onSuccess: (newWebhook) => {
			// Invalidate and refetch webhooks list
			queryClient.invalidateQueries({
				queryKey: webhookKeys.list(newWebhook.workspaceId),
			});
		},
	});
}

/**
 * Hook to update a webhook
 */
export function useUpdateWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWebhookInput }) =>
			updateWebhook(id, data),
		onSuccess: (updatedWebhook) => {
			// Update cache
			queryClient.setQueryData(
				webhookKeys.detail(updatedWebhook.id),
				updatedWebhook,
			);
			queryClient.invalidateQueries({
				queryKey: webhookKeys.list(updatedWebhook.workspaceId),
			});
		},
	});
}

/**
 * Hook to delete a webhook
 */
export function useDeleteWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			workspaceId,
		}: {
			id: string;
			workspaceId: string;
		}) => deleteWebhook(id).then(() => ({ id, workspaceId })),
		onSuccess: ({ id, workspaceId }) => {
			// Remove from cache
			queryClient.removeQueries({ queryKey: webhookKeys.detail(id) });
			queryClient.invalidateQueries({
				queryKey: webhookKeys.list(workspaceId),
			});
		},
	});
}

/**
 * Hook to clear webhook events
 */
export function useClearWebhookEvents() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (webhookId: string) => clearWebhookEvents(webhookId),
		onSuccess: (_, webhookId) => {
			// Clear events cache
			queryClient.setQueryData(webhookKeys.eventList(webhookId), []);
			queryClient.setQueryData(webhookKeys.eventCount(webhookId), 0);
		},
	});
}
