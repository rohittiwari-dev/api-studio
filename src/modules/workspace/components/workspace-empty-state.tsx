'use client';

import React, { useMemo } from 'react';
import { Globe, Search, Command, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, requestTextColorMap } from '@/lib/utils';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';
import useCommandPaletteStore from '@/modules/apis/layout/store/commandPalette.store';
import MethodBadge from '@/components/app-ui/method-badge';
import { HttpMethod } from '@/generated/prisma/browser';
import { APP_VERSION } from '@/constants';

const WorkspaceEmptyState = () => {
	const { openRequest, activeWorkspace, requests } =
		useRequestSyncStoreState();

	// Get 5 most recent requests for this workspace
	const recentRequests = useMemo(() => {
		if (!activeWorkspace?.id) {
			return [];
		}

		return requests
			.filter((r) => r.workspaceId === activeWorkspace.id)
			.sort((a, b) => {
				const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
				const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
				return dateB - dateA;
			})
			.slice(0, 6);
	}, [requests, activeWorkspace]);

	const getTimeGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) {
			return 'Good morning';
		}
		if (hour < 18) {
			return 'Good afternoon';
		}
		return 'Good evening';
	};

	const getMethodColor = (method: HttpMethod | null | undefined) => {
		if (!method) {
			return 'bg-muted';
		}
		return requestTextColorMap[method]
			? `bg-${method.toLowerCase()}-500/10`
			: 'bg-muted';
	};

	return (
		<div className="flex-1 w-full flex flex-col items-center justify-start pt-18 relative overflow-hidden overflow-y-auto pb-10 bg-muted/5">
			{/* Background Effects */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
				<div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="z-10 w-full max-w-2xl px-8 flex flex-col gap-10"
			>
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
						{getTimeGreeting()}
					</h1>
					<p className="text-muted-foreground text-sm">
						Ready to build something amazing?
					</p>
				</div>

				{/* Main Search/Action Bar - Opens Command Palette */}
				<button
					onClick={() => useCommandPaletteStore.getState().open()}
					className="relative group w-full max-w-lg mx-auto cursor-pointer"
				>
					<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					<div className="relative flex items-center bg-background/50 backdrop-blur-xl border border-border/40 rounded-full shadow-lg p-1.5 pr-3 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-primary/5">
						<div className="pl-4 pr-3 text-muted-foreground">
							<Search className="size-5" />
						</div>
						<span className="flex-1 text-left text-sm text-muted-foreground/60 h-9 flex items-center">
							Search requests, collections, or docs...
						</span>
						<kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<Command className="size-3" />K
						</kbd>
					</div>
				</button>

				{/* Recent Requests Grid */}
				{recentRequests.length > 0 && (
					<div className="space-y-4">
						<h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
							Recent Requests
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{recentRequests.map((request, i) => (
								<motion.button
									key={request.id}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: i * 0.05 }}
									onClick={() => openRequest(request)}
									className={cn(
										'group flex flex-col items-start p-4 rounded-xl',
										'border border-border/40 bg-background/40 backdrop-blur-sm',
										'hover:bg-background/60 hover:border-border/60 transition-all duration-300',
										'text-left outline-none focus-visible:ring-2 ring-primary/20',
									)}
								>
									{/* Top Row: Method Badge + Unsaved Indicator */}
									<div className="flex items-center justify-between w-full mb-3">
										{request.type === 'API' ? (
											<MethodBadge
												method={request.method ?? 'GET'}
											/>
										) : (
											<span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary uppercase tracking-wide">
												{request.type}
											</span>
										)}
										{request.unsaved && (
											<span className="size-2 rounded-full bg-amber-500" />
										)}
									</div>

									{/* Request Name */}
									<h3 className="font-semibold text-sm truncate w-full mb-1">
										{request.name}
									</h3>

									{/* URL Preview */}
									<p className="text-xs text-muted-foreground truncate w-full">
										{request.url || 'No URL'}
									</p>

									{/* Arrow on Hover */}
									<div className="mt-3 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
										<ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground" />
									</div>
								</motion.button>
							))}
						</div>
					</div>
				)}

				{/* Empty state when no requests */}
				{recentRequests.length === 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.1 }}
						className="text-center py-12 px-6 rounded-2xl border border-border/30 bg-background/30 backdrop-blur-sm"
					>
						<div className="flex items-center justify-center size-14 mx-auto rounded-2xl bg-primary/10 mb-4">
							<FileText className="size-6 text-primary" />
						</div>
						<h3 className="text-base font-semibold mb-1">
							No requests yet
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Create your first API request to get started.
						</p>
						<button
							onClick={() =>
								useCommandPaletteStore.getState().open()
							}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
						>
							<span>New Request</span>
							<kbd className="px-1.5 py-0.5 rounded border border-primary-foreground/20 bg-primary-foreground/10 text-[10px] font-mono">
								⌘K
							</kbd>
						</button>
					</motion.div>
				)}
			</motion.div>

			{/* Footer Info */}
			<div className="mt-16! flex items-center gap-6 text-xs text-muted-foreground/40">
				<div className="flex items-center gap-1.5">
					<Globe className="size-3" />
					<span>Connected</span>
				</div>
				<div className="w-1 h-1 rounded-full bg-border" />

				<div>v{APP_VERSION}</div>
			</div>
		</div>
	);
};

export default WorkspaceEmptyState;
