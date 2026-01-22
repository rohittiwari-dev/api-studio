'use client';
import React, { useEffect, useRef } from 'react';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';
import useCollectionStore from '@/modules/apis/collections/store/collection.store';
import { useWorkspaceSwitcher } from '@/modules/workspace/hooks/use-workspace-switcher';
import { RequestStateInterface } from '../types/request.types';
import { useFetchAllRequests } from '../hooks/queries';
import { useFetchAllCollectionsFlat } from '../../collections/hooks/queries';
import { Collection } from '@/generated/prisma/client';
import { Request } from '@/generated/prisma/client';

interface RequestAndCollectionProviderProps {
	children: React.ReactNode;
	collections?: Collection[];
	activeWorkspaceId: string;
	requests?: Request[];
}

export function RequestAndCollectionProvider({
	children,
	collections: initialCollections,
	activeWorkspaceId,
	requests: initialRequests,
}: RequestAndCollectionProviderProps) {
	// Prefer prop workspaceId for data fetching consistency
	const workspaceId = activeWorkspaceId;

	const { data: requests } = useFetchAllRequests(
		workspaceId,
		initialRequests,
	);
	const { data: collections } = useFetchAllCollectionsFlat(
		workspaceId,
		initialCollections,
	);

	const { setRequestsState, requests: currentRequests } =
		useRequestSyncStoreState();
	const { setCollections } = useCollectionStore();
	const { applyPendingRestore, pendingRestoreWorkspaceId } =
		useWorkspaceSwitcher();

	const hydratedWorkspaceRef = useRef<string | null>(null);

	// Initialize Collections
	useEffect(() => {
		if (collections) {
			setCollections(collections as unknown as any);
		}
	}, [collections, setCollections]);

	useEffect(() => {
		if (requests && hydratedWorkspaceRef.current !== workspaceId) {
			hydratedWorkspaceRef.current = workspaceId;
			const formattedRequests = requests.map(
				(request): RequestStateInterface => ({
					...request,
					...(currentRequests.find((r) => r.id === request.id) || {}),
					body: request.body as RequestStateInterface['body'],
					headers:
						request.headers as RequestStateInterface['headers'],
					parameters:
						request.parameters as RequestStateInterface['parameters'],
					auth: request.auth as RequestStateInterface['auth'],
					savedMessages:
						request.savedMessages as RequestStateInterface['savedMessages'],
					unsaved:
						currentRequests.find((r) => r.id === request.id)
							?.unsaved ?? false,
					type: request.type as RequestStateInterface['type'],
				}),
			);

			// 1. Pending Restore (Workspace Switch)
			if (pendingRestoreWorkspaceId === workspaceId) {
				applyPendingRestore(workspaceId, formattedRequests);
				return;
			}

			// 2. Normal Load - Preserve Drafts (New Requests not in DB)
			const drafts = currentRequests.filter(
				(r) => !requests.find((dbReq) => dbReq.id === r.id),
			);

			// Merge: DB Requests + Drafts
			const finalRequests = [...formattedRequests];

			drafts.forEach((draft) => {
				if (!finalRequests.some((r) => r.id === draft.id)) {
					finalRequests.push(draft);
				}
			});

			setRequestsState({ requests: finalRequests });
		}
	}, [
		requests,
		workspaceId,
		pendingRestoreWorkspaceId,
		applyPendingRestore,
		currentRequests,
		setRequestsState,
	]);

	return <>{children}</>;
}
