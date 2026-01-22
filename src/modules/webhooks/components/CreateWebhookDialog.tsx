'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Webhook as WebhookIcon, Loader2 } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCreateWebhook } from '../hooks/queries';
import useWebhookStore from '../store/webhook.store';

interface CreateWebhookDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	workspaceId: string;
}

const CreateWebhookDialog: React.FC<CreateWebhookDialogProps> = ({
	open,
	onOpenChange,
	workspaceId,
}) => {
	const router = useRouter();
	const params = useParams();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const { setActiveWebhook, addWebhook } = useWebhookStore();
	const createWebhook = useCreateWebhook();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error('Please enter a name for the webhook');
			return;
		}

		try {
			const webhook = await createWebhook.mutateAsync({
				name: name.trim(),
				description: description.trim() || undefined,
				workspaceId,
			});

			// Add to store and set as active
			addWebhook(webhook);
			setActiveWebhook(webhook);

			toast.success('Webhook created successfully');
			onOpenChange(false);

			// Reset form
			setName('');
			setDescription('');

			// Navigate to the new webhook
			router.push(`/workspace/${params.slug}/webhooks/${webhook.url}`);
		} catch {
			toast.error('Failed to create webhook');
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
							<WebhookIcon className="size-5 text-violet-400" />
						</div>
						<div>
							<DialogTitle>Create Webhook</DialogTitle>
							<DialogDescription className="text-xs mt-0.5">
								Create a new webhook endpoint to receive events
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							placeholder="My Webhook"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-muted/30 dark:border-white/10 focus:bg-background transition-colors"
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">
							Description{' '}
							<span className="text-muted-foreground font-normal">
								(optional)
							</span>
						</Label>
						<Textarea
							id="description"
							placeholder="What is this webhook for?"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="bg-muted/30 dark:border-white/10 min-h-[80px] resize-none focus:bg-background transition-colors"
						/>
					</div>

					<div className="rounded-lg bg-muted/30 p-3 border border-white/5">
						<p className="text-xs text-muted-foreground">
							A unique URL will be generated automatically. All
							HTTP methods (GET, POST, etc.) are supported.
						</p>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createWebhook.isPending || !name.trim()}
							className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20"
						>
							{createWebhook.isPending ? (
								<>
									<Loader2 className="size-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								'Create Webhook'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateWebhookDialog;
