'use client';

import React from 'react';
import { Plus, Webhook, Activity, Zap, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebhookEmptyStateProps {
	onCreateClick?: () => void;
}

const WebhookEmptyState: React.FC<WebhookEmptyStateProps> = ({
	onCreateClick,
}) => {
	return (
		<div className="flex h-full flex-col items-center justify-center p-8 animate-in fade-in duration-500">
			<div className="relative max-w-md w-full text-center">
				{/* Decorative background elements */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />

				{/* Icon composition */}
				<div className="relative mx-auto mb-8 size-24">
					<div className="absolute inset-0 bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 rounded-3xl rotate-6 backdrop-blur-sm border border-white/5" />
					<div className="absolute inset-0 bg-background rounded-3xl -rotate-3 border border-border shadow-xl flex items-center justify-center">
						<Webhook className="size-10 text-violet-500" />
					</div>

					{/* Floating badges */}
					<div className="absolute -top-4 -right-4 bg-background border border-border p-2 rounded-xl shadow-lg animate-bounce duration-3000">
						<Zap className="size-4 text-amber-500" />
					</div>
					<div className="absolute -bottom-2 -left-4 bg-background border border-border p-2 rounded-xl shadow-lg animate-bounce duration-4000 delay-500">
						<Activity className="size-4 text-emerald-500" />
					</div>
				</div>

				<h2 className="text-2xl font-bold tracking-tight mb-2 bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
					Webhook Integration
				</h2>
				<p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-xs mx-auto">
					Create powerful integrations by receiving realtime events
					from any service. Debug, inspect, and replay requests
					instantly.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<Button
						size="lg"
						onClick={onCreateClick}
						className="group relative overflow-hidden bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:-translate-y-0.5"
					>
						<span className="relative z-10 flex items-center gap-2">
							<Plus className="size-4" />
							Create First Webhook
						</span>
						<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
					</Button>

					<Button
						variant="outline"
						size="lg"
						className="group border-border/50 hover:bg-muted/50 hover:border-violet-500/30 transition-all duration-300"
						onClick={() =>
							window.open(
								'https://docs.example.com/webhooks',
								'_blank',
							)
						}
					>
						<span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
							<Code2 className="size-4" />
							Documentation
						</span>
					</Button>
				</div>

				{/* Feature grid */}
				<div className="grid grid-cols-2 gap-3 mt-12 text-left">
					<div className="p-3 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 transition-colors">
						<div className="flex items-center gap-2 mb-1">
							<div className="size-1.5 rounded-full bg-emerald-500" />
							<span className="text-xs font-semibold">
								Realtime
							</span>
						</div>
						<p className="text-[10px] text-muted-foreground">
							Instant event delivery via WebSocket
						</p>
					</div>
					<div className="p-3 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 transition-colors">
						<div className="flex items-center gap-2 mb-1">
							<div className="size-1.5 rounded-full bg-blue-500" />
							<span className="text-xs font-semibold">
								Persisted
							</span>
						</div>
						<p className="text-[10px] text-muted-foreground">
							7-day retention for all events
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WebhookEmptyState;
