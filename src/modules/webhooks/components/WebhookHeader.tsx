'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Zap, HelpCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import ThemeSwitcher from '@/components/app-ui/theme-switcher';
import UserButton from '@/modules/authentication/components/user-button';
import { useAuthStore } from '@/modules/authentication/store';
import useWebhookStore from '../store/webhook.store';

const WebhookHeader: React.FC = () => {
	const params = useParams();
	const { data: authData } = useAuthStore();
	const { isConnected } = useWebhookStore();

	return (
		<header className="sticky top-0 backdrop-blur-3xl bg-background/40 z-50 w-full h-14 shrink-0">
			{/* Glass Background */}
			<div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5 dark:border-white/5" />

			{/* Subtle Gradient Line */}
			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

			<div className="relative flex h-full items-center justify-between  gap-4 px-4">
				{/* Left Section - Back & Brand */}
				<div className="flex items-center gap-3">
					{/* Back to Workspace */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								asChild
							>
								<Link href={`/workspace/${params.slug}`}>
									<ArrowLeft className="size-4" />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							Back to Workspace
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="h-4 w-px bg-border/40" />

					{/* Logo */}
					<Link
						href={`/workspace/${params.slug}`}
						className="group flex items-center gap-2.5 font-medium text-foreground transition-all duration-200"
					>
						<div className="relative flex items-center justify-center size-7 rounded-lg bg-linear-to-br from-violet-500/10 via-indigo-500/10 to-transparent border border-white/10 shadow-sm">
							<Image
								src="/logo.png"
								alt="Api Studio"
								width={100}
								height={100}
								priority
								className="relative w-4 h-4 object-contain opacity-90"
							/>
						</div>
						<span className="hidden sm:inline-block text-sm font-semibold tracking-wide">
							Api Studio
						</span>
					</Link>

					{/* Divider */}
					<div className="h-4 w-px bg-border/40 hidden sm:block" />

					{/* Webhook Mode Indicator */}
					<div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
						<Zap className="size-3.5 dark:text-violet-300 text-violet-600" />
						<span className="text-xs font-medium dark:text-violet-300 text-violet-600">
							Webhooks
						</span>
						<div
							className={cn(
								'size-1.5 rounded-full',
								isConnected
									? 'bg-emerald-500 animate-pulse'
									: 'bg-muted',
							)}
						/>
					</div>
				</div>

				{/* Center - Feature Info */}
				<div className="flex-1 flex justify-center">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="gap-2  bg-amber-500/15 hover:bg-amber-500/20! border border-amber-500/20 hover:border-amber-500/20 dark:hover:text-orange-200/80 text-orange-900/80 dark:text-orange-300/80 cursor-pointer hover:text-orange-700/80 opacity-85"
							>
								<HelpCircle className="size-4" />
								<span className="hidden md:inline">
									How Webhooks Work
								</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-80 p-0 overflow-hidden border-violet-500/20 bg-background/80 backdrop-blur-xl shadow-xl shadow-violet-500/5"
							align="center"
						>
							{/* Header with gradient */}
							<div className="relative px-4 py-3 border-b border-violet-500/10 bg-linear-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent">
								<div className="flex items-center gap-2">
									<div className="flex items-center justify-center size-7 rounded-lg bg-violet-500/20 border border-violet-500/20">
										<Zap className="size-3.5 text-violet-500 dark:text-violet-400" />
									</div>
									<div>
										<h4 className="font-semibold text-sm">
											Webhook Endpoints
										</h4>
										<p className="text-[10px] text-muted-foreground">
											Capture HTTP requests in realtime
										</p>
									</div>
								</div>
							</div>

							{/* Feature Grid */}
							<div className="p-3 space-y-2">
								{/* Feature Cards */}
								<div className="grid grid-cols-2 gap-2">
									<div className="group p-2.5 rounded-lg bg-linear-to-br from-violet-500/5 to-transparent border border-violet-500/10 hover:border-violet-500/20 transition-colors">
										<div className="size-6 rounded-md bg-violet-500/10 flex items-center justify-center mb-1.5">
											<ExternalLink className="size-3 text-violet-500 dark:text-violet-400" />
										</div>
										<p className="text-[11px] font-medium">
											Unique URLs
										</p>
										<p className="text-[10px] text-muted-foreground leading-tight">
											Generate endpoints for any service
										</p>
									</div>

									<div className="group p-2.5 rounded-lg bg-linear-to-br from-fuchsia-500/5 to-transparent border border-fuchsia-500/10 hover:border-fuchsia-500/20 transition-colors">
										<div className="size-6 rounded-md bg-fuchsia-500/10 flex items-center justify-center mb-1.5">
											<span className="text-[10px] font-bold text-fuchsia-500 dark:text-fuchsia-400">
												HTTP
											</span>
										</div>
										<p className="text-[11px] font-medium">
											All Methods
										</p>
										<p className="text-[10px] text-muted-foreground leading-tight">
											GET, POST, PUT, DELETE & more
										</p>
									</div>

									<div className="group p-2.5 rounded-lg bg-linear-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
										<div className="size-6 rounded-md bg-emerald-500/10 flex items-center justify-center mb-1.5">
											<div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
										</div>
										<p className="text-[11px] font-medium">
											Realtime
										</p>
										<p className="text-[10px] text-muted-foreground leading-tight">
											Events appear instantly
										</p>
									</div>

									<div className="group p-2.5 rounded-lg bg-linear-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 hover:border-indigo-500/20 transition-colors">
										<div className="size-6 rounded-md bg-indigo-500/10 flex items-center justify-center mb-1.5">
											<span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
												7d
											</span>
										</div>
										<p className="text-[11px] font-medium">
											History
										</p>
										<p className="text-[10px] text-muted-foreground leading-tight">
											Events stored for 7 days
										</p>
									</div>
								</div>

								{/* Pro Tip */}
								<div className="mt-3 p-2.5 rounded-lg bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/15">
									<div className="flex items-start gap-2">
										<div className="size-5 rounded bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
											<span className="text-[10px]">
												💡
											</span>
										</div>
										<div>
											<p className="text-[10px] text-muted-foreground leading-relaxed">
												<span className="font-medium text-foreground">
													Pro tip:
												</span>{' '}
												Add{' '}
												<code className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-mono">
													?events=true
												</code>{' '}
												to GET requests to retrieve
												stored events.
											</p>
										</div>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>

				{/* Right Section - Actions */}
				<div className="flex items-center gap-2">
					{/* Connection Status */}
					<Tooltip>
						<TooltipTrigger asChild>
							<div
								className={cn(
									'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
									isConnected
										? 'bg-emerald-500/10 text-emerald-400'
										: 'bg-muted text-muted-foreground',
								)}
							>
								<div
									className={cn(
										'size-1.5 rounded-full',
										isConnected
											? 'bg-emerald-500 animate-pulse'
											: 'bg-muted-foreground',
									)}
								/>
								<span className="hidden sm:inline">
									{isConnected ? 'Live' : 'Offline'}
								</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							{isConnected
								? 'Connected - Events update in realtime'
								: 'Disconnected - Reconnecting...'}
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />

					{/* Theme Switcher */}
					<div className="hidden sm:flex items-center">
						<ThemeSwitcher variant="multiple" />
					</div>

					{/* Divider */}
					<div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />

					{/* User Profile */}
					{authData && (
						<div className="flex items-center">
							<UserButton variant="header" />
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default WebhookHeader;
