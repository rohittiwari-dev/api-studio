'use client';

import React, { useState } from 'react';
import { Mail, UserPlus, Loader2, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Role = 'member' | 'admin';

interface InviteMemberModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	email: string;
	onInvite: (role: Role) => void;
	isLoading?: boolean;
}

const roles: {
	value: Role;
	label: string;
	description: string;
	icon: React.ReactNode;
}[] = [
	{
		value: 'member',
		label: 'Member',
		description: 'Can view and edit requests in this workspace',
		icon: <Users className="size-5 text-blue-500" />,
	},
	{
		value: 'admin',
		label: 'Admin',
		description: 'Can manage team members and workspace settings',
		icon: <ShieldCheck className="size-5 text-emerald-500" />,
	},
];

export default function InviteMemberModal({
	open,
	onOpenChange,
	email,
	onInvite,
	isLoading = false,
}: InviteMemberModalProps) {
	const [selectedRole, setSelectedRole] = useState<Role>('member');

	const handleInvite = () => {
		onInvite(selectedRole);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
				{/* Header with gradient accent */}
				<div className="relative px-6 pt-6 pb-4">
					<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
					<DialogHeader className="relative">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
								<UserPlus className="size-5 text-primary" />
							</div>
							<div>
								<DialogTitle className="text-lg">
									Invite Team Member
								</DialogTitle>
								<DialogDescription className="text-xs mt-0.5">
									Send an invitation to collaborate
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>
				</div>

				<div className="px-6 pb-6 space-y-5">
					{/* Email Display */}
					<div className="space-y-2">
						<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Inviting
						</Label>
						<div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
							<div className="p-2 rounded-lg bg-background border border-border/50">
								<Mail className="size-4 text-muted-foreground" />
							</div>
							<span className="text-sm font-medium truncate">
								{email}
							</span>
						</div>
					</div>

					{/* Role Selector */}
					<div className="space-y-2">
						<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Select Role
						</Label>
						<div className="grid gap-2">
							{roles.map((role) => (
								<button
									key={role.value}
									type="button"
									onClick={() => setSelectedRole(role.value)}
									className={cn(
										'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
										'hover:bg-muted/50',
										selectedRole === role.value
											? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
											: 'border-border/50 bg-background',
									)}
								>
									<div
										className={cn(
											'p-2 rounded-lg border transition-colors',
											selectedRole === role.value
												? 'bg-background border-primary/30'
												: 'bg-muted/50 border-border/50',
										)}
									>
										{role.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold">
											{role.label}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
											{role.description}
										</p>
									</div>
									<div
										className={cn(
											'size-4 rounded-full border-2 mt-1 transition-colors',
											selectedRole === role.value
												? 'border-primary bg-primary'
												: 'border-muted-foreground/30',
										)}
									>
										{selectedRole === role.value && (
											<div className="size-full flex items-center justify-center">
												<div className="size-1.5 rounded-full bg-white" />
											</div>
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border/50">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className="text-muted-foreground"
					>
						Cancel
					</Button>
					<Button
						onClick={handleInvite}
						disabled={isLoading}
						className="gap-2 min-w-[120px]"
					>
						{isLoading ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Sending...
							</>
						) : (
							<>
								<Mail className="size-4" />
								Send Invite
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
