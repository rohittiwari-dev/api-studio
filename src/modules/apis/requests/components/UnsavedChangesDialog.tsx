'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { RequestStateInterface } from '../types/request.types';
import MethodBadge from '@/components/app-ui/method-badge';

export type UnsavedChangesAction =
	| 'close'
	| 'close-all'
	| 'close-others'
	| 'switch-workspace';

export interface UnsavedChangesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	unsavedRequests: RequestStateInterface[];
	onSave: () => Promise<void>;
	onDiscard: () => Promise<void>;
	onCancel: () => void;
	isSaving?: boolean;
	isDiscarding?: boolean;
	actionType: UnsavedChangesAction;
}

const actionMessages: Record<
	UnsavedChangesAction,
	{ title: string; description: string }
> = {
	close: {
		title: 'Unsaved Changes',
		description: 'Do you want to save changes before closing?',
	},
	'close-all': {
		title: 'Unsaved Changes',
		description:
			'You have unsaved changes in the following requests. Do you want to save them before closing all tabs?',
	},
	'close-others': {
		title: 'Unsaved Changes',
		description:
			'You have unsaved changes in the following requests. Do you want to save them before closing?',
	},
	'switch-workspace': {
		title: 'Unsaved Changes',
		description:
			'You have unsaved changes in the current workspace. Do you want to save them before switching?',
	},
};

export function UnsavedChangesDialog({
	open,
	onOpenChange,
	unsavedRequests,
	onSave,
	onDiscard,
	onCancel,
	isSaving = false,
	isDiscarding = false,
	actionType,
}: UnsavedChangesDialogProps) {
	const isLoading = isSaving || isDiscarding;
	const isSingleRequest = unsavedRequests.length === 1;
	const messages = actionMessages[actionType];

	const handleSave = async () => {
		await onSave();
	};

	const handleDiscard = async () => {
		await onDiscard();
	};

	const handleCancel = (isOpen: boolean) => {
		onCancel();
		onOpenChange(isOpen);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => !isLoading && handleCancel(isOpen)}
		>
			<DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
				{/* Header with gradient accent */}
				<div className="relative">
					{/* Top gradient bar */}
					<div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-indigo-500 via-blue-500 to-violet-500" />

					<DialogHeader className="px-6 pt-6 pb-4">
						<div className="flex items-start gap-4">
							{/* Animated warning icon */}
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{
									type: 'spring',
									stiffness: 300,
									damping: 20,
								}}
								className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30"
							>
								<AlertTriangle className="size-6 text-indigo-500" />
							</motion.div>
							<div className="flex-1 space-y-1">
								<DialogTitle className="text-lg font-semibold">
									{messages.title}
								</DialogTitle>
								<DialogDescription className="text-sm text-muted-foreground/80">
									{isSingleRequest
										? `Save changes to "${unsavedRequests[0]?.name}" before closing?`
										: messages.description}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>
				</div>

				{/* Request List for multiple unsaved requests */}
				<AnimatePresence>
					{!isSingleRequest && unsavedRequests.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="px-6 pb-4"
						>
							<div className="flex items-center justify-between mb-2">
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{unsavedRequests.length} unsaved request
									{unsavedRequests.length > 1 ? 's' : ''}
								</p>
							</div>
							<ScrollArea className="max-h-[150px] overflow-y-auto overflow-x-hidden rounded-xl border border-white/10 bg-muted/20 backdrop-blur-sm">
								<div className="p-2 space-y-1">
									{unsavedRequests.map((request, index) => (
										<motion.div
											key={request.id}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
										>
											{/* Method badge or type indicator */}
											{request.type === 'API' ? (
												<MethodBadge
													method={
														request.method ??
														undefined
													}
												/>
											) : (
												<span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary uppercase">
													{request.type}
												</span>
											)}

											<span className="text-sm truncate flex-1 font-medium">
												{request.name}
											</span>

											{/* Unsaved indicator with pulse animation */}
											<div className="relative">
												<div className="size-2 rounded-full bg-amber-500" />
												<div className="absolute inset-0 size-2 rounded-full bg-amber-500 animate-ping opacity-75" />
											</div>
										</motion.div>
									))}
								</div>
							</ScrollArea>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Footer with actions */}
				<div className="flex items-center justify-between gap-3 px-2 py-2 border-t border-white/5 bg-muted/10">
					{/* Cancel button */}
					<Button
						type="button"
						variant="ghost"
						onClick={() => handleCancel(false)}
						disabled={isLoading}
						size="sm"
						className="text-muted-foreground hover:text-foreground"
					>
						<X className="size-4 mr-1.5" />
						Cancel
					</Button>

					{/* Action buttons */}
					<div className="flex items-center gap-2">
						{/* Discard button */}
						<Button
							type="button"
							variant="outline"
							onClick={handleDiscard}
							disabled={isLoading}
							size="sm"
							className={cn(
								'border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50',
								isDiscarding && 'opacity-70',
							)}
						>
							{isDiscarding ? (
								<span className="flex items-center gap-2">
									<span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Discarding...
								</span>
							) : (
								<span className="flex items-center gap-1.5">
									<Trash2 className="size-4" />
									Don&apos;t Save
								</span>
							)}
						</Button>

						{/* Save button - Primary action */}
						<Button
							type="button"
							onClick={handleSave}
							disabled={isLoading}
							size="sm"
							className={cn(
								'bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25',
								isSaving && 'opacity-70',
							)}
						>
							{isSaving ? (
								<span className="flex items-center gap-2">
									<span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Saving...
								</span>
							) : (
								<span className="flex items-center gap-1.5">
									<Save className="size-4" />
									{isSingleRequest ? 'Save' : 'Save All'}
								</span>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default UnsavedChangesDialog;
