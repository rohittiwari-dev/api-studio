'use client';

import React, { useEffect, useCallback } from 'react';
import { createId } from '@paralleldrive/cuid2';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';
import useWorkspaceState from '@/modules/workspace/store';
import useCommandPaletteStore from '../../layout/store/commandPalette.store';

interface KeyboardShortcutsProviderProps {
	children: React.ReactNode;
}

/**
 * Provider that handles global keyboard shortcuts for the requests module.
 * Currently supports:
 * - Alt+N: Create a new HTTP request
 */
export function KeyboardShortcutsProvider({
	children,
}: KeyboardShortcutsProviderProps) {
	const { toggle } = useCommandPaletteStore();
	const { openRequest } = useRequestSyncStoreState();
	const { activeWorkspace } = useWorkspaceState();

	const createNewRequest = useCallback(() => {
		if (!activeWorkspace?.id) {
			return;
		}

		const id = createId();
		openRequest({
			id,
			type: 'API',
			name: 'New Request',
			url: '',
			method: 'GET',
			unsaved: true,
			collectionId: null,
			workspaceId: activeWorkspace.id,
			body: {
				raw: '',
				formData: [],
				urlEncoded: [],
				file: null,
				json: {},
			},
			auth: { type: 'NONE' },
			headers: [],
			parameters: [],
			bodyType: 'NONE',
			description: '',
			messageType: 'CONNECTION',
			createdAt: new Date(),
			updatedAt: new Date(),
			savedMessages: [],
			sortOrder: 0,
		});
	}, [openRequest, activeWorkspace]);

	//   Keyboard shortcut to create new request ctrl+n / cmd+n
	useEffect(() => {
		// Check if running as installed PWA (standalone mode)
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true;

		const handleKeyDown = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();

			// Ctrl+N / Cmd+N - works in PWA standalone mode
			if ((e.ctrlKey || e.metaKey) && !e.altKey && key === 'n') {
				e.preventDefault();
				e.stopPropagation();
				createNewRequest();
				return;
			}

			// Alt+N - fallback for browser mode
			if (e.altKey && !e.ctrlKey && !e.metaKey && key === 'n') {
				e.preventDefault();
				e.stopPropagation();
				createNewRequest();
				return;
			}
		};

		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () =>
			window.removeEventListener('keydown', handleKeyDown, {
				capture: true,
			});
	}, [createNewRequest]);

	// Keyboard shortcut to open command palette ctrl+k / cmd+k
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggle();
			}
		};
		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, [toggle]);

	// Keyboard shortcut to save request ctrl+s / cmd+s is located to respective components

	return <>{children}</>;
}

export default KeyboardShortcutsProvider;
