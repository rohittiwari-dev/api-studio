'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter as ShadcnSidebarFooter,
	useSidebar,
	SidebarRail,
} from '@/components/ui/sidebar';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import useWebhookStore from '../store/webhook.store';
import { useWebhooks, useDeleteWebhook } from '../hooks/queries';
import CreateWebhookDialog from './CreateWebhookDialog';
import type { Webhook } from '../types/webhook.types';

// Modularized Components
import SidebarHeader from './sidebar/sidebar-header';
import SidebarSearch from './sidebar/sidebar-search';
import WebhookList from './sidebar/webhook-list';
import SidebarEmptyState from './sidebar/sidebar-empty-state';
import ProTips from './sidebar/pro-tips';

interface WebhookSidebarProps {
	workspaceId: string;
}

const WebhookSidebar: React.FC<WebhookSidebarProps> = ({ workspaceId }) => {
	const router = useRouter();
	const params = useParams();
	const [searchQuery, setSearchQuery] = useState('');
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const { state } = useSidebar();

	const { activeWebhook, setActiveWebhook } = useWebhookStore();
	const deleteWebhook = useDeleteWebhook();
	const [webhookToDelete, setWebhookToDelete] = useState<Webhook | null>(
		null,
	);

	// Data Fetching & Sorting
	const { data: webhooks = [], isLoading } = useWebhooks(workspaceId);

	const sortedWebhooks = useMemo(() => {
		return [...webhooks].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime(),
		);
	}, [webhooks]);

	// Filtering
	const filteredWebhooks = useMemo(() => {
		if (!searchQuery.trim()) {
			return sortedWebhooks;
		}
		const query = searchQuery.toLowerCase();
		return sortedWebhooks.filter(
			(w) =>
				w.name.toLowerCase().includes(query) ||
				w.description?.toLowerCase().includes(query) ||
				w.url.toLowerCase().includes(query),
		);
	}, [sortedWebhooks, searchQuery]);

	// Handlers
	const handleSelectWebhook = (webhook: Webhook) => {
		setActiveWebhook(webhook);
		router.push(`/workspace/${params.slug}/webhooks/${webhook.url}`);
	};

	const handleCopyUrl = async (webhook: Webhook) => {
		const fullUrl = `${window.location.origin}/api/webhook/${webhook.url}`;
		await navigator.clipboard.writeText(fullUrl);
		toast.success('Webhook URL copied to clipboard');
	};

	const handleDeleteWebhook = (webhook: Webhook) => {
		setWebhookToDelete(webhook);
	};

	const confirmDeleteWebhook = async () => {
		if (!webhookToDelete) {
			return;
		}

		try {
			await deleteWebhook.mutateAsync({
				id: webhookToDelete.id,
				workspaceId,
			});
			toast.success('Webhook deleted');

			if (activeWebhook?.id === webhookToDelete.id) {
				setActiveWebhook(null);
				router.push(`/workspace/${params.slug}/webhooks`);
			}
			setWebhookToDelete(null);
		} catch {
			toast.error('Failed to delete webhook');
		}
	};

	return (
		<>
			<Sidebar
				collapsible="offcanvas"
				style={{
					background: 'transparent !important',
				}}
				className={cn(
					'border-r! border-border/50! bg-transparent!',
					'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
					'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
				)}
			>
				<SidebarHeader onOpenCreate={() => setIsCreateOpen(true)} />

				<SidebarSearch value={searchQuery} onChange={setSearchQuery} />

				<SidebarContent className="py-2 scroll-smooth">
					{/* List or Empty State */}
					{!isLoading && filteredWebhooks.length === 0 ? (
						<SidebarEmptyState
							searchQuery={searchQuery}
							onOpenCreate={() => setIsCreateOpen(true)}
						/>
					) : (
						<WebhookList
							webhooks={filteredWebhooks}
							isLoading={isLoading}
							activeWebhookId={activeWebhook?.id}
							onSelect={handleSelectWebhook}
							onCopy={handleCopyUrl}
							onDelete={handleDeleteWebhook}
						/>
					)}
				</SidebarContent>

				<ShadcnSidebarFooter
					className={cn(
						'p-0 transparent bg-transparent',
						state === 'collapsed' && 'hidden',
					)}
				>
					<ProTips />
				</ShadcnSidebarFooter>
				<SidebarRail className="hover:after:bg-violet-500/50 after:w-[2px]" />
			</Sidebar>

			<CreateWebhookDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				workspaceId={workspaceId}
			/>

			<AlertDialog
				open={!!webhookToDelete}
				onOpenChange={(open) => !open && setWebhookToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;
							{webhookToDelete?.name}
							&quot;? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteWebhook.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								confirmDeleteWebhook();
							}}
							disabled={deleteWebhook.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteWebhook.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default WebhookSidebar;
