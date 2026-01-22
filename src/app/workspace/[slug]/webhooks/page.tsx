'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { formatDistanceToNow } from 'date-fns';
import {
	Zap,
	Plus,
	Webhook as WebhookIcon,
	ArrowRight,
	Clock,
	Hash,
	ExternalLink,
	Copy,
	BarChart3,
	Activity,
	Code2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import useWorkspaceState from '@/modules/workspace/store';
import useWebhookStore from '@/modules/webhooks/store/webhook.store';
import {
	useWebhooks,
	useWebhookEventCount,
} from '@/modules/webhooks/hooks/queries';
import {
	CreateWebhookDialog,
	WebhookEmptyState,
} from '@/modules/webhooks/components';
import type { Webhook } from '@/modules/webhooks/types/webhook.types';

const WebhooksPage = () => {
	const router = useRouter();
	const params = useParams();
	const { activeWorkspace } = useWorkspaceState();
	const { setActiveWebhook } = useWebhookStore();
	const { data: webhooks = [], isLoading } = useWebhooks(
		activeWorkspace?.id || '',
	);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const handleSelectWebhook = (webhook: Webhook) => {
		setActiveWebhook(webhook);
		router.push(`/workspace/${params.slug}/webhooks/${webhook.url}`);
	};

	const handleCopyUrl = async (webhook: Webhook) => {
		const fullUrl = `${window.location.origin}/api/webhook/${webhook.url}`;
		await navigator.clipboard.writeText(fullUrl);
		toast.success('Webhook URL copied to clipboard');
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="flex flex-col items-center gap-3">
					<div className="size-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
					<p className="text-sm text-muted-foreground animate-pulse">
						Loading workspace webhooks...
					</p>
				</div>
			</div>
		);
	}

	// Show empty state if no webhooks
	if (webhooks.length === 0) {
		return (
			<>
				<WebhookEmptyState
					onCreateClick={() => setIsCreateOpen(true)}
				/>
				<CreateWebhookDialog
					open={isCreateOpen}
					onOpenChange={setIsCreateOpen}
					workspaceId={activeWorkspace?.id || ''}
				/>
			</>
		);
	}

	return (
		<div className="h-full overflow-y-auto bg-background/50">
			<div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
				{/* Header Section */}
				<div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-500/5 via-fuchsia-500/5 to-transparent border border-white/5 p-8">
					<div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
						<WebhookIcon className="size-64 -rotate-12 transform" />
					</div>

					<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className="bg-background/50 backdrop-blur-sm border-violet-500/20 text-violet-600"
								>
									Webhook Dashboard
								</Badge>
							</div>
							<h1 className="text-3xl font-bold tracking-tight">
								Overview
							</h1>
							<p className="text-muted-foreground max-w-lg">
								Manage your webhook endpoints, monitor events in
								realtime, and debug integrations with ease.
							</p>
						</div>

						<Button
							onClick={() => setIsCreateOpen(true)}
							size="lg"
							className="group bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:-translate-y-0.5"
						>
							<Plus className="size-4 mr-2 group-hover:rotate-90 transition-transform" />
							New Webhook
						</Button>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
						<StatsCard
							icon={Activity}
							label="Active Webhooks"
							value={webhooks.length.toString()}
							color="violet"
						/>
						<StatsCard
							icon={Zap}
							label="Realtime Status"
							value="Connected"
							color="emerald"
						/>
						<StatsCard
							icon={Clock}
							label="Retention"
							value="7 Days"
							color="blue"
						/>
					</div>
				</div>

				{/* Webhooks Grid */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold flex items-center gap-2">
							<Hash className="size-4 text-muted-foreground" />
							Your Endpoints
						</h2>
						<div className="text-xs text-muted-foreground">
							Showing {webhooks.length} webhooks
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{webhooks.map((webhook) => (
							<WebhookCard
								key={webhook.id}
								webhook={webhook}
								onSelect={() => handleSelectWebhook(webhook)}
								onCopy={() => handleCopyUrl(webhook)}
							/>
						))}

						{/* Add New Card */}
						<button
							onClick={() => setIsCreateOpen(true)}
							className="group flex flex-col items-center justify-center p-6 h-full min-h-[180px] rounded-2xl border border-dashed border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300"
						>
							<div className="flex size-12 items-center justify-center rounded-full bg-muted group-hover:bg-violet-500/10 group-hover:scale-110 transition-all duration-300 mb-4">
								<Plus className="size-6 text-muted-foreground group-hover:text-violet-500" />
							</div>
							<span className="font-medium text-sm group-hover:text-violet-600 transition-colors">
								Create New Webhook
							</span>
						</button>
					</div>
				</div>

				{/* Info Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="bg-muted/20 border-white/5 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<BarChart3 className="size-4 text-muted-foreground" />
								Usage Tips
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-muted-foreground">
							<div className="flex gap-3">
								<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold">
									1
								</div>
								<div>
									<p className="font-medium text-foreground">
										Filtering Events
									</p>
									<p className="text-xs mt-0.5">
										You can filter stored events using query
										parameters on the GET endpoint.
									</p>
								</div>
							</div>
							<div className="flex gap-3">
								<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold">
									2
								</div>
								<div>
									<p className="font-medium text-foreground">
										Secure your endpoints
									</p>
									<p className="text-xs mt-0.5">
										Check headers like{' '}
										<code className="bg-muted px-1 rounded">
											x-signature
										</code>{' '}
										to verify sender identity (if
										applicable).
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-muted/20 border-white/5 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Code2 className="size-4 text-muted-foreground" />
								Quick Integration
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="rounded-lg bg-sidebar border backdrop-blur-2xl border-slate-200 dark:bg-black/40 dark:border-white/5 p-3 font-mono text-xs text-muted-foreground overflow-x-auto">
								<div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
									<span className="text-violet-400">
										cURL Example
									</span>
									<Copy className="size-3 cursor-pointer hover:text-white transition-colors" />
								</div>
								<p>
									<span className="text-amber-500">curl</span>{' '}
									-X POST \<br />
									&nbsp;&nbsp;https://api-studio.com/api/webhook/WHK_...
									\<br />
									&nbsp;&nbsp;-H{' '}
									<span className="text-green-400">
										&quot;Content-Type:
										application/json&quot;
									</span>{' '}
									\<br />
									&nbsp;&nbsp;-d{' '}
									<span className="text-blue-400">
										&apos;{'{'} &quot;event&quot;:
										&quot;test&quot; {'}'}&apos;
									</span>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<CreateWebhookDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				workspaceId={activeWorkspace?.id || ''}
			/>
		</div>
	);
};

// Stats Card
const StatsCard = ({ icon: Icon, label, value, color }: any) => (
	<div className="flex items-center gap-4 p-4 rounded-xl bg-background/40 backdrop-blur-sm border border-white/5 shadow-sm">
		<div
			className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-${color}-500/10`}
		>
			<Icon className={`size-5 text-${color}-500`} />
		</div>
		<div>
			<p className="text-2xl font-bold leading-none">{value}</p>
			<p className="text-xs text-muted-foreground mt-1 font-medium">
				{label}
			</p>
		</div>
	</div>
);

// Webhook Card Component
interface WebhookCardProps {
	webhook: Webhook;
	onSelect: () => void;
	onCopy: () => void;
}

const WebhookCard: React.FC<WebhookCardProps> = ({
	webhook,
	onSelect,
	onCopy,
}) => {
	const { data: eventCount } = useWebhookEventCount(webhook.id);

	return (
		<div
			onClick={onSelect}
			className="group relative flex flex-col justify-between p-5 h-full min-h-[180px] rounded-2xl bg-muted/20 border dark:border-white/5 hover:bg-muted/30 hover:border-violet-500/20 hover:shadow border-slate-200 hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
		>
			<div className="absolute top-10 right-2.5 transition-all duration-300 p-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
				<ArrowRight className="size-5 text-violet-400 transition-all duration-300" />
			</div>

			<div className="space-y-4">
				<div className="flex items-start justify-between">
					<div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/10 group-hover:scale-105 transition-transform duration-300">
						<WebhookIcon className="size-5 text-violet-500" />
					</div>
					<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<Button
							variant="ghost"
							size="icon"
							className="size-8 rounded-lg hover:bg-background/80"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onCopy();
							}}
						>
							<Copy className="size-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8 rounded-lg hover:bg-background/80"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation(); // Stop propagation
								const url = `${window.location.origin}/api/webhook/${webhook.url}`;
								window.open(url, '_blank');
							}}
						>
							<ExternalLink className="size-3.5" />
						</Button>
					</div>
				</div>

				<div>
					<h3 className="font-semibold text-base group-hover:text-violet-400 transition-colors">
						{webhook.name}
					</h3>
					<p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2.5em]">
						{webhook.description || 'No description provided'}
					</p>
				</div>
			</div>

			<div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
				<code className="font-mono dark:bg-black/20! bg-white! border-slate-500! px-2.5 py-1 rounded text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">
					/{webhook.url}
				</code>
				<div className="flex items-center gap-3">
					{eventCount !== undefined && eventCount > 0 && (
						<div className="flex items-center gap-1 text-emerald-400 font-medium">
							<Activity className="size-3" />
							<span>{eventCount}</span>
						</div>
					)}
					<span className="opacity-70">
						{formatDistanceToNow(new Date(webhook.createdAt))} ago
					</span>
				</div>
			</div>
		</div>
	);
};

export default WebhooksPage;
