'use client';

import React from 'react';
import { Plus, Inbox, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

interface SidebarEmptyStateProps {
	searchQuery: string;
	onOpenCreate: () => void;
}

const SidebarEmptyState: React.FC<SidebarEmptyStateProps> = ({
	searchQuery,
	onOpenCreate,
}) => {
	const { state } = useSidebar();

	if (state === 'collapsed') {
		return null;
	}

	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
			<div className="size-12 rounded-lg bg-muted flex items-center justify-center mb-4">
				{searchQuery ? (
					<Search className="size-5 text-muted-foreground" />
				) : (
					<Inbox className="size-5 text-muted-foreground" />
				)}
			</div>

			<h3 className="text-sm font-medium text-foreground mb-1">
				{searchQuery ? 'No results' : 'No webhooks'}
			</h3>

			<p className="text-xs text-muted-foreground mb-4 max-w-[180px]">
				{searchQuery
					? `No webhooks match "${searchQuery}"`
					: 'Create your first webhook to get started'}
			</p>

			{!searchQuery && (
				<Button
					size="sm"
					onClick={onOpenCreate}
					className="h-8 text-xs"
				>
					<Plus className="size-3.5 mr-1.5" />
					Create Webhook
				</Button>
			)}
		</div>
	);
};

export default SidebarEmptyState;
