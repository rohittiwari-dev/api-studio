import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import {
	haveIBeenPwned,
	lastLoginMethod,
	openAPI,
	organization,
	twoFactor,
} from 'better-auth/plugins';
import db from '@/lib/db';
import env from '@/lib/env';
import { getActiveOrganization } from '@/modules/workspace/server/workspace.actions';
import redis from './redis';
import { sendEmailWithTemplate } from './mailing';
import {
	InvitationEmail,
	PasswordChangedEmail,
	PasswordResetEmail,
	VerificationEmail,
	WelcomeEmail,
} from './mailing/templates';
import { format } from 'date-fns';

const auth = betterAuth({
	appName: 'Api Studio',
	database: prismaAdapter(db, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmailWithTemplate({
				to: user.email,
				subject: 'Reset Your Password | Api Studio',
				template: PasswordResetEmail({
					appName: 'Api Studio',
					resetUrl: url,
					userName: user.name,
					expiresIn: '10 minutes',
				}),
			});
		},
		onPasswordReset: async (data, request) => {
			await sendEmailWithTemplate({
				to: data.user.email,
				subject: 'Your password has been changed | Api Studio',
				template: PasswordChangedEmail({
					appName: 'Api Studio',
					userName: data.user.name,
					userEmail: data.user.email,
					changedAt: format(
						data.user.updatedAt || new Date(),
						'PPpp',
					),
					deviceInfo:
						request?.headers
							.get('user-agent')
							?.split('(')[1]
							.split(')')[0] || '',
					ipAddress:
						request?.headers.get('cf-connecting-ip') ||
						request?.headers.get('x-forwarded-for') ||
						request?.headers.get('x-real-ip') ||
						'',
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		afterEmailVerification: async (user, request) => {
			await sendEmailWithTemplate({
				to: user.email,
				subject: 'Welcome to Api Studio',
				template: WelcomeEmail({
					appName: 'Api Studio',
					userName: user.name,
					userEmail: user.email,
				}),
			});
		},
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmailWithTemplate({
				to: user.email,
				subject: 'Verify your email address | Api Studio',
				template: VerificationEmail({
					userName: user.name,
					verificationUrl: url,
					expiresIn: '10 minutes',
					appName: 'Api Studio',
				}),
			});
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ['google', 'microsoft', 'email-password'],
			allowDifferentEmails: true,
			updateUserInfoOnLink: true,
		},
	},
	socialProviders: {
		google: {
			disableImplicitSignUp: true,
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			refreshCache: true,
			maxAge: 5 * 60,
		},
		updateAge: 5 * 60,
	},
	plugins: [
		openAPI({
			theme: 'deepSpace',
		}),
		lastLoginMethod(),
		haveIBeenPwned(),
		twoFactor(),
		nextCookies(),
		organization({
			membershipLimit: 10,
			organizationLimit: 5,
			allowInvitationToUnverifiedEmail: true,
			sendInvitationEmail: async (data, request) => {
				await sendEmailWithTemplate({
					to: data.email,
					subject:
						'You have been invited to join an organization | Api Studio',
					template: InvitationEmail({
						inviterEmail: data?.inviter?.user?.email,
						inviterName: data?.inviter?.user?.name,
						inviteUrl: request?.url || '',
						workspaceName: data?.organization?.name,
						appName: 'Api Studio',
						recipientName: data?.email,
					}),
				});
			},
			schema: {
				organization: {
					additionalFields: {
						globalAuth: {
							type: 'json',
							defaultValue: {},
						},
					},
				},
			},
		}),
	],
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					if (session?.activeOrganizationId) {
						return { data: session };
					}
					const organization = await getActiveOrganization(
						session.userId,
					);
					if (!organization) {
						return { data: session };
					}
					return {
						data: {
							...session,
							activeOrganizationId: organization.id,
						},
					};
				},
			},
		},
	},
	secondaryStorage: {
		delete: async (key: string) => {
			await redis.del(key);
		},
		get: async (key: string) => {
			return await redis.get(key);
		},
		set: async (key: string, value: string) => {
			await redis.set(key, value);
		},
	},
	advanced: {
		useSecureCookies: true,
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 100,
		storage: 'database',
		customRules: {
			'/sign-in/*': {
				window: 60,
				max: 5,
			},
			'/sign-up/*': {
				window: 60,
				max: 3,
			},
			'/forget-password': {
				window: 300,
				max: 3,
			},
			'/reset-password': {
				window: 60,
				max: 5,
			},
			'/two-factor/*': {
				window: 60,
				max: 5,
			},
			'/verify-email': {
				window: 300,
				max: 5,
			},
			'/organization/invite': {
				window: 60,
				max: 10,
			},
			'/session': {
				window: 60,
				max: 30,
			},
		},
		customStorage: {
			get: async (key: string) => {
				const countStr = await redis.get(key);
				if (!countStr) {
					return undefined;
				}
				const lastRequestStr = await redis.get(`${key}:lastRequest`);
				return {
					key,
					count: parseInt(countStr, 10) || 0,
					lastRequest: parseInt(lastRequestStr || '0', 10),
				};
			},
			set: async (
				key: string,
				value: { key: string; count: number; lastRequest: number },
			) => {
				await redis.set(key, value.count.toString());
				await redis.set(
					`${key}:lastRequest`,
					value.lastRequest.toString(),
				);
			},
			setEx: async (key: string, value: string, ex: number) => {
				return await redis.setex(key, ex, value);
			},
			delete: async (key: string) => {
				return await redis.del(key);
			},
		},
	},

	telemetry: {
		enabled: false,
		debug: true,
	},
	onAPIError: {
		errorURL: '/sign-in',
	},
});

export default auth;
