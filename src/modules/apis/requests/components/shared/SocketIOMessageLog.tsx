import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
	IconTrash,
	IconCopy,
	IconCheck,
	IconSearch,
	IconFilter,
	IconArrowUp,
	IconArrowDown,
	IconX,
	IconInfoCircle,
	IconDownload,
	IconEye,
	IconMessage,
	IconBroadcast,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type LogMessage } from '../../store/socketio.store';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface SocketIOMessageLogProps {
	messages: LogMessage[];
	onClear: () => void;
	className?: string;
}

type FilterDirection = 'all' | 'sent' | 'received' | 'system' | 'error';

const directionColors: Record<
	string,
	{ bg: string; text: string; border: string }
> = {
	sent: {
		bg: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10',
		text: 'text-emerald-600 dark:text-emerald-400',
		border: 'border-l-emerald-500',
	},
	received: {
		bg: 'bg-gradient-to-r from-blue-500/15 to-indigo-500/10',
		text: 'text-blue-600 dark:text-blue-400',
		border: 'border-l-blue-500',
	},
	system: {
		bg: 'bg-gradient-to-r from-amber-500/15 to-orange-500/10',
		text: 'text-amber-600 dark:text-amber-400',
		border: 'border-l-amber-500',
	},
	error: {
		bg: 'bg-gradient-to-r from-rose-500/15 to-pink-500/10',
		text: 'text-rose-600 dark:text-rose-400',
		border: 'border-l-rose-500',
	},
};

export const SocketIOMessageLog: React.FC<SocketIOMessageLogProps> = ({
	messages,
	onClear,
	className,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [filterDirection, setFilterDirection] =
		useState<FilterDirection>('all');
	const [filterEvent, setFilterEvent] = useState<string>('all');
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [detailsMessage, setDetailsMessage] = useState<LogMessage | null>(
		null,
	);
	const [autoScroll, setAutoScroll] = useState(true);
	const scrollRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Get unique event names from messages
	const eventNames = useMemo(() => {
		const names = new Set<string>();
		messages.forEach((msg) => {
			if (msg.eventName) {
				names.add(msg.eventName);
			}
		});
		return Array.from(names).sort();
	}, [messages]);

	// Filter and search messages
	const filteredMessages = useMemo(() => {
		return messages.filter((msg) => {
			// Filter by direction
			if (
				filterDirection !== 'all' &&
				msg.direction !== filterDirection
			) {
				return false;
			}
			// Filter by event
			if (filterEvent !== 'all' && msg.eventName !== filterEvent) {
				return false;
			}
			// Filter by search query
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				return (
					msg.content.toLowerCase().includes(searchLower) ||
					(msg.eventName &&
						msg.eventName.toLowerCase().includes(searchLower))
				);
			}
			return true;
		});
	}, [messages, filterDirection, filterEvent, searchQuery]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (autoScroll && messagesEndRef.current) {
			requestAnimationFrame(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
			});
		}
	}, [messages, autoScroll]);

	const handleCopy = async (content: string, id: string) => {
		try {
			await navigator.clipboard.writeText(content);
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const handleCopyAll = async () => {
		const allContent = filteredMessages
			.map(
				(msg) =>
					`[${new Date(
						msg.timestamp,
					).toLocaleTimeString()}] ${msg.direction.toUpperCase()}${
						msg.eventName ? ` (${msg.eventName})` : ''
					}: ${msg.content}`,
			)
			.join('\n\n');
		try {
			await navigator.clipboard.writeText(allContent);
			setCopiedId('all');
			setTimeout(() => setCopiedId(null), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const messageCounts = useMemo(
		() => ({
			all: messages.length,
			sent: messages.filter((m) => m.direction === 'sent').length,
			received: messages.filter((m) => m.direction === 'received').length,
			system: messages.filter((m) => m.direction === 'system').length,
			error: messages.filter((m) => m.direction === 'error').length,
		}),
		[messages],
	);

	return (
		<div
			className={cn(
				'flex flex-col h-full min-h-0 overflow-hidden',
				className,
			)}
		>
			{/* Premium Toolbar */}
			<div className="flex items-center gap-2 p-3 border-b border-indigo-500/15 glass-subtle">
				<div className="flex items-center gap-2 flex-1">
					<h3 className="text-xs font-bold text-foreground">
						Messages
					</h3>
					<Badge
						variant="secondary"
						className="text-[10px] px-2 py-0.5 h-5 rounded-full bg-linear-to-r from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold"
					>
						{filteredMessages.length}
					</Badge>
				</div>

				{/* Search */}
				<div className="relative flex-1 max-w-48">
					<IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-indigo-500/50" />
					<Input
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="h-7 pl-8 pr-8 text-[11px] rounded-md border-indigo-500/20 bg-background/80 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-all duration-200"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery('')}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-indigo-500/10"
						>
							<IconX className="size-3" />
						</button>
					)}
				</div>

				{/* Event Filter */}
				{eventNames.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									'h-7 px-2.5 text-[11px] gap-1.5 rounded-lg transition-all',
									'hover:bg-accent border border-border/50 hover:border-border',
									'text-muted-foreground hover:text-foreground',
								)}
							>
								<IconBroadcast className="size-3.5" />
								<span className="font-medium max-w-20 truncate">
									{filterEvent === 'all'
										? 'Events'
										: filterEvent}
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-36 p-1">
							<DropdownMenuItem
								onClick={() => setFilterEvent('all')}
								className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer font-medium flex items-center justify-between gap-2"
							>
								<span>All Events</span>
								{filterEvent === 'all' && (
									<IconCheck className="size-3 text-primary" />
								)}
							</DropdownMenuItem>
							<DropdownMenuSeparator className="my-0.5" />
							{eventNames.map((name) => (
								<DropdownMenuItem
									key={name}
									onClick={() => setFilterEvent(name)}
									className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer flex items-center justify-between gap-2"
								>
									<span className="truncate">{name}</span>
									{filterEvent === name && (
										<IconCheck className="size-3 text-primary" />
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				{/* Direction Filter */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								'h-7 px-2.5 text-[11px] gap-1.5 rounded-lg transition-all',
								'hover:bg-accent border border-border/50 hover:border-border',
								'text-muted-foreground hover:text-foreground',
							)}
						>
							<IconFilter className="size-3.5" />
							<span className="font-medium">
								{filterDirection === 'all' ? (
									'All'
								) : (
									<span className="capitalize">
										{filterDirection}
									</span>
								)}
							</span>
							<span className="flex items-center justify-center px-1 h-4 rounded bg-muted text-[9px] font-semibold text-muted-foreground">
								{messageCounts[filterDirection]}
							</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-32 p-1">
						<DropdownMenuItem
							onClick={() => setFilterDirection('all')}
							className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer font-medium flex items-center justify-between gap-2"
						>
							<span>All</span>
							<div className="flex items-center gap-1.5">
								<span className="text-[9px] text-muted-foreground tabular-nums">
									{messageCounts.all}
								</span>
								{filterDirection === 'all' && (
									<IconCheck className="size-3 text-primary" />
								)}
							</div>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="my-0.5" />
						<DropdownMenuItem
							onClick={() => setFilterDirection('sent')}
							className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer flex items-center justify-between gap-2"
						>
							<span className="flex items-center gap-1.5 font-medium">
								<IconArrowUp className="size-3 text-emerald-500" />
								Sent
							</span>
							<div className="flex items-center gap-1.5">
								<span className="text-[9px] text-muted-foreground tabular-nums">
									{messageCounts.sent}
								</span>
								{filterDirection === 'sent' && (
									<IconCheck className="size-3 text-primary" />
								)}
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setFilterDirection('received')}
							className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer flex items-center justify-between gap-2"
						>
							<span className="flex items-center gap-1.5 font-medium">
								<IconArrowDown className="size-3 text-blue-500" />
								Received
							</span>
							<div className="flex items-center gap-1.5">
								<span className="text-[9px] text-muted-foreground tabular-nums">
									{messageCounts.received}
								</span>
								{filterDirection === 'received' && (
									<IconCheck className="size-3 text-primary" />
								)}
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setFilterDirection('system')}
							className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer flex items-center justify-between gap-2"
						>
							<span className="flex items-center gap-1.5 font-medium">
								<IconInfoCircle className="size-3 text-amber-500" />
								System
							</span>
							<div className="flex items-center gap-1.5">
								<span className="text-[9px] text-muted-foreground tabular-nums">
									{messageCounts.system}
								</span>
								{filterDirection === 'system' && (
									<IconCheck className="size-3 text-primary" />
								)}
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setFilterDirection('error')}
							className="text-[11px] rounded-md py-1.5 px-2 cursor-pointer flex items-center justify-between gap-2"
						>
							<span className="flex items-center gap-1.5 font-medium">
								<IconX className="size-3 text-rose-500" />
								Error
							</span>
							<div className="flex items-center gap-1.5">
								<span className="text-[9px] text-muted-foreground tabular-nums">
									{messageCounts.error}
								</span>
								{filterDirection === 'error' && (
									<IconCheck className="size-3 text-primary" />
								)}
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Download */}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									const data = JSON.stringify(
										filteredMessages,
										null,
										2,
									);
									const blob = new Blob([data], {
										type: 'application/json',
									});
									const url = URL.createObjectURL(blob);
									const a = document.createElement('a');
									a.href = url;
									a.download = `socketio-messages-${new Date()
										.toISOString()
										.slice(0, 10)}.json`;
									a.click();
									URL.revokeObjectURL(url);
								}}
								className="h-7 w-7 p-0 rounded-md hover:bg-accent transition-colors"
								disabled={filteredMessages.length === 0}
							>
								<IconDownload className="size-3.5 text-muted-foreground" />
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							className="text-[10px] rounded-md py-1 px-2"
						>
							Download as JSON
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{/* Copy All */}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCopyAll}
								className="h-7 w-7 p-0 rounded-md hover:bg-accent transition-colors"
								disabled={filteredMessages.length === 0}
							>
								{copiedId === 'all' ? (
									<IconCheck className="size-3.5 text-emerald-500" />
								) : (
									<IconCopy className="size-3.5 text-muted-foreground" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							className="text-[10px] rounded-md py-1 px-2"
						>
							Copy all messages
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{/* Auto-scroll toggle */}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={autoScroll ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setAutoScroll(!autoScroll)}
								className={cn(
									'h-7 w-7 p-0 rounded-md transition-all duration-200',
									autoScroll &&
										'bg-linear-to-r from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/30 hover:to-violet-500/30 border border-indigo-500/30',
								)}
							>
								<IconArrowDown className="size-3.5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							className="text-[10px] rounded-md py-1 px-2"
						>
							Auto-scroll: {autoScroll ? 'On' : 'Off'}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{/* Clear */}
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/15 transition-all duration-200"
					disabled={messages.length === 0}
				>
					<IconTrash className="size-3.5" />
				</Button>
			</div>

			{/* Messages List */}
			<ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
				<div className="p-3 space-y-2">
					{filteredMessages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
							{messages.length === 0 ? (
								<>
									<div className="size-16 rounded-lg bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
										<IconInfoCircle className="size-8 text-indigo-500/40" />
									</div>
									<div className="text-center">
										<span className="text-sm font-bold block text-foreground/80">
											No messages yet
										</span>
										<span className="text-[11px] text-muted-foreground/60 mt-1 block">
											Messages will appear here when sent
											or received
										</span>
									</div>
								</>
							) : (
								<>
									<div className="size-16 rounded-lg bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
										<IconSearch className="size-8 text-indigo-500/40" />
									</div>
									<span className="text-sm font-bold text-foreground/80">
										No messages match your filter
									</span>
								</>
							)}
						</div>
					) : (
						filteredMessages.map((msg) => {
							return (
								<div key={msg.id} className="group mb-1">
									<div
										className={cn(
											'relative rounded-md overflow-hidden border border-border/40 hover:border-border transition-colors bg-card/50',
										)}
									>
										{/* Compact header row */}
										<div className="flex items-center gap-2 px-2.5 py-1 bg-muted/30">
											{/* Direction indicator */}
											<div
												className={cn(
													'flex items-center gap-1 text-[10px] font-semibold',
													msg.direction === 'sent' &&
														'text-emerald-500',
													msg.direction ===
														'received' &&
														'text-blue-500',
													msg.direction ===
														'system' &&
														'text-amber-500',
													msg.direction === 'error' &&
														'text-rose-500',
												)}
											>
												{msg.direction === 'sent' && (
													<IconArrowUp className="size-3" />
												)}
												{msg.direction ===
													'received' && (
													<IconArrowDown className="size-3" />
												)}
												{msg.direction === 'system' && (
													<IconInfoCircle className="size-3" />
												)}
												{msg.direction === 'error' && (
													<IconX className="size-3" />
												)}
												<span className="uppercase">
													{msg.direction}
												</span>
											</div>

											{/* Event Name Badge */}
											{msg.eventName && (
												<Badge
													variant="secondary"
													className="text-[9px] px-1.5 py-0 h-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold"
												>
													{msg.eventName}
												</Badge>
											)}

											<div className="flex items-center gap-2 ml-auto">
												<span className="text-[9px] text-muted-foreground tabular-nums">
													{new Date(
														msg.timestamp,
													).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
														second: '2-digit',
													})}
												</span>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																onClick={(
																	e,
																) => {
																	e.stopPropagation();
																	setDetailsMessage(
																		msg,
																	);
																}}
																className="h-5 w-5 p-0 rounded hover:bg-accent"
															>
																<IconEye className="size-3 text-muted-foreground" />
															</Button>
														</TooltipTrigger>
														<TooltipContent
															side="bottom"
															className="text-[10px]"
														>
															View Details
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														handleCopy(
															msg.content,
															msg.id,
														);
													}}
													className="h-5 w-5 p-0 rounded hover:bg-accent"
												>
													{copiedId === msg.id ? (
														<IconCheck className="size-3 text-emerald-500" />
													) : (
														<IconCopy className="size-3 text-muted-foreground" />
													)}
												</Button>
											</div>
										</div>

										{/* Message content */}
										<div className="px-2.5 py-2">
											<pre className="text-[11px] font-mono whitespace-pre-wrap wrap-break-word text-foreground/90 m-0 leading-relaxed">
												{msg.content}
											</pre>
										</div>
									</div>
								</div>
							);
						})
					)}
					{/* Auto-scroll anchor */}
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			{/* Message Details Dialog */}
			<Dialog
				open={!!detailsMessage}
				onOpenChange={(open) => !open && setDetailsMessage(null)}
			>
				<DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden">
					<DialogHeader className="p-4 border-b border-border/40 bg-muted/40">
						<DialogTitle className="text-sm font-medium flex items-center gap-2">
							<div
								className={cn(
									'flex items-center justify-center size-7 rounded-md',
									detailsMessage?.direction === 'sent' &&
										'bg-emerald-500/10 text-emerald-500',
									detailsMessage?.direction === 'received' &&
										'bg-blue-500/10 text-blue-500',
									detailsMessage?.direction === 'system' &&
										'bg-amber-500/10 text-amber-500',
									detailsMessage?.direction === 'error' &&
										'bg-rose-500/10 text-rose-500',
								)}
							>
								{detailsMessage?.direction === 'sent' && (
									<IconArrowUp className="size-4" />
								)}
								{detailsMessage?.direction === 'received' && (
									<IconArrowDown className="size-4" />
								)}
								{detailsMessage?.direction === 'system' && (
									<IconInfoCircle className="size-4" />
								)}
								{detailsMessage?.direction === 'error' && (
									<IconX className="size-4" />
								)}
							</div>
							Message Details
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground ml-9">
							{detailsMessage &&
								new Date(
									detailsMessage.timestamp,
								).toLocaleString()}
						</DialogDescription>
					</DialogHeader>

					<div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
						{/* Event Info */}
						{detailsMessage?.eventName && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-medium text-foreground">
									<IconBroadcast className="size-3.5" />
									Event
								</div>
								<div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
									<span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
										{detailsMessage.eventName}
									</span>
								</div>
							</div>
						)}

						{/* Message Content */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-medium text-foreground">
								<IconMessage className="size-3.5" />
								Content
							</div>
							<div className="rounded-lg border border-border/50 bg-muted/30 p-3">
								<pre className="text-xs font-mono whitespace-pre-wrap wrap-break-word text-foreground/90 m-0 leading-relaxed max-h-[200px] overflow-y-auto">
									{detailsMessage?.content}
								</pre>
							</div>
						</div>

						{/* Meta Info */}
						<div className="flex items-center gap-4 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
							<div className="flex items-center gap-1">
								<span className="font-medium">Direction:</span>
								<span
									className={cn(
										'font-semibold uppercase',
										detailsMessage?.direction === 'sent' &&
											'text-emerald-500',
										detailsMessage?.direction ===
											'received' && 'text-blue-500',
										detailsMessage?.direction ===
											'system' && 'text-amber-500',
										detailsMessage?.direction === 'error' &&
											'text-rose-500',
									)}
								>
									{detailsMessage?.direction}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="font-medium">ID:</span>
								<span className="font-mono">
									{detailsMessage?.id.slice(0, 8)}...
								</span>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SocketIOMessageLog;
