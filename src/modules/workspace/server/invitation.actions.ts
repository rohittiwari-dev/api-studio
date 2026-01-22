'use server';
import auth from '@/lib/auth';
import { headers } from 'next/headers';
import db from '@/lib/db';

export const listMembers = async (workspaceId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const members = await db.member.findMany({
			where: {
				organizationId: workspaceId,
			},
			include: {
				user: true,
			},
		});
		return {
			data: members || [],
			error: null,
			msg: 'Members fetched successfully',
		};
	} catch (error) {
		return { data: [], error: error, msg: 'Failed to fetch members' };
	}
};

export const listInvitations = async (workspaceId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const invitations = await auth.api.listInvitations({
			headers: await headers(),
			query: {
				organizationId: workspaceId,
			},
		});

		return {
			data: invitations || [],
			error: null,
			msg: 'Invitations fetched successfully',
		};
	} catch (error) {
		return { data: [], error: error, msg: 'Failed to fetch invitations' };
	}
};

export const listUserInvitations = async (email: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const invitations = await auth.api.listUserInvitations({
			headers: await headers(),
			query: {
				email: email,
			},
		});

		return {
			data: invitations || [],
			error: null,
			msg: 'Invitations fetched successfully',
		};
	} catch (error) {
		return { data: [], error: error, msg: 'Failed to fetch invitations' };
	}
};

export const inviteMember = async ({
	workspaceId,
	email,
	role = 'member',
	resend = false,
}: {
	workspaceId: string;
	email: string;
	role?: 'member' | 'admin' | 'owner';
	resend?: boolean;
}) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const member = await auth.api.createInvitation({
			headers: await headers(),
			body: {
				email,
				role,
				organizationId: workspaceId,
				resend,
			},
		});
		return {
			data: member,
			error: null,
			msg: 'Invitation sent successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to send invitation' };
	}
};

export const acceptInvitation = async (invitationId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const member = await auth.api.acceptInvitation({
			headers: await headers(),
			body: {
				invitationId,
			},
		});

		return {
			data: member,
			error: null,
			msg: 'Invitation accepted successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to accept invitation' };
	}
};

export const getInvitation = async (invitationId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const invitation = await auth.api.getInvitation({
			headers: await headers(),
			query: {
				id: invitationId,
			},
		});

		return {
			data: invitation,
			error: null,
			msg: 'Invitation fetched successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to fetch invitation' };
	}
};

export const rejectInvitation = async (invitationId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const invitation = await auth.api.rejectInvitation({
			headers: await headers(),
			body: {
				invitationId,
			},
		});

		return {
			data: invitation,
			error: null,
			msg: 'Invitation rejected successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to reject invitation' };
	}
};

export const deleteInvitation = async (invitationId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const invitation = await auth.api.cancelInvitation({
			headers: await headers(),
			body: {
				invitationId,
			},
		});

		return {
			data: invitation,
			error: null,
			msg: 'Invitation deleted successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to delete invitation' };
	}
};

export const removeMember = async (
	memberId: string,
	organizationId: string,
) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const member = await auth.api.removeMember({
			headers: await headers(),
			body: {
				memberIdOrEmail: memberId,
				organizationId,
			},
		});

		return {
			data: member,
			error: null,
			msg: 'Member removed successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to remove member' };
	}
};

export const updateMemberRole = async (memberId: string, role: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return null;
		}

		const member = await auth.api.updateMemberRole({
			headers: await headers(),
			body: {
				memberId,
				role,
			},
		});

		return {
			data: member,
			error: null,
			msg: 'Member role updated successfully',
		};
	} catch (error) {
		return {
			data: null,
			error: error,
			msg: 'Failed to update member role',
		};
	}
};

export const getWorkspacePublicInfo = async (workspaceId: string) => {
	try {
		const workspace = await db.organization.findUnique({
			where: { id: workspaceId },
			select: {
				id: true,
				name: true,
				slug: true,
				logo: true,
				createdAt: true,
				_count: {
					select: { members: true },
				},
			},
		});

		return {
			data: workspace,
			error: null,
			msg: 'Workspace public info fetched successfully',
		};
	} catch (error) {
		return {
			data: null,
			error: error,
			msg: 'Failed to fetch workspace public info',
		};
	}
};

export const joinWorkspaceByLink = async (workspaceId: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { error: 'Not authenticated' };
		}

		// Check if user is already a member
		const existingMember = await db.member.findFirst({
			where: {
				organizationId: workspaceId,
				userId: session.user.id,
			},
		});

		if (existingMember) {
			return { error: 'Already a member', alreadyMember: true };
		}

		// Add user as member
		const member = await db.member.create({
			data: {
				organizationId: workspaceId,
				userId: session.user.id,
				role: 'member',
				createdAt: new Date(),
			},
		});

		// Get workspace slug for redirect
		const workspace = await db.organization.findUnique({
			where: { id: workspaceId },
			select: { slug: true },
		});

		return {
			data: { success: true, member, slug: workspace?.slug },
			error: null,
			msg: 'Workspace joined successfully',
		};
	} catch (error) {
		return { data: null, error: error, msg: 'Failed to join workspace' };
	}
};
