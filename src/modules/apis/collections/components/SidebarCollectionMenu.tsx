'use client';

import React, { useState } from 'react';
import { createId } from '@paralleldrive/cuid2';
import { Code2, Edit2, Folder, Move, Plus, Trash2 } from 'lucide-react';
import { IconDotsVertical } from '@tabler/icons-react';
import { IconSocketIO, IconWebSocket } from '@/assets/app-icons';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import RenameCollection from './RenameCollection';
import DeleteCollection from './delete-collection';
import AddNewCollection from './AddNewCollection';
import { RequestType } from '@/generated/prisma/browser';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';

interface SidebarCollectionMenuProps {
	type?: 'COLLECTION' | RequestType;
	optionId?: string;
	label?: string;
	variant?: 'item-drop' | 'item-collapsible';
	workspaceId: string;
	collectionId?: string | null;
}

export function SidebarCollectionMenu({
	type,
	optionId,
	label,
	variant = 'item-collapsible',
	workspaceId,
	collectionId,
}: SidebarCollectionMenuProps) {
	const { openRequest } = useRequestSyncStoreState();

	const [showRenameDialog, setShowRenameDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showAddCollectionDialog, setShowAddCollectionDialog] =
		useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					asChild
					onClick={(e) => e.stopPropagation()}
				>
					<div
						role="button"
						onClick={(e) => e.stopPropagation()}
						className={cn(
							'ml-auto cursor-pointer focus-visible:ring-0 p-0 h-fit w-fit rounded-sm outline-none',
							variant === 'item-drop' &&
								'w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-400/20 rounded-md bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all',
						)}
					>
						{variant === 'item-collapsible' ? (
							<IconDotsVertical className="size-4 text-muted-foreground hover:text-indigo-500! dark:hover:text-indigo-400! transition-colors" />
						) : (
							<>
								<Plus className="size-3.5" />
								{label}
							</>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-40 rounded-xl p-1 shadow-2xl shadow-black/10 bg-popover/95 backdrop-blur-xl border border-border/60"
					align="start"
					side="right"
					onClick={(e) => e.stopPropagation()}
					data-no-dnd="true"
				>
					{type === 'COLLECTION' && (
						<>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									const id = createId();
									openRequest({
										id,
										type: 'API',
										name: 'New Request',
										url: '',
										method: 'GET',
										unsaved: true,
										collectionId: collectionId || null,
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
										workspaceId: workspaceId,
										savedMessages: [],
										sortOrder: 0,
									});
								}}
								className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
							>
								<Code2 className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								New HTTP Request
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									const id = createId();
									openRequest({
										id,
										type: 'WEBSOCKET',
										name: 'New WS Request',
										url: '',
										method: null,
										unsaved: true,
										collectionId: collectionId || null,
										workspaceId,
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
								}}
								className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
							>
								<IconWebSocket className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								New Websocket
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									const id = createId();
									openRequest({
										id,
										type: 'SOCKET_IO',
										name: 'New SocketIO',
										url: '',
										method: null,
										unsaved: true,
										collectionId: collectionId || null,
										workspaceId,
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
								}}
								className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
							>
								<IconSocketIO className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								New SocketIO
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setShowAddCollectionDialog(true);
								}}
								className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
							>
								<Folder className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								Add Collection
							</DropdownMenuItem>

							<DropdownMenuSeparator className="bg-border/60 my-1" />

							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setShowRenameDialog(true);
								}}
								className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
							>
								<Edit2 className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setShowDeleteDialog(true);
								}}
								className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 text-muted-foreground focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 active:scale-98"
							>
								<Trash2 className="mr-2 size-3 shrink-0 transition-colors group-focus:text-rose-600 dark:group-focus:text-rose-400" />
								Delete
							</DropdownMenuItem>
						</>
					)}
					{type !== 'COLLECTION' && (
						<>
							<DropdownMenuItem className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground">
								<Edit2 className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground">
								<Move className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
								Move
							</DropdownMenuItem>
							<DropdownMenuSeparator className="bg-border/60 my-1" />
							<DropdownMenuItem className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 text-muted-foreground focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 active:scale-98">
								<Trash2 className="mr-2 size-3 shrink-0 transition-colors group-focus:text-rose-600 dark:group-focus:text-rose-400" />
								Delete
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs rendered outside the DropdownMenu */}
			{type === 'COLLECTION' && optionId && (
				<div onClick={(e) => e.stopPropagation()}>
					<RenameCollection
						id={optionId}
						open={showRenameDialog}
						onOpenChange={setShowRenameDialog}
					/>
					<DeleteCollection
						id={optionId}
						open={showDeleteDialog}
						onOpenChange={setShowDeleteDialog}
					/>
					<AddNewCollection
						parentID={optionId}
						open={showAddCollectionDialog}
						onOpenChange={setShowAddCollectionDialog}
					/>
				</div>
			)}
		</>
	);
}
