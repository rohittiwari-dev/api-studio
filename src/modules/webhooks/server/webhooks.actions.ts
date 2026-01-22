'use server';

import { createId } from '@paralleldrive/cuid2';
import db from '@/lib/db';
import { currentUser } from '@/modules/authentication/server/auth.actions';
import type {
	Webhook,
	WebhookEvent,
	CreateWebhookInput,
	UpdateWebhookInput,
} from '../types/webhook.types';

/**
 * Generate a unique webhook URL slug
 */
function generateWebhookUrl(): string {
	return `whk_${createId()}`;
}

/**
 * Get all webhooks for a workspace
 */
export async function getWebhooks(workspaceId: string): Promise<Webhook[]> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const webhooks = await db.webhook.findMany({
		where: {
			workspaceId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return webhooks as Webhook[];
}

/**
 * Get a single webhook by ID
 */
export async function getWebhook(id: string): Promise<Webhook | null> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const webhook = await db.webhook.findUnique({
		where: { id },
	});

	return webhook as Webhook | null;
}

/**
 * Get a webhook by its URL slug
 */
export async function getWebhookByUrl(url: string): Promise<Webhook | null> {
	const webhook = await db.webhook.findUnique({
		where: { url },
	});

	return webhook as Webhook | null;
}

/**
 * Create a new webhook
 */
export async function createWebhook(
	input: Omit<CreateWebhookInput, 'userId'>,
): Promise<Webhook> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const webhook = await db.webhook.create({
		data: {
			name: input.name,
			description: input.description || null,
			url: generateWebhookUrl(),
			workspaceId: input.workspaceId,
			userId: user.user.id,
		},
	});

	return webhook as Webhook;
}

/**
 * Update a webhook
 */
export async function updateWebhook(
	id: string,
	data: UpdateWebhookInput,
): Promise<Webhook> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const webhook = await db.webhook.update({
		where: { id },
		data: {
			name: data.name,
			description: data.description,
			responseConfig: data.responseConfig as any,
		},
	});

	return webhook as Webhook;
}

/**
 * Delete a webhook and all its events
 */
export async function deleteWebhook(id: string): Promise<void> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	await db.webhook.delete({
		where: { id },
	});
}

/**
 * Get webhook events with pagination
 */
export async function getWebhookEvents(
	webhookId: string,
	limit: number = 100,
	offset: number = 0,
): Promise<WebhookEvent[]> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const events = await db.webhookEvent.findMany({
		where: {
			webhookId,
		},
		orderBy: {
			createdAt: 'desc',
		},
		take: limit,
		skip: offset,
	});

	return events.map((event) => ({
		...event,
		headers: event.headers as Record<string, string>,
		searchParams: event.searchParams as Record<string, string> | null,
	})) as WebhookEvent[];
}

/**
 * Get a single webhook event
 */
export async function getWebhookEvent(
	id: string,
): Promise<WebhookEvent | null> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const event = await db.webhookEvent.findUnique({
		where: { id },
	});

	if (!event) {
		return null;
	}

	return {
		...event,
		headers: event.headers as Record<string, string>,
		searchParams: event.searchParams as Record<string, string> | null,
	} as WebhookEvent;
}

/**
 * Delete all events for a webhook
 */
export async function clearWebhookEvents(webhookId: string): Promise<number> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	const result = await db.webhookEvent.deleteMany({
		where: {
			webhookId,
		},
	});

	return result.count;
}

/**
 * Delete old webhook events (older than 7 days)
 * This should be called periodically via a cron job
 */
export async function cleanupOldEvents(): Promise<number> {
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const result = await db.webhookEvent.deleteMany({
		where: {
			createdAt: {
				lt: sevenDaysAgo,
			},
		},
	});

	return result.count;
}

/**
 * Get webhook count for a workspace
 */
export async function getWebhookCount(workspaceId: string): Promise<number> {
	const user = await currentUser();
	if (!user?.user?.id) {
		throw new Error('Unauthorized');
	}

	return await db.webhook.count({
		where: {
			workspaceId,
		},
	});
}

/**
 * Get event count for a webhook
 */
export async function getWebhookEventCount(webhookId: string): Promise<number> {
	return await db.webhookEvent.count({
		where: {
			webhookId,
		},
	});
}
