import {
	useCancelInvitationMutation,
	useInviteMemberMutation,
	useListInvitationsQuery,
} from '@/modules/workspace/hooks/use-invitaions-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationPermissions } from '@/modules/workspace/hooks/use-invitaions-query';

export default function PendingInvitationsList() {
	const { data: invitations } = useListInvitationsQuery();
	const { data: permissions } = useOrganizationPermissions();
	const canInvite = permissions?.canInvite ?? false;

	if (!canInvite || !invitations || invitations.length === 0) {
		return null;
	}
	const pendingInvitations = invitations?.filter(
		(val) => val.status === 'pending',
	);
	return (pendingInvitations?.length ?? 0) > 0 ? (
		<>
			<div className="space-y-4">
				<h3 className="text-sm font-medium">Pending Invitations</h3>
				<div className="space-y-2">
					{pendingInvitations.map((invitation) => (
						<PendingInvitationItem
							key={invitation.id}
							invitation={invitation}
						/>
					))}
				</div>
			</div>
			<Separator />
		</>
	) : null;
}

function PendingInvitationItem({ invitation }: { invitation: any }) {
	const { mutate: cancelInvitation, isPending: isCancelingInvitation } =
		useCancelInvitationMutation();
	const { mutate: inviteMember, isPending: isInviting } =
		useInviteMemberMutation();

	const handleCancelInvitation = (invitationId: string) => {
		cancelInvitation(invitationId, {
			onSuccess: () => toast.success('Invitation cancelled'),
			onError: () => toast.error('Failed to cancel invitation'),
		});
	};

	const handleResendInvitation = (email: string, role: string) => {
		inviteMember(
			{ email, role: role as any, resend: true },
			{
				onSuccess: () => toast.success('Invitation sent successfully'),
				onError: () => toast.error('Failed to send invitation'),
			},
		);
	};

	return (
		<div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/40 hover:bg-background/60 transition-colors">
			<div className="space-y-2">
				<p className="text-sm font-medium">{invitation.email}</p>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className="text-xs font-normal capitalize"
					>
						{invitation.role}
					</Badge>
					<span className="text-xs text-muted-foreground">
						Expires{' '}
						{new Date(invitation.expiresAt).toLocaleDateString()}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						handleResendInvitation(
							invitation.email,
							invitation.role,
						)
					}
					disabled={isInviting}
					className="gap-2 text-xs! h-8"
				>
					{isInviting ? (
						<Loader2 className="size-2.5 animate-spin" />
					) : (
						<Mail className="size-2.5" />
					)}
					<span className="sr-only sm:not-sr-only sm:inline-block">
						Resend
					</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleCancelInvitation(invitation.id)}
					disabled={isCancelingInvitation}
					className="gap-2 text-xs! h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
				>
					{isCancelingInvitation ? (
						<Loader2 className="size-2.5 animate-spin" />
					) : (
						<Trash2 className="size-2.5" />
					)}
					<span className="sr-only sm:not-sr-only sm:inline-block">
						Revoke
					</span>
				</Button>
			</div>
		</div>
	);
}
