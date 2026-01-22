'use client';

import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import useWorkspaceState from '@/modules/workspace/store';
import { WebhookSidebar } from '@/modules/webhooks/components';
import WebhookHeader from '@/modules/webhooks/components/WebhookHeader';
import { useWebhookRealtime } from '@/modules/webhooks/hooks/useWebhookRealtime';

const WebhookLayout = ({ children }: { children: React.ReactNode }) => {
	const { activeWorkspace } = useWorkspaceState();

	// Initialize realtime connection
	useWebhookRealtime({
		workspaceId: activeWorkspace?.id || '',
		enabled: !!activeWorkspace?.id,
	});

	return (
		<TooltipProvider>
			<SidebarProvider defaultOpen={true} className="bg-transparent!">
				<div className="relative flex h-screen w-full overflow-hidden bg-background">
					{/* Glassmorphic Background Layer - adds color so glass effect is visible */}
					<div className="absolute inset-y-0 left-0 w-full overflow-hidden pointer-events-none">
						{/* Light theme gradient orbs */}
						<div className="absolute -top-20 -left-20 w-64 h-64 bg-violet-400 rounded-full blur-3xl dark:bg-violet-600" />
						<div className="absolute top-1/3 -right-10 w-48 h-48 bg-fuchsia-400 rounded-full blur-3xl dark:bg-fuchsia-600" />
						<div className="absolute bottom-20 left-10 w-56 h-56 bg-indigo-400 rounded-full blur-3xl dark:bg-indigo-600" />
						<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl dark:bg-purple-600" />
						<div className="absolute -top-10 left-1/2 -right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl dark:bg-purple-600" />
					</div>

					{/* Sidebar */}
					<WebhookSidebar workspaceId={activeWorkspace?.id || ''} />

					{/* Main Content Area */}
					<SidebarInset className="flex flex-col h-screen overflow-hidden bg-transparent! bg-none!">
						{/* Header */}
						<WebhookHeader />

						{/* Content */}
						<main className="flex-1 overflow-auto backdrop-blur-3xl bg-background/60 ">
							{children}
						</main>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</TooltipProvider>
	);
};

export default WebhookLayout;
