'use client';

import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	useAcceptInvitationMutation,
	useRejectInvitationMutation,
} from '@/modules/workspace/hooks/use-invitaions-query';
import { toast } from 'sonner';
import Avatar from '@/modules/authentication/components/avatar';
import { getInitialsFromName } from '@/lib/utils';

interface UserInvitationItemProps {
	invitation: any;
	variant?: 'default' | 'sheet';
}

export default function UserInvitationItem({
	invitation,
	variant = 'default',
}: UserInvitationItemProps) {
	const { mutate: acceptInvitation, isPending: isAccepting } =
		useAcceptInvitationMutation();
	const { mutate: rejectInvitation, isPending: isRejecting } =
		useRejectInvitationMutation();

	const handleAccept = () => {
		acceptInvitation(invitation.id, {
			onSuccess: () => {
				toast.success('Invitation accepted successfully');
			},
			onError: () => {
				toast.error('Failed to accept invitation');
			},
		});
	};

	const handleReject = () => {
		rejectInvitation(invitation.id, {
			onSuccess: () => {
				toast.success('Invitation declined');
			},
			onError: () => {
				toast.error('Failed to decline invitation');
			},
		});
	};

	return (
		<div
			className={`flex ${
				variant === 'sheet'
					? 'flex-col gap-3'
					: 'items-center justify-between'
			} p-3 rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-neutral-900/10 backdrop-blur-md hover:bg-white/80 dark:hover:bg-neutral-900/40 transition-all duration-300 group shadow-sm hover:shadow-md`}
		>
			<div className="flex items-center gap-3">
				<Avatar
					className="size-10 rounded-lg ring-1 ring-border/50"
					fallbackClassName="rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
					href={'https://avatar.iran.liara.run/public'}
					initial={getInitialsFromName(invitation.organizationName)}
					alt={invitation.organizationName}
				/>
				<div className="space-y-1">
					<div className="flex items-center gap-6 ">
						<p className="text-sm font-semibold leading-none text-foreground">
							{invitation.organizationName || 'Unknown Workspace'}
						</p>
						<div className="flex items-center -ml-2 gap-2">
							<Badge
								variant="outline"
								className="text-[10px] h-5 font-medium capitalize border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-900/20 dark:text-indigo-300"
							>
								Start as {invitation.role}
							</Badge>
						</div>
					</div>
					<p className="text-[11px] text-muted-foreground/80 pl-0.5">
						Invited by{' '}
						<span className="font-medium text-foreground/80">
							{invitation.inviterEmail}
						</span>
					</p>
				</div>
			</div>

			<div
				className={`flex items-center gap-2 ${
					variant === 'sheet' ? 'w-full' : ''
				}`}
			>
				<Button
					size="sm"
					onClick={handleAccept}
					disabled={isAccepting || isRejecting}
					className={`h-8 gap-2 bg-emerald-500/15 cursor-pointer text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 shadow-none ${
						variant === 'sheet' ? 'flex-1' : ''
					}`}
					variant="outline"
				>
					{isAccepting ? (
						<Loader2 className="size-3.5 animate-spin" />
					) : (
						<Check className="size-3.5" />
					)}
					Accept
				</Button>
				<Button
					size="sm"
					onClick={handleReject}
					disabled={isAccepting || isRejecting}
					className={`h-8 gap-2 text-muted-foreground cursor-pointer hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 ${
						variant === 'sheet' ? 'flex-1' : ''
					}`}
					variant="ghost"
				>
					{isRejecting ? (
						<Loader2 className="size-3.5 animate-spin" />
					) : (
						<X className="size-3.5" />
					)}
					Decline
				</Button>
			</div>
		</div>
	);
}
