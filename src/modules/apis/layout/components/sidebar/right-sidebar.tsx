'use client';

import React from 'react';
import {
	Code,
	Cookie,
	FileText,
	Zap,
	ShieldCheck,
	Webhook,
} from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import useRightPanelStore from '../../store/right-panel.store';
import RightPanel from './right-panel';
import { useRouter } from 'nextjs-toploader/app';
import useWorkspaceState from '@/modules/workspace/store';

const RightSidebar = () => {
	const router = useRouter();
	const { activePanel, togglePanel } = useRightPanelStore();
	const { activeWorkspace } = useWorkspaceState();

	const menuData = [
		{
			id: 'request' as const,
			icon: FileText,
			tooltip: 'Request Info',
			className: {
				triggerClassName:
					'dark:bg-emerald-500/16! border dark:border-emerald-500/16! bg-emerald-500/80! border-emerald-500/80!',
				iconParentClassName:
					'dark:bg-emerald-500/16! border dark:border-emerald-500/16! bg-emerald-500/80! border-emerald-500/80!',
				iconClassName:
					'dark:bg-emerald-500/16! border dark:border-emerald-500/16! bg-emerald-500/80! border-emerald-500/80!',
			},
		},
		{
			id: 'environment' as const,
			icon: Zap,
			tooltip: 'Environment Variables',
			className: {
				triggerClassName:
					'dark:bg-rose-500/16! border dark:border-rose-500/16! bg-rose-500/80! border-rose-500/80!',
				iconParentClassName:
					'dark:bg-rose-500/16! border dark:border-rose-500/16! bg-rose-500/80! border-rose-500/80!',
				iconClassName:
					'dark:bg-rose-500/16! border dark:border-rose-500/16! bg-rose-500/80! border-rose-500/80!',
			},
		},
		{
			id: 'code' as const,
			icon: Code,
			tooltip: 'Code Snippets',
			className: {
				triggerClassName:
					'dark:bg-indigo-500/16! border dark:border-indigo-500/16! bg-indigo-500/80! border-indigo-500/80!',
				iconParentClassName:
					'dark:bg-indigo-500/16! border dark:border-indigo-500/16! bg-indigo-500/80! border-indigo-500/80!',
				iconClassName:
					'dark:bg-indigo-500/16! border dark:border-indigo-500/16! bg-indigo-500/80! border-indigo-500/80!',
			},
		},
		{
			id: 'cookies' as const,
			icon: Cookie,
			tooltip: 'Cookie Manager',
			className: {
				triggerClassName:
					'dark:bg-pink-500/16! border dark:border-pink-500/16! bg-pink-500/80! border-pink-500/80!',
				iconParentClassName:
					'dark:bg-pink-500/16! border dark:border-pink-500/16! bg-pink-500/80! border-pink-500/80!',
				iconClassName:
					'dark:bg-pink-500/16! border dark:border-pink-500/16! bg-pink-500/80! border-pink-500/80!',
			},
		},
		{
			id: 'auth' as const,
			icon: ShieldCheck,
			tooltip: 'Global Auth',
			className: {
				triggerClassName:
					'dark:bg-amber-500/16! border dark:border-amber-500/16! bg-amber-500/80! border-amber-500/80!',
				iconParentClassName:
					'dark:bg-amber-500/16! border dark:border-amber-500/16! bg-amber-500/80! border-amber-500/80!',
				iconClassName:
					'dark:bg-amber-500/16! border dark:border-amber-500/16! bg-amber-500/80! border-amber-500/80!',
			},
		},
		{
			id: 'webhooks' as const,
			icon: Webhook,
			tooltip: 'Webhooks',
			className: {
				triggerClassName:
					'dark:bg-violet-500/16! border dark:border-violet-500/16! bg-violet-500/80! border-violet-500/80!',
				iconParentClassName:
					'dark:bg-violet-500/16! border dark:border-violet-500/16! bg-violet-500/80! border-violet-500/80!',
				iconClassName:
					'dark:bg-violet-500/16! border dark:border-violet-500/16! bg-violet-500/80! border-violet-500/80!',
			},
		},
	];

	return (
		<>
			{/* Modals/Drawers */}
			<RightPanel />

			{/* Icon Buttons Rail - Glassmorphic with emerald accents */}
			<div className="w-12 border-l border-white/5 space-y-1 bg-background/40! backdrop-blur-xl! flex flex-col items-center py-3 gap-2 shadow-sm z-20">
				<TooltipProvider delayDuration={100}>
					{menuData.map((item) => {
						const isActive = activePanel === item.id;
						return (
							<Tooltip key={item.id}>
								<TooltipTrigger
									onClick={() => {
										if (item.id === 'webhooks') {
											router.push(
												`/workspace/${activeWorkspace?.slug}/webhooks`,
											);
										} else {
											togglePanel(item.id);
										}
									}}
									className={cn(
										'relative cursor-pointer rounded-lg ',
										'flex items-center justify-center',
										'transition-all duration-200',
										'backdrop-blur-sm',
										!isActive
											? item.className.triggerClassName
											: 'bg-slate-500/15 border border-slate-500/20',
									)}
								>
									<div
										className={cn(
											'flex items-center justify-center rounded! transition-colors size-6',
											!isActive
												? item.className
														.iconParentClassName
												: 'bg-slate-500/20',
										)}
									>
										<item.icon
											className={cn(
												'size-3.5 transition-colors hover:text-slate-100/60  text-slate-100!',
												!isActive &&
													item.className
														.iconClassName,
											)}
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="left"
									className="font-medium text-xs bg-popover-foreground/95 backdrop-blur-md border-border/50"
								>
									{item.tooltip}
								</TooltipContent>
							</Tooltip>
						);
					})}
				</TooltipProvider>
			</div>
		</>
	);
};

export default RightSidebar;
