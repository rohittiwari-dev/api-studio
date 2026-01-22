'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RequestStateInterface } from '../types/request.types';
import { upsertRequestAction } from '../actions';
import useRequestStore from '../store/request.store';
import useTabsStore from '../store/tabs.store';
import useWorkspaceState from '@/modules/workspace/store';
import {
	UnsavedChangesAction,
	UnsavedChangesDialogProps,
} from '../components/UnsavedChangesDialog';
import { hasRequestChanges } from '../utils/requestDiff';

interface PendingAction {
	type: UnsavedChangesAction;
	unsavedRequests: RequestStateInterface[];
	onConfirm: () => void;
	tabIdsToClose?: string[];
}

export function useUnsavedChangesGuard() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [pendingAction, setPendingAction] = useState<PendingAction | null>(
		null,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isDiscarding, setIsDiscarding] = useState(false);

	const { activeWorkspace } = useWorkspaceState();
	const queryClient = useQueryClient();

	const {
		getAllRequests,
		getSnapshot,
		resetToSnapshot,
		removeRequest,
		setSnapshot,
		upsertRequest,
	} = useRequestStore();

	const { tabs } = useTabsStore();

	const getTabRequests = useCallback((): RequestStateInterface[] => {
		const allRequests = getAllRequests();
		return allRequests.filter(
			(r) => tabs.includes(r.id) && r.workspaceId === activeWorkspace?.id,
		);
	}, [getAllRequests, tabs, activeWorkspace?.id]);

	const getUnsavedRequests = useCallback(
		(tabIdsToCheck: string[]): RequestStateInterface[] => {
			const allRequests = getAllRequests();
			return allRequests.filter((r) => {
				if (!tabIdsToCheck.includes(r.id)) {
					return false;
				}
				if (r.workspaceId !== activeWorkspace?.id) {
					return false;
				}

				const snapshot = getSnapshot(r.id);
				if (!snapshot) {
					return true;
				}

				return hasRequestChanges(r, snapshot);
			});
		},
		[getAllRequests, getSnapshot, activeWorkspace?.id],
	);

	const hasUnsavedChanges = useCallback(
		(tabIdsToCheck: string[]): boolean => {
			return getUnsavedRequests(tabIdsToCheck).length > 0;
		},
		[getUnsavedRequests],
	);

	const saveAllRequests = async (requestsToSave: RequestStateInterface[]) => {
		const savePromises = requestsToSave
			.filter((req) => req.type !== 'NEW')
			.map(async (request) => {
				const savedRequest = await upsertRequestAction(request.id, {
					name: request.name,
					url: request.url || '',
					workspaceId: request.workspaceId,
					collectionId: request.collectionId,
					type: (request.type || 'API') as
						| 'API'
						| 'WEBSOCKET'
						| 'SOCKET_IO',
					method: request.method,
					headers: request.headers,
					parameters: request.parameters,
					body: request.body,
					auth: request.auth,
					bodyType: request.bodyType,
					savedMessages: request.savedMessages ?? [],
				});

				if (savedRequest) {
					const updatedRequest: RequestStateInterface = {
						...savedRequest,
						headers:
							savedRequest.headers as RequestStateInterface['headers'],
						parameters:
							savedRequest.parameters as RequestStateInterface['parameters'],
						body: savedRequest.body as RequestStateInterface['body'],
						auth: savedRequest.auth as RequestStateInterface['auth'],
						savedMessages:
							savedRequest.savedMessages as RequestStateInterface['savedMessages'],
						unsaved: false,
					};
					upsertRequest(updatedRequest);
					setSnapshot(request.id, updatedRequest);
				}

				return savedRequest;
			});

		await Promise.all(savePromises);

		const workspaceId = activeWorkspace?.id;
		if (workspaceId) {
			queryClient.invalidateQueries({
				queryKey: ['requests', workspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['requests-side-bar-tree', workspaceId],
			});
		}
	};

	const handleSave = async () => {
		if (!pendingAction) {
			return;
		}

		const requestsToSave = pendingAction.unsavedRequests.filter(
			(req) => req.type !== 'NEW',
		);
		const currentPendingAction = pendingAction;

		setIsSaving(true);
		try {
			setDialogOpen(false);
			await saveAllRequests(requestsToSave);

			currentPendingAction.onConfirm();
			setPendingAction(null);

			toast.success(
				requestsToSave.length === 1
					? 'Request saved'
					: `${requestsToSave.length} requests saved`,
			);
		} catch (error) {
			console.error('Failed to save requests:', error);
			toast.error('Failed to save requests');
			setDialogOpen(true);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDiscard = async () => {
		if (!pendingAction) {
			return;
		}

		setIsDiscarding(true);
		try {
			pendingAction.unsavedRequests.forEach((req) => {
				const snapshot = getSnapshot(req.id);
				if (!snapshot) {
					removeRequest(req.id);
				} else {
					resetToSnapshot(req.id);
				}
			});

			setDialogOpen(false);
			pendingAction.onConfirm();
			setPendingAction(null);
		} catch (error) {
			console.error('Failed to discard changes:', error);
			toast.error('Failed to discard changes');
		} finally {
			setIsDiscarding(false);
		}
	};

	const handleCancel = () => {
		setDialogOpen(false);
		setPendingAction(null);
	};

	const confirmClose = useCallback(
		(tabId: string, onConfirm: () => void) => {
			const unsavedRequests = getUnsavedRequests([tabId]);

			if (unsavedRequests.length === 0) {
				onConfirm();
				return;
			}

			setPendingAction({
				type: 'close',
				unsavedRequests,
				onConfirm,
				tabIdsToClose: [tabId],
			});
			setDialogOpen(true);
		},
		[getUnsavedRequests],
	);

	const confirmCloseAll = useCallback(
		(onConfirm: () => void) => {
			const tabRequests = getTabRequests();
			const allTabIds = tabRequests.map((t) => t.id);
			const unsavedRequests = getUnsavedRequests(allTabIds);

			if (unsavedRequests.length === 0) {
				onConfirm();
				return;
			}

			setPendingAction({
				type: 'close-all',
				unsavedRequests,
				onConfirm,
				tabIdsToClose: allTabIds,
			});
			setDialogOpen(true);
		},
		[getTabRequests, getUnsavedRequests],
	);

	const confirmCloseOthers = useCallback(
		(keepTabId: string, onConfirm: () => void) => {
			const tabRequests = getTabRequests();
			const otherTabIds = tabRequests
				.filter((t) => t.id !== keepTabId)
				.map((t) => t.id);
			const unsavedRequests = getUnsavedRequests(otherTabIds);

			if (unsavedRequests.length === 0) {
				onConfirm();
				return;
			}

			setPendingAction({
				type: 'close-others',
				unsavedRequests,
				onConfirm,
				tabIdsToClose: otherTabIds,
			});
			setDialogOpen(true);
		},
		[getTabRequests, getUnsavedRequests],
	);

	const confirmWorkspaceSwitch = useCallback(
		(onConfirm: () => void) => {
			const tabRequests = getTabRequests();
			const allTabIds = tabRequests.map((t) => t.id);
			const unsavedRequests = getUnsavedRequests(allTabIds);

			if (unsavedRequests.length === 0) {
				onConfirm();
				return;
			}

			setPendingAction({
				type: 'switch-workspace',
				unsavedRequests,
				onConfirm,
				tabIdsToClose: allTabIds,
			});
			setDialogOpen(true);
		},
		[getTabRequests, getUnsavedRequests],
	);

	return {
		dialogOpen,
		isSaving,
		isDiscarding,
		pendingAction,
		dialogProps: pendingAction
			? ({
					open: dialogOpen,
					onOpenChange: setDialogOpen,
					unsavedRequests: pendingAction.unsavedRequests,
					onSave: handleSave,
					onDiscard: handleDiscard,
					onCancel: handleCancel,
					isSaving,
					isDiscarding,
					actionType: pendingAction.type,
				} as UnsavedChangesDialogProps)
			: null,
		hasUnsavedChanges,
		getUnsavedRequests,
		confirmClose,
		confirmCloseAll,
		confirmCloseOthers,
		confirmWorkspaceSwitch,
	};
}

export default useUnsavedChangesGuard;
