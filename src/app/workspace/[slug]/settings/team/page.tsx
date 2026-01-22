'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	Users,
	Mail,
	UserPlus,
	Crown,
	MoreHorizontal,
	Trash2,
	Loader2,
	ShieldCheck,
	UserCog,
	LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Avatar from '@/modules/authentication/components/avatar';
import { getInitialsFromName } from '@/lib/utils';
import {
	useActiveMember,
	useInviteMemberMutation,
	useLeaveOrganizationMutation,
	useListMembersQuery,
	useOrganizationPermissions,
	useRemoveMemberMutation,
	useUpdateMemberRoleMutation,
} from '@/modules/workspace/hooks/use-invitaions-query';
import { InputField } from '@/components/app-ui/inputs';
import InviteMemberModal from '@/modules/workspace/components/InviteMemberModal';
import PendingInvitationsList from '@/modules/workspace/components/PendingInvitationsList';
import z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'nextjs-toploader/app';

export default function TeamSettingsPage() {
	const router = useRouter();
	const { data, isPending, error } = useListMembersQuery();
	const { data: permissions, isPending: isLoadingPermissions } =
		useOrganizationPermissions();
	const { data: activeMember, isPending: isLoadingActiveMember } =
		useActiveMember();
	const { mutate: inviteMember, isPending: isInviting } =
		useInviteMemberMutation();
	const { mutate: removeMember, isPending: isRemoving } =
		useRemoveMemberMutation();
	const { mutate: updateRole, isPending: isUpdatingRole } =
		useUpdateMemberRoleMutation();
	const { mutate: leaveOrg, isPending: isLeaving } =
		useLeaveOrganizationMutation();
	const [inviteEmail, setInviteEmail] = useState({
		value: '',
		error: '',
	});
	const [inviteModalOpen, setInviteModalOpen] = useState(false);

	const validateAndOpenModal = () => {
		if (!inviteEmail.value) {
			setInviteEmail({ value: '', error: 'Email is required' });
			return;
		}
		const validate = z.email().safeParse(inviteEmail.value);
		if (!validate.success) {
			setInviteEmail({
				value: inviteEmail.value,
				error: 'Invalid email address',
			});
			return;
		}
		setInviteModalOpen(true);
	};

	const handleSendInvite = (role: 'member' | 'admin') => {
		inviteMember(
			{ email: inviteEmail.value, role },
			{
				onSuccess: () => {
					setInviteEmail({ value: '', error: '' });
					setInviteModalOpen(false);
					toast.success('Invitation sent successfully');
				},
				onError: () => {
					toast.error('Failed to send invitation');
				},
			},
		);
	};

	const handleRemoveMember = (memberId: string, memberName?: string) => {
		removeMember(memberId, {
			onSuccess: () => {
				toast.success(`${memberName || 'Member'} has been removed`);
			},
			onError: () => {
				toast.error('Failed to remove member');
			},
		});
	};

	const handleChangeRole = (
		memberId: string,
		role: 'member' | 'admin',
		memberName?: string,
	) => {
		updateRole(
			{ memberId, role },
			{
				onSuccess: () => {
					toast.success(
						`${memberName || 'Member'} role changed to ${
							role === 'admin' ? 'Admin' : 'Member'
						}`,
					);
				},
				onError: () => {
					toast.error('Failed to change role');
				},
			},
		);
	};

	const handleLeaveOrganization = () => {
		leaveOrg(undefined, {
			onSuccess: () => {
				toast.success('You have left the organization');
				router.push('/workspace');
			},
			onError: () => {
				toast.error('Failed to leave organization');
			},
		});
	};

	const getRoleBadge = (role: string) => {
		switch (role) {
			case 'owner':
				return (
					<Badge
						variant="secondary"
						className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20"
					>
						<Crown className="size-3" />
						Owner
					</Badge>
				);
			case 'admin':
				return (
					<Badge
						variant="secondary"
						className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
					>
						<ShieldCheck className="size-3" />
						Admin
					</Badge>
				);
			default:
				return (
					<Badge
						variant="secondary"
						className="bg-muted text-muted-foreground"
					>
						Member
					</Badge>
				);
		}
	};

	const isMutating = isRemoving || isUpdatingRole || isLeaving;
	const isInitialLoading =
		isPending || isLoadingPermissions || isLoadingActiveMember;
	const canInvite = permissions?.canInvite ?? false;
	const canUpdateRole = permissions?.canUpdateRole ?? false;
	const canRemoveMember = permissions?.canRemoveMember ?? false;
	const isCurrentUser = (memberId: string) => activeMember?.id === memberId;

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="space-y-8"
			>
				{/* Header */}
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">
						Team
					</h2>
					<p className="text-muted-foreground mt-1">
						Manage team members and their access to this workspace
					</p>
				</div>

				<Separator />

				{/* Invite Section - Only show if user has permission */}
				{canInvite && (
					<>
						<div className="space-y-4">
							<h3 className="text-sm font-medium">
								Invite Team Members
							</h3>
							<div className="flex gap-3">
								<div className="relative flex-1">
									<InputField
										leftIcon={<Mail className="size-4" />}
										value={inviteEmail.value}
										onChange={(e) =>
											setInviteEmail({
												value: e.target.value,
												error: '',
											})
										}
										error={inviteEmail.error || undefined}
										placeholder="Enter email address"
										type="email"
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												validateAndOpenModal();
											}
										}}
									/>
								</div>
								<Button
									onClick={validateAndOpenModal}
									disabled={isInviting}
									className="gap-2"
								>
									{isInviting ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<UserPlus className="size-4" />
									)}
									Invite
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Team members will receive an email invitation to
								join this workspace.
							</p>
						</div>
						<Separator />
					</>
				)}

				{/* Pending Invitations */}
				<PendingInvitationsList />

				{/* Team Members List */}
				{isInitialLoading ? (
					<div className="flex min-h-[200px] items-center justify-center flex-1">
						<Loader2 className="animate-spin size-7 w-[30px] h-[30px] text-indigo-500/60" />
					</div>
				) : error ? (
					<div className="flex flex-col min-h-[200px] items-center justify-center flex-1 text-center">
						<div className="p-3 rounded-full bg-red-500/10 mb-3">
							<Users className="size-6 text-red-500" />
						</div>
						<p className="text-sm font-medium text-red-500">
							Failed to load team members
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Please try refreshing the page
						</p>
					</div>
				) : !data?.members || data.members.length === 0 ? (
					<div className="flex flex-col min-h-[200px] items-center justify-center flex-1 text-center">
						<div className="p-3 rounded-full bg-muted mb-3">
							<Users className="size-6 text-muted-foreground" />
						</div>
						<p className="text-sm font-medium">
							No team members yet
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Invite team members using the form above
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">
								Team Members
							</h3>
							<span className="text-xs text-muted-foreground">
								{data?.total} member
								{(data?.total || 0) > 1 ? 's' : ''}
							</span>
						</div>

						<div className="space-y-2">
							{data?.members?.map((member) => {
								const isMe = isCurrentUser(member.id);
								const isOwner = member.role === 'owner';
								const showActionsMenu =
									(!isOwner &&
										(canUpdateRole || canRemoveMember)) ||
									(isMe && !isOwner);

								return (
									<div
										key={member.id}
										className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/40 hover:bg-background/60 transition-colors"
									>
										<div className="flex items-center gap-3">
											<Avatar
												className="size-10 rounded-lg"
												fallbackClassName="rounded-lg"
												href={member.user?.image || ''}
												alt={member.user?.name}
												initial={getInitialsFromName(
													member.user?.name,
												)}
											/>
											<div>
												<p className="text-sm font-medium">
													{member.user?.name}
													{isMe && (
														<span className="ml-2 text-xs text-muted-foreground">
															(You)
														</span>
													)}
												</p>
												<p className="text-xs text-muted-foreground">
													{member.user?.email}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-3">
											{getRoleBadge(member.role)}

											{showActionsMenu && (
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
															disabled={
																isMutating
															}
														>
															{isMutating ? (
																<Loader2 className="size-4 animate-spin" />
															) : (
																<MoreHorizontal className="size-4" />
															)}
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="w-48"
													>
														{/* Change Role Submenu - Only show if user has permission and it's not their own card */}
														{canUpdateRole &&
															!isMe &&
															!isOwner && (
																<>
																	<DropdownMenuSub>
																		<DropdownMenuSubTrigger className="gap-2">
																			<UserCog className="size-4" />
																			Change
																			Role
																		</DropdownMenuSubTrigger>
																		<DropdownMenuSubContent>
																			<DropdownMenuItem
																				onClick={() =>
																					handleChangeRole(
																						member.id,
																						'member',
																						member
																							.user
																							?.name,
																					)
																				}
																				disabled={
																					member.role ===
																					'member'
																				}
																				className="gap-2"
																			>
																				<Users className="size-4" />
																				Member
																				{member.role ===
																					'member' && (
																					<span className="ml-auto text-xs text-muted-foreground">
																						Current
																					</span>
																				)}
																			</DropdownMenuItem>
																			<DropdownMenuItem
																				onClick={() =>
																					handleChangeRole(
																						member.id,
																						'admin',
																						member
																							.user
																							?.name,
																					)
																				}
																				disabled={
																					member.role ===
																					'admin'
																				}
																				className="gap-2"
																			>
																				<ShieldCheck className="size-4" />
																				Admin
																				{member.role ===
																					'admin' && (
																					<span className="ml-auto text-xs text-muted-foreground">
																						Current
																					</span>
																				)}
																			</DropdownMenuItem>
																		</DropdownMenuSubContent>
																	</DropdownMenuSub>
																	<DropdownMenuSeparator />
																</>
															)}

														{/* Remove Member - Only show if user has permission and it's not their own card */}
														{canRemoveMember &&
															!isMe &&
															!isOwner && (
																<DropdownMenuItem
																	onClick={() =>
																		handleRemoveMember(
																			member.id,
																			member
																				.user
																				?.name,
																		)
																	}
																	className="text-red-500 focus:text-red-500 gap-2"
																>
																	<Trash2 className="size-4" />
																	Remove
																	Member
																</DropdownMenuItem>
															)}

														{/* Leave Organization - Only show on current user's card if not owner */}
														{isMe && !isOwner && (
															<DropdownMenuItem
																onClick={
																	handleLeaveOrganization
																}
																className="text-red-500 focus:text-red-500 gap-2"
																disabled={
																	isLeaving
																}
															>
																{isLeaving ? (
																	<Loader2 className="size-4 animate-spin" />
																) : (
																	<LogOut className="size-4" />
																)}
																Leave
																Organization
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</motion.div>

			{/* Invite Member Modal */}
			<InviteMemberModal
				open={inviteModalOpen}
				onOpenChange={setInviteModalOpen}
				email={inviteEmail.value}
				onInvite={handleSendInvite}
				isLoading={isInviting}
			/>
		</>
	);
}
