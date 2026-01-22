'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Plus,
	Layers,
	MoreHorizontal,
	Trash2,
	ArrowRight,
	Users,
	Calendar,
	Briefcase,
	Loader2,
	Search,
	Crown,
	Settings,
	Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogHeader,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import useWorkspaceState from '@/modules/workspace/store';
import { useRouter } from 'nextjs-toploader/app';
import { useUnsavedChangesGuard } from '@/modules/apis/requests/hooks/useUnsavedChangesGuard';
import UnsavedChangesDialog from '@/modules/apis/requests/components/UnsavedChangesDialog';
import WorkspaceSetup from '@/modules/workspace/components/workspace-setup';
import authClient from '@/lib/authClient';
import { InputField } from '@/components/app-ui/inputs';
import Image from 'next/image';

type WorkspaceWithDetails = {
	id: string;
	name: string;
	slug: string | null;
	logo: string | null;
	createdAt: Date;
	metadata: string | null;
	members?: { id: string; role: string; userId: string }[];
};

export default function AllWorkspacesPage() {
	const router = useRouter();
	const { activeWorkspace, workspaces, setActiveWorkspace, setWorkspaces } =
		useWorkspaceState();

	const [workspaceSetupModalOpen, setWorkspaceSetupModalOpen] =
		useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [workspaceToDelete, setWorkspaceToDelete] =
		useState<WorkspaceWithDetails | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSwitching, setSwitching] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	const unsavedGuard = useUnsavedChangesGuard();

	// Fetch workspaces on mount
	useEffect(() => {
		const fetchWorkspaces = async () => {
			setIsLoading(true);
			try {
				const orgs = await authClient.organization.list();
				if (orgs.data) {
					setWorkspaces(orgs.data as any);
				}
			} catch (error) {
				toast.error('Failed to load workspaces');
			} finally {
				setIsLoading(false);
			}
		};
		fetchWorkspaces();
	}, [setWorkspaces]);

	const performWorkspaceSwitch = async (workspace: WorkspaceWithDetails) => {
		setSwitching(workspace.id);
		try {
			await authClient.organization.setActive({
				organizationId: workspace.id,
			});
			setActiveWorkspace(workspace as any);
			router.push(`/workspace/${workspace.slug}`);
		} catch (error) {
			toast.error('Failed to switch workspace');
		} finally {
			setSwitching(null);
		}
	};

	const handleSwitchWorkspace = (workspace: WorkspaceWithDetails) => {
		if (!workspace || workspace.id === activeWorkspace?.id) {
			return;
		}
		unsavedGuard.confirmWorkspaceSwitch(() => {
			performWorkspaceSwitch(workspace);
		});
	};

	const handleDeleteWorkspace = async () => {
		if (!workspaceToDelete) {
			return;
		}

		setIsDeleting(true);
		try {
			await authClient.organization.delete({
				organizationId: workspaceToDelete.id,
			});
			toast.success(`"${workspaceToDelete.name}" has been deleted`);

			// Remove from local state
			const updated = workspaces?.filter(
				(w) => w.id !== workspaceToDelete.id,
			);
			setWorkspaces(updated || []);

			// If deleted the active workspace, switch to another
			if (
				workspaceToDelete.id === activeWorkspace?.id &&
				updated?.length
			) {
				setActiveWorkspace(updated[0] as any);
				router.push(`/workspace/${updated[0].slug}`);
			}

			setDeleteDialogOpen(false);
			setWorkspaceToDelete(null);
		} catch (error) {
			toast.error('Failed to delete workspace');
		} finally {
			setIsDeleting(false);
		}
	};

	const openDeleteDialog = (workspace: WorkspaceWithDetails) => {
		setWorkspaceToDelete(workspace);
		setDeleteDialogOpen(true);
	};

	const copyWorkspaceId = (id: string) => {
		navigator.clipboard.writeText(id);
		toast.success('Workspace ID copied to clipboard');
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	// Filter workspaces based on search
	const filteredWorkspaces = workspaces?.filter(
		(w) =>
			w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			w.slug?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const otherWorkspaces = filteredWorkspaces?.filter(
		(w) => w.id !== activeWorkspace?.id,
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-8"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">
						All Workspaces
					</h2>
					<p className="text-muted-foreground mt-1">
						Manage and switch between your workspaces
					</p>
				</div>

				<Button
					className="gap-2 shrink-0"
					onClick={() => setWorkspaceSetupModalOpen(true)}
				>
					<Plus className="size-4" />
					New Workspace
				</Button>
			</div>

			<Separator />

			{/* Search */}
			{(workspaces?.length || 0) > 3 && (
				<div className="max-w-sm">
					<InputField
						leftIcon={<Search className="size-4" />}
						placeholder="Search workspaces..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			)}

			{/* Loading State */}
			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="size-8 animate-spin text-primary/60" />
				</div>
			) : (
				<div className="space-y-6">
					{/* Current Workspace */}
					{activeWorkspace && (
						<div className="space-y-3">
							<h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Current Workspace
							</h3>

							<div className="relative p-5 rounded-2xl border-2 border-primary/40 bg-linear-to-br from-primary/5 via-primary/2 to-transparent overflow-hidden group">
								{/* Decorative glow */}
								<div className="absolute -top-12 -right-12 size-32 bg-primary/10 rounded-full blur-3xl" />

								<div className="relative flex items-start gap-4">
									{/* Logo */}
									<div className="size-14 rounded-xl bg-linear-to-br from-primary/30 to-violet-500/20 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
										{activeWorkspace.logo ? (
											<Image
												width={56}
												height={56}
												src={activeWorkspace.logo}
												alt={activeWorkspace.name}
												className="size-full object-cover"
											/>
										) : (
											<span className="text-xl font-bold text-primary">
												{activeWorkspace.name
													.charAt(0)
													.toUpperCase()}
											</span>
										)}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h4 className="text-lg font-semibold truncate">
												{activeWorkspace.name}
											</h4>
											<Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
												<Crown className="size-3 mr-1" />
												Active
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground mt-0.5">
											/{activeWorkspace.slug}
										</p>

										<div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1.5">
												<Users className="size-3.5" />
												{(activeWorkspace as any)._count
													?.members ||
													(activeWorkspace as any)
														.members?.length ||
													1}{' '}
												members
											</span>
											<span className="flex items-center gap-1.5">
												<Calendar className="size-3.5" />
												Created{' '}
												{formatDate(
													activeWorkspace.createdAt,
												)}
											</span>
										</div>
									</div>

									{/* Actions */}
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="size-8 shrink-0"
											>
												<MoreHorizontal className="size-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-48"
										>
											<DropdownMenuItem
												onClick={() =>
													router.push(
														`/workspace/${activeWorkspace.slug}/settings/workspace`,
													)
												}
												className="gap-2"
											>
												<Settings className="size-4" />
												Workspace Settings
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													copyWorkspaceId(
														activeWorkspace.id,
													)
												}
												className="gap-2"
											>
												<Copy className="size-4" />
												Copy Workspace ID
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>
					)}

					{/* Other Workspaces */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Other Workspaces
							</h3>
							<span className="text-xs text-muted-foreground">
								{otherWorkspaces?.length || 0} workspace
								{(otherWorkspaces?.length || 0) !== 1
									? 's'
									: ''}
							</span>
						</div>

						<AnimatePresence mode="popLayout">
							{otherWorkspaces && otherWorkspaces.length > 0 ? (
								<div className="grid gap-3">
									{otherWorkspaces.map((workspace, index) => (
										<motion.div
											key={workspace.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ delay: index * 0.05 }}
											className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 hover:border-border transition-all group"
										>
											<div className="flex items-center gap-4">
												{/* Logo */}
												<div className="size-11 rounded-lg bg-muted/80 border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
													{workspace.logo ? (
														<Image
															width={44}
															height={44}
															src={workspace.logo}
															alt={workspace.name}
															className="size-full object-cover"
														/>
													) : (
														<span className="text-base font-semibold text-muted-foreground">
															{workspace.name
																.charAt(0)
																.toUpperCase()}
														</span>
													)}
												</div>

												{/* Info */}
												<div className="flex-1 min-w-0">
													<h4 className="font-medium truncate">
														{workspace.name}
													</h4>
													<p className="text-xs text-muted-foreground truncate">
														/{workspace.slug}
													</p>
												</div>

												{/* Actions */}
												<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
													<Button
														variant="default"
														size="sm"
														className="gap-1.5 h-8"
														onClick={() =>
															handleSwitchWorkspace(
																workspace as any,
															)
														}
														disabled={
															isSwitching ===
															workspace.id
														}
													>
														{isSwitching ===
														workspace.id ? (
															<Loader2 className="size-3.5 animate-spin" />
														) : (
															<ArrowRight className="size-3.5" />
														)}
														Switch
													</Button>
													<DropdownMenu>
														<DropdownMenuTrigger
															asChild
														>
															<Button
																variant="ghost"
																size="icon"
																className="size-8"
															>
																<MoreHorizontal className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="end"
															className="w-48"
														>
															<DropdownMenuItem
																onClick={() =>
																	copyWorkspaceId(
																		workspace.id,
																	)
																}
																className="gap-2"
															>
																<Copy className="size-4" />
																Copy Workspace
																ID
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="text-red-500 focus:text-red-500 gap-2"
																onClick={() =>
																	openDeleteDialog(
																		workspace as any,
																	)
																}
															>
																<Trash2 className="size-4" />
																Delete Workspace
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							) : (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-center py-12 px-4 rounded-xl border border-dashed border-border/50 bg-muted/10"
								>
									<div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
										<Layers className="size-6 text-muted-foreground/60" />
									</div>
									<p className="text-sm font-medium text-muted-foreground">
										{searchQuery
											? 'No workspaces match your search'
											: 'No other workspaces'}
									</p>
									<p className="text-xs text-muted-foreground/70 mt-1">
										{searchQuery
											? 'Try a different search term'
											: 'Create a new workspace to organize your projects'}
									</p>
									{!searchQuery && (
										<Button
											variant="outline"
											size="sm"
											className="mt-4 gap-2"
											onClick={() =>
												setWorkspaceSetupModalOpen(true)
											}
										>
											<Plus className="size-4" />
											Create Workspace
										</Button>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Workspace</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{' '}
							<span className="font-semibold text-foreground">
								&quot;{workspaceToDelete?.name}&quot;
							</span>
							? This action cannot be undone and all data will be
							permanently lost.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteWorkspace}
							disabled={isDeleting}
							className="gap-2"
						>
							{isDeleting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Trash2 className="size-4" />
							)}
							Delete Workspace
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Unsaved Changes Dialog for workspace switching */}
			{unsavedGuard.dialogProps && (
				<UnsavedChangesDialog {...unsavedGuard.dialogProps} />
			)}

			{/* Create Workspace Modal */}
			<Dialog
				onOpenChange={(open) =>
					setWorkspaceSetupModalOpen(open || false)
				}
				open={workspaceSetupModalOpen}
				modal={true}
			>
				<DialogContent className="max-w-[700px]! min-w-[800px]! p-0 gap-0 overflow-hidden border-0">
					<DialogTitle className="sr-only">
						Create Workspace
					</DialogTitle>
					<div className="grid md:grid-cols-2 min-h-[420px]">
						{/* Left side - Decorative */}
						<div className="hidden md:flex relative bg-linear-to-br from-primary via-primary/90 to-primary/70 p-8 flex-col justify-between overflow-hidden">
							{/* Decorative gradient orbs */}
							<div className="absolute top-1/4 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
							<div className="absolute bottom-1/4 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

							{/* Content */}
							<div className="relative z-10">
								<div className="flex items-center gap-2 text-white/90">
									<div className="flex justify-center items-center bg-white/20 backdrop-blur-sm rounded-lg size-8">
										<Briefcase className="size-4 text-white" />
									</div>
									<span className="font-semibold text-lg">
										New Workspace
									</span>
								</div>
							</div>

							<div className="relative z-10 space-y-4">
								<h2 className="text-2xl font-bold text-white leading-tight">
									Organize your API testing workflow
								</h2>
								<p className="text-white/80 text-sm leading-relaxed">
									Create dedicated workspaces for different
									projects and invite your team to collaborate
									seamlessly.
								</p>
								<div className="flex gap-3 pt-2">
									<div className="flex items-center gap-2 text-white/70 text-xs">
										<div className="size-1.5 rounded-full bg-emerald-400" />
										Unlimited collections
									</div>
									<div className="flex items-center gap-2 text-white/70 text-xs">
										<div className="size-1.5 rounded-full bg-emerald-400" />
										Team collaboration
									</div>
								</div>
							</div>
						</div>

						{/* Right side - Form */}
						<div className="flex items-center justify-center p-8 bg-background">
							<WorkspaceSetup type={'workspace-setup-modal'} />
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}
