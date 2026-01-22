'use client';

import React, { useState, useEffect } from 'react';
import {
	Command,
	Activity,
	Search,
	Zap,
	Copy,
	Webhook as WebhookIcon,
	Sparkles,
	Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/components/ui/sidebar';

const PRO_TIPS = [
	{
		icon: Command,
		text: (
			<>
				Append{' '}
				<code className="bg-violet-500/10 backdrop-blur px-1.5 py-0.5 rounded text-[10px] border border-violet-500/20 text-violet-600 dark:text-violet-400 font-mono">
					?events=true
				</code>{' '}
				to retrieve history.
			</>
		),
	},
	{
		icon: Activity,
		text: 'Webhooks are retained for 7 days. Use specific event IDs to debug complex flows.',
	},
	{
		icon: Search,
		text: 'Search events by Method, JSON body, or Headers using the toolbar filter.',
	},
	{
		icon: Zap,
		text: "Click 'Play' in the event viewer to auto-scroll to incoming realtime events.",
	},
	{
		icon: Copy,
		text: 'Hover over list items to quickly Copy URL or Delete without opening details.',
	},
	{
		icon: WebhookIcon,
		text: 'All HTTP methods (GET, POST, PUT, DELETE, PATCH) are fully supported.',
	},
	{
		icon: Sparkles,
		text: 'Realtime updates use WebSocket connections for instant sub-millisecond delivery.',
	},
];

const ProTips = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [mounted, setMounted] = useState(false);
	const { state } = useSidebar();

	useEffect(() => {
		const timer = setTimeout(() => {
			setMounted(true);
			setCurrentIndex(Math.floor(Math.random() * PRO_TIPS.length));
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	if (!mounted || state === 'collapsed') {
		return null;
	}

	const currentTip = PRO_TIPS[currentIndex];
	const TipIcon = currentTip.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5, duration: 0.5 }}
			className="p-3 bg-linear-to-t from-background via-background/80 to-transparent"
		>
			<div className="relative group/tip rounded-xl bg-linear-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent dark:from-violet-500/10 dark:via-fuchsia-500/5 dark:to-transparent border border-violet-500/20 dark:border-violet-500/10 p-4 overflow-hidden backdrop-blur-xl shadow-md shadow-violet-500/5 transition-all duration-300 hover:border-violet-500/40 dark:hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/10">
				{/* Glass shine - always visible */}
				<div className="absolute inset-0 bg-linear-to-tr from-violet-500/10 via-transparent to-transparent opacity-50 dark:opacity-20 pointer-events-none" />

				{/* Glare effect on hover - subtle with violet tint */}
				<div className="absolute inset-0 bg-linear-to-br from-violet-200/10 via-transparent to-transparent opacity-0 group-hover/tip:opacity-100 transition-opacity duration-500 pointer-events-none" />
				<div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-300/25 to-transparent opacity-0 group-hover/tip:opacity-100 transition-opacity duration-500" />

				{/* Abstract Background Shape */}
				<div className="absolute -top-6 -right-6 size-24 bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-2xl" />

				{/* Floating icon */}
				<div className="absolute top-0 right-0 p-3 opacity-10">
					<TipIcon className="size-12 -rotate-12 transform text-violet-500 blur-[1px]" />
				</div>

				<div className="relative z-10 flex flex-col gap-2.5">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-lg bg-linear-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/30">
							<Lightbulb className="size-3 text-white" />
						</div>
						<span className="text-[10px] font-bold uppercase tracking-wider bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
							Pro Tip
						</span>
					</div>

					<AnimatePresence mode="wait">
						<motion.p
							key={currentIndex}
							initial={{ opacity: 0, x: -5 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 5 }}
							transition={{ duration: 0.3 }}
							className="text-[11px] text-muted-foreground leading-relaxed pr-2 font-medium"
						>
							{currentTip.text}
						</motion.p>
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};

export default ProTips;
