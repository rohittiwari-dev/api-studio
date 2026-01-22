'use server';

import { createId } from '@paralleldrive/cuid2';
import { createRequest, updateRequest } from './server/request';
import db from '@/lib/db';
import { BodyType, HttpMethod, RequestType } from '@/generated/prisma/browser';

export async function createRequestAction(
	name: string,
	workspaceId: string,
	parentId?: string,
	type: 'API' | 'WEBSOCKET' | 'SOCKET_IO' = 'API',
) {
	const id = createId();
	return await createRequest({
		id,
		name,
		workspaceId,
		collectionId: parentId || null,
		url: '',
		method: type === 'API' ? 'GET' : null,
		headers: [],
		parameters: [],
		body: null,
		auth: null,
		bodyType: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		type: type,
		messageType: type !== 'API' ? 'CONNECTION' : null,
		description: null,
		savedMessages: [],
		sortOrder: 0,
	});
}

export async function deleteRequestAction(requestId: string) {
	return await db.request.delete({
		where: { id: requestId },
	});
}

export async function renameRequestAction(requestId: string, name: string) {
	return await updateRequest(requestId, { name });
}

export async function updateRequestAction(requestId: string, data: any) {
	return await updateRequest(requestId, data);
}

/**
 * Move a request to a different collection (or no collection)
 */
export async function moveRequestToCollectionAction(
	requestId: string,
	collectionId: string | null,
) {
	return await db.request.update({
		where: { id: requestId },
		data: {
			collectionId: collectionId,
			updatedAt: new Date(),
		},
	});
}

/**
 * Duplicate a request - creates a copy with same properties
 */
export async function duplicateRequestAction(requestId: string) {
	const original = await db.request.findUnique({
		where: { id: requestId },
	});

	if (!original) {
		throw new Error('Request not found');
	}

	const newId = createId();
	return await db.request.create({
		data: {
			id: newId,
			name: `${original.name} (Copy)`,
			workspaceId: original.workspaceId,
			collectionId: original.collectionId,
			url: original.url,
			method: original.method,
			headers: original.headers ?? [],
			parameters: original.parameters ?? [],
			body: original.body ?? undefined,
			auth: original.auth ?? undefined,
			bodyType: original.bodyType,
			type: original.type,
			messageType: original.messageType,
			description: original.description,
			savedMessages: original.savedMessages ?? [],
			sortOrder: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
}

/**
 * Upsert a request - creates if doesn't exist, updates if exists
 */
export async function upsertRequestAction(
	requestId: string,
	data: {
		name: string;
		url: string;
		workspaceId: string;
		collectionId?: string | null;
		type: 'API' | 'WEBSOCKET' | 'SOCKET_IO';
		method?: HttpMethod | null;
		headers?: any[];
		parameters?: any[];
		body?: any;
		auth?: any;
		bodyType?: BodyType | null;
		savedMessages?: any[];
	},
) {
	// Check if request exists
	const existing = await db.request.findUnique({
		where: { id: requestId },
	});

	if (existing) {
		// Update existing request
		return await updateRequest(requestId, {
			name: data.name,
			url: data.url,
			type: data.type as RequestType,
			method: data.method,
			headers: data.headers,
			parameters: data.parameters,
			body: data.body,
			auth: data.auth,
			bodyType: data.bodyType,
			savedMessages: data.savedMessages,
		});
	} else {
		// Create new request
		return await createRequest({
			id: requestId,
			name: data.name,
			url: data.url,
			workspaceId: data.workspaceId,
			collectionId: data.collectionId || null,
			type: data.type as RequestType,
			method: data.method || null,
			headers: data.headers || [],
			parameters: data.parameters || [],
			body: data.body || null,
			auth: data.auth || null,
			bodyType: data.bodyType || null,
			messageType: data.type !== 'API' ? 'CONNECTION' : null,
			createdAt: new Date(),
			updatedAt: new Date(),
			description: null,
			savedMessages: data.savedMessages || [],
			sortOrder: 0,
		});
	}
}

/**
 * Search requests by name, url, or description
 */
export async function searchRequestsAction(
	workspaceId: string,
	query: string,
	limit: number = 20,
) {
	if (!query || query?.trim().length === 0) {
		// Return recent requests when no query
		return await db.request.findMany({
			where: { workspaceId },
			orderBy: { updatedAt: 'desc' },
			take: limit,
			select: {
				id: true,
				name: true,
				url: true,
				type: true,
				method: true,
				description: true,
				collectionId: true,
				workspaceId: true,
			},
		});
	}

	return await db.request.findMany({
		where: {
			workspaceId,
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{ url: { contains: query, mode: 'insensitive' } },
				{ description: { contains: query, mode: 'insensitive' } },
			],
		},
		orderBy: { updatedAt: 'desc' },
		take: limit,
		select: {
			id: true,
			name: true,
			url: true,
			type: true,
			method: true,
			description: true,
			collectionId: true,
			workspaceId: true,
		},
	});
}
