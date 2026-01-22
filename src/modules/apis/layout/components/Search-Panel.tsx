'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { createId } from '@paralleldrive/cuid2';
import {
	CommandIcon,
	SearchIcon,
	Code2,
	FolderPlus,
	Wifi,
	Radio,
} from 'lucide-react';
import { IconWebSocket, IconSocketIO } from '@/assets/app-icons';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from '@/components/ui/command';
import { cn, requestTextColorMap } from '@/lib/utils';
import { substituteVariables } from '@/lib/utils/substituteVariables';
import useEnvironmentStore from '@/modules/apis/environment/store/environment.store';
import useWorkspaceState from '@/modules/workspace/store';
import AddNewCollection from '@/modules/apis/collections/components/AddNewCollection';
import { HttpMethod } from '@/generated/prisma/browser';
import MethodBadge from '@/components/app-ui/method-badge';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';
import { useCollections } from '@/modules/apis/collections/hooks/queries';
import useCommandPaletteStore from '@/modules/apis/layout/store/commandPalette.store';

const SearchPanel = () => {
	const {
		isOpen: open,
		open: setOpenTrue,
		close: setOpenFalse,
	} = useCommandPaletteStore();
	const [query, setQuery] = useState('');
	const [collectionModalOpen, setCollectionModalOpen] = useState(false);

	const { activeWorkspace } = useWorkspaceState();
	const { requests, openRequest } = useRequestSyncStoreState();
	const { getVariablesAsRecord } = useEnvironmentStore();
	const { data: collections = [] } = useCollections(
		activeWorkspace?.id || '',
	);

	// Filter requests based on query - full text search on name, url, description
	const filteredRequests = useMemo(() => {
		if (!activeWorkspace?.id) {
			return [];
		}

		const workspaceRequests = requests.filter(
			(r) => r.workspaceId === activeWorkspace.id,
		);

		if (!query?.trim()) {
			return workspaceRequests;
		}

		const lowerQuery = query.toLowerCase()?.trim();
		return workspaceRequests.filter((r) => {
			const nameMatch = r.name?.toLowerCase().includes(lowerQuery);
			const urlMatch = r.url?.toLowerCase().includes(lowerQuery);
			const descMatch = r.description?.toLowerCase().includes(lowerQuery);
			return nameMatch || urlMatch || descMatch;
		});
	}, [requests, query, activeWorkspace]);

	// Create new request handler
	const handleCreateRequest = useCallback(
		(type: 'API' | 'WEBSOCKET' | 'SOCKET_IO') => {
			if (!activeWorkspace?.id) {
				return;
			}

			const newId = createId();

			const requestData = {
				id: newId,
				name: 'New Request',
				description: '',
				method: type === 'API' ? ('GET' as const) : null,
				url: '',
				type: type,
				headers: [],
				parameters: [],
				body: {
					raw: '',
					formData: [],
					urlEncoded: [],
					file: null,
					json: {},
				},
				bodyType: 'NONE' as const,
				auth: { type: 'NONE' as const },
				messageType: type !== 'API' ? ('CONNECTION' as const) : null,
				createdAt: new Date(),
				updatedAt: new Date(),
				workspaceId: activeWorkspace.id,
				collectionId: null,
				savedMessages: [],
				sortOrder: 0,
				unsaved: true,
			};

			openRequest(requestData);
			setOpenFalse();
			setQuery('');
		},
		[activeWorkspace, openRequest, setOpenFalse],
	);

	// Open new collection modal
	const handleOpenCollectionModal = useCallback(() => {
		setOpenFalse();
		setQuery('');
		setCollectionModalOpen(true);
	}, [setOpenFalse]);

	// Open existing request handler
	const handleOpenRequest = useCallback(
		(request: (typeof requests)[0]) => {
			openRequest(request);
			setOpenFalse();
			setQuery('');
		},
		[openRequest, setOpenFalse],
	);

	// Get method badge color
	const getMethodBadgeColor = (method: HttpMethod | null | undefined) => {
		if (!method) {
			return 'bg-muted text-muted-foreground';
		}
		return requestTextColorMap[method] || 'text-muted-foreground';
	};

	// Get type icon
	const getTypeIcon = (
		type: string,
		method: HttpMethod | null | undefined,
	) => {
		if (type === 'WEBSOCKET') {
			return <IconWebSocket className="size-4 text-violet-500" />;
		}
		if (type === 'SOCKET_IO') {
			return <IconSocketIO className="size-4 text-indigo-500" />;
		}
		// API type - show method
		return (
			<span
				className={cn(
					'text-[10px] font-bold',
					getMethodBadgeColor(method),
				)}
			>
				{method || 'GET'}
			</span>
		);
	};

	// Substitute environment variables in URL for display
	const getDisplayUrl = (url: string | null | undefined) => {
		if (!url) {
			return null;
		}
		try {
			const envVariables = getVariablesAsRecord();
			return substituteVariables(url, envVariables);
		} catch {
			return url;
		}
	};

	// Get collection name by ID
	const getCollectionName = useCallback(
		(collectionId: string | null | undefined) => {
			if (!collectionId || !collections?.length) {
				return null;
			}
			const findCollection = (
				items: typeof collections,
			): string | null => {
				for (const item of items) {
					if (item.id === collectionId) {
						return item.name;
					}
					if (item.children?.length) {
						const found = findCollection(item.children);
						if (found) {
							return found;
						}
					}
				}
				return null;
			};
			return findCollection(collections);
		},
		[collections],
	);

	return (
		<>
			{/* Search Trigger Button */}
			<button
				onClick={setOpenTrue}
				className={cn(
					'group flex items-center gap-3 px-3 py-2 rounded-xl',
					'bg-muted/50 hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50',
					'border border-border/50 hover:border-border',
					'transition-all duration-200 ease-out',
					'w-[280px] md:w-[320px]',
					'cursor-pointer',
				)}
			>
				<SearchIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
				<span className="flex-1 text-left text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
					Search commands...
				</span>
				<div className="flex items-center gap-1">
					<kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border/80 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
						<CommandIcon className="size-3" />
						<span>K</span>
					</kbd>
				</div>
			</button>

			{/* Command Dialog */}
			<CommandDialog
				open={open}
				onOpenChange={(isOpen) => {
					if (isOpen) {
						setOpenTrue();
					} else {
						setOpenFalse();
						setQuery('');
					}
				}}
				className="rounded-xl border-0 shadow-2xl"
			>
				<CommandInput
					placeholder="Search requests or type a command..."
					value={query}
					onValueChange={setQuery}
				/>
				<CommandList className="max-h-[400px]">
					<CommandEmpty>
						<div className="flex flex-col items-center gap-2 py-6">
							<div className="flex items-center justify-center size-12 rounded-full bg-muted">
								<SearchIcon className="size-5 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">
								No results found.
							</p>
							<p className="text-xs text-muted-foreground/70">
								Try a different search term
							</p>
						</div>
					</CommandEmpty>

					{/* Quick Actions - Always visible */}
					<CommandGroup heading="Create New">
						<CommandItem
							className="gap-3 py-2.5 cursor-pointer"
							onSelect={() => handleCreateRequest('API')}
						>
							<div className="flex items-center justify-center size-8 rounded-lg bg-blue-500/10">
								<Code2 className="size-4 text-blue-500" />
							</div>
							<div className="flex flex-col gap-0.5 flex-1">
								<span className="font-medium">
									New HTTP Request
								</span>
								<span className="text-xs text-muted-foreground">
									Create a REST API request
								</span>
							</div>
							<CommandShortcut>Ctrl+N/Cmd+N</CommandShortcut>
						</CommandItem>

						<CommandItem
							className="gap-3 py-2.5 cursor-pointer"
							onSelect={() => handleCreateRequest('WEBSOCKET')}
						>
							<div className="flex items-center justify-center size-8 rounded-lg bg-violet-500/10">
								<Wifi className="size-4 text-violet-500" />
							</div>
							<div className="flex flex-col gap-0.5 flex-1">
								<span className="font-medium">
									New WebSocket
								</span>
								<span className="text-xs text-muted-foreground">
									Create a WebSocket connection
								</span>
							</div>
						</CommandItem>

						<CommandItem
							className="gap-3 py-2.5 cursor-pointer"
							onSelect={() => handleCreateRequest('SOCKET_IO')}
						>
							<div className="flex items-center justify-center size-8 rounded-lg bg-indigo-500/10">
								<Radio className="size-4 text-indigo-500" />
							</div>
							<div className="flex flex-col gap-0.5 flex-1">
								<span className="font-medium">
									New Socket.IO
								</span>
								<span className="text-xs text-muted-foreground">
									Create a Socket.IO connection
								</span>
							</div>
						</CommandItem>

						<CommandItem
							className="gap-3 py-2.5 cursor-pointer"
							onSelect={handleOpenCollectionModal}
						>
							<div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10">
								<FolderPlus className="size-4 text-emerald-500" />
							</div>
							<div className="flex flex-col gap-0.5 flex-1">
								<span className="font-medium">
									New Collection
								</span>
								<span className="text-xs text-muted-foreground">
									Organize your requests
								</span>
							</div>
						</CommandItem>
					</CommandGroup>

					{/* Requests from store */}
					{filteredRequests.length > 0 && (
						<CommandGroup heading="Requests">
							{filteredRequests.map((request) => (
								<CommandItem
									key={request.id}
									value={`request-${request.id}`}
									className="gap-3 py-2.5 cursor-pointer"
									onSelect={() => handleOpenRequest(request)}
								>
									{request.type === 'API' ? (
										<MethodBadge
											method={request.method || 'GET'}
										/>
									) : (
										<div
											className={cn(
												'flex items-center justify-center size-8 rounded-lg',
												request.type === 'WEBSOCKET'
													? 'bg-violet-500/10'
													: request.type ===
														  'SOCKET_IO'
														? 'bg-indigo-500/10'
														: 'bg-muted',
											)}
										>
											{getTypeIcon(
												request.type || 'API',
												request.method,
											)}
										</div>
									)}

									<div className="flex flex-col gap-0.5 flex-1 min-w-0">
										<span className="font-medium truncate">
											{request.name}
										</span>
										{request.url && (
											<span className="text-xs text-muted-foreground truncate">
												{getDisplayUrl(request.url)}
											</span>
										)}
									</div>
									{request.collectionId && (
										<span className="text-xs text-muted-foreground truncate max-w-[100px]">
											{getCollectionName(
												request.collectionId,
											)}
										</span>
									)}
									{request.unsaved && (
										<span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>

				{/* Footer */}
				<div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
					<div className="flex items-center gap-4">
						<span className="flex items-center gap-1">
							<kbd className="rounded border px-1.5 py-0.5 text-[10px]">
								↑↓
							</kbd>
							Navigate
						</span>
						<span className="flex items-center gap-1">
							<kbd className="rounded border px-1.5 py-0.5 text-[10px]">
								↵
							</kbd>
							Select
						</span>
						<span className="flex items-center gap-1">
							<kbd className="rounded border px-1.5 py-0.5 text-[10px]">
								esc
							</kbd>
							Close
						</span>
					</div>
				</div>
			</CommandDialog>

			{/* Add New Collection Modal */}
			<AddNewCollection
				open={collectionModalOpen}
				onOpenChange={setCollectionModalOpen}
			/>
		</>
	);
};

export default SearchPanel;
