'use client';

import React from 'react';
import {
	Copy,
	Trash2,
	MoreHorizontal,
	Clock,
	Activity,
	Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWebhookEventCount } from '../../hooks/queries';
import type { Webhook } from '../../types/webhook.types';

interface WebhookItemProps {
	webhook: Webhook;
	isActive: boolean;
	isCollapsed: boolean;
	onSelect: () => void;
	onCopy: () => void;
	onDelete: () => void;
}

// Format relative time
const formatRelativeTime = (date: Date | string) => {
	const now = new Date();
	const then = new Date(date);
	const diffMs = now.getTime() - then.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) {
		return 'now';
	}
	if (diffMins < 60) {
		return `${diffMins}m`;
	}
	if (diffHours < 24) {
		return `${diffHours}h`;
	}
	if (diffDays < 7) {
		return `${diffDays}d`;
	}
	return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const WebhookItem: React.FC<WebhookItemProps> = ({
	webhook,
	isActive,
	isCollapsed,
	onSelect,
	onCopy,
	onDelete,
}) => {
	const { data: eventCount } = useWebhookEventCount(webhook.id);
	const [isCopied, setIsCopied] = React.useState(false);

	const handleCopy = () => {
		onCopy();
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<SidebarMenuItem className="group/item">
			<SidebarMenuButton
				isActive={isActive}
				onClick={onSelect}
				tooltip={isCollapsed ? webhook.name : undefined}
				className={cn(
					'h-auto py-2.5 px-3 rounded-xl transition-all duration-200 relative overflow-hidden cursor-pointer!',
					isActive
						? 'bg-linear-to-r from-violet-500/15 via-violet-500/10 to-transparent border border-violet-500/30'
						: 'hover:bg-violet-500/5 border border-transparent hover:border-violet-500/10',
				)}
			>
				{/* Subtle glare on hover */}
				<div className="absolute inset-0 bg-linear-to-br from-violet-200/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />

				{/* Active indicator bar */}
				{isActive && !isCollapsed && (
					<div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-violet-500 rounded-r-full" />
				)}

				{/* Icon */}
				<div
					className={cn(
						'relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
						isActive
							? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
							: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
					)}
				>
					<Activity className="size-3.5" />
				</div>

				{/* Content */}
				{!isCollapsed && (
					<div className="flex-1 min-w-0 flex flex-col gap-0.5 pl-2.5">
						{/* Name row */}
						<div className="flex items-center justify-between gap-2">
							<span
								className={cn(
									'truncate text-[13px]',
									isActive
										? 'font-semibold text-foreground'
										: 'font-medium text-foreground/80 group-hover/item:text-foreground',
								)}
							>
								{webhook.name}
							</span>

							{eventCount !== undefined && eventCount > 0 && (
								<Badge
									variant="secondary"
									className={cn(
										'h-4.5 min-w-4.5 px-1.5 text-[9px] font-semibold shrink-0 rounded',
										isActive
											? 'bg-violet-600 text-white border-0'
											: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
									)}
								>
									{eventCount > 99 ? '99+' : eventCount}
								</Badge>
							)}
						</div>

						{/* Description + Time row */}
						<div className="flex items-center gap-2">
							<span className="text-[10px] text-muted-foreground/60 truncate flex-1">
								{webhook.description ||
									`/${webhook.url.slice(0, 12)}...`}
							</span>

							<div className="flex items-center gap-0.5 text-[9px] text-muted-foreground/40 shrink-0">
								<Clock className="size-2.5" />
								<span>
									{formatRelativeTime(webhook.createdAt)}
								</span>
							</div>
						</div>
					</div>
				)}
			</SidebarMenuButton>

			{/* Hover Actions */}
			{!isCollapsed && (
				<div className="absolute right-1.5 top-3/12 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 z-10">
					<div className="flex items-center bg-background/95 backdrop-blur-sm border border-violet-500/10 rounded-lg p-0.5 shadow-md">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-5 text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 rounded"
									onClick={(e) => {
										e.stopPropagation();
										handleCopy();
									}}
								>
									{isCopied ? (
										<Check className="size-3" />
									) : (
										<Copy className="size-3" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent
								side="top"
								className="text-[10px] p-0.5"
							>
								Copy URL
							</TooltipContent>
						</Tooltip>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-5 text-muted-foreground hover:text-foreground rounded"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreHorizontal className="size-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-20! bg-background/30 backdrop-blur-2xl border border-violet-500/10 rounded-lg"
							>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										handleCopy();
									}}
									className="text-[10px] cursor-pointer "
								>
									<Copy className="size-2.5 mr-1" />
									Copy URL
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive focus:text-destructive text-[10px] cursor-pointer hover:bg-violet-500/20"
									onClick={(e) => {
										e.stopPropagation();
										onDelete();
									}}
								>
									<Trash2 className="size-2.5 mr-1 focus:text-destructive hover:bg-violet-500/20" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			)}
		</SidebarMenuItem>
	);
};

export default WebhookItem;
