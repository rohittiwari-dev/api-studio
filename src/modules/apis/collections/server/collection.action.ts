'use server';

import db from '@/lib/db';
import {
	CollectionWithRelations,
	NestedCollection,
} from '../types/sidebar.types';
import { buildNestedCollections } from '../utils';

export async function getAllCollections(workspaceId: string): Promise<{
	success: boolean;
	data?: NestedCollection[];
	error?: string;
}> {
	try {
		// Verify user has access to the workspace
		const workspaceAccess = await db.member.findFirst({
			where: {
				organizationId: workspaceId,
			},
		});

		if (!workspaceAccess) {
			return { success: false, error: 'No access to workspace' };
		}

		// Get all collections for the workspace
		const collections = await db.collection.findMany({
			where: {
				workspaceId,
			},
			include: {
				requests: {
					orderBy: { sortOrder: 'asc' },
				},
				children: {
					include: {
						requests: {
							orderBy: { sortOrder: 'asc' },
						},
						children: {
							include: {
								requests: {
									orderBy: { sortOrder: 'asc' },
								},
								children: true,
							},
						},
					},
				},
			},
			orderBy: { sortOrder: 'asc' },
		});

		// Build nested structure
		const nestedCollections = buildNestedCollections(
			collections as unknown as CollectionWithRelations[],
		);

		return {
			success: true,
			data: nestedCollections,
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to fetch collections',
		};
	}
}

export async function getAllCollectionsFlat(workspaceId: string) {
	try {
		const collections = await db.collection.findMany({
			where: {
				workspaceId,
			},
			orderBy: { sortOrder: 'asc' },
		});
		return collections;
	} catch (error) {
		return [];
	}
}

export const createCollectionAction = async ({
	name,
	workspaceId,
	parentID,
	id,
}: {
	name: string;
	workspaceId: string;
	parentID?: string;
	id?: string;
}) => {
	return await db.collection.create({
		data: {
			id,
			name,
			workspaceId,
			...(parentID && { parentId: parentID }),
			createdAt: new Date(),
		},
		include: {
			workspace: true,
		},
	});
};

export const renameCollectionAction = async (id: string, newName: string) => {
	return await db.collection.update({
		where: { id },
		data: { name: newName },
	});
};

export const deleteCollectionAction = async (id: string) => {
	return await db.collection.delete({
		where: { id },
	});
};

export const getAllCollectionsOnLevelOne = async (
	workspaceId: string,
): Promise<CollectionWithRelations[]> => {
	const collections = (await db.collection.findMany({
		where: {
			workspaceId,
		},
		orderBy: { sortOrder: 'asc' },
		include: {
			children: true,
			parent: true,
		},
	})) as unknown as CollectionWithRelations[];

	// Flatten all collections to top level
	const flattenedCollections = new Map<string, CollectionWithRelations>();

	const flatten = (collection: CollectionWithRelations) => {
		if (!flattenedCollections.has(collection.id)) {
			flattenedCollections.set(collection.id, {
				...collection,
				children: [],
				parent: null,
				parentId: null,
			});
		}

		if (collection.children && collection.children.length > 0) {
			collection.children.forEach((child) => flatten(child));
		}
	};

	collections.forEach((collection) => flatten(collection));

	return Array.from(flattenedCollections.values());
};

/**
 * Move a collection to a new parent (or root level)
 */
export async function moveCollectionAction(
	collectionId: string,
	newParentId: string | null,
	sortOrder?: number,
) {
	return await db.collection.update({
		where: { id: collectionId },
		data: {
			parentId: newParentId,
			...(sortOrder !== undefined && { sortOrder }),
			updatedAt: new Date(),
		},
	});
}

/**
 * O(1) reorder: Move a collection to a new position using fractional indexing
 * Only updates the single moved item's sortOrder
 */
export async function reorderCollectionAction(
	collectionId: string,
	prevSortOrder: number | null,
	nextSortOrder: number | null,
) {
	let newSortOrder: number;

	if (prevSortOrder === null && nextSortOrder === null) {
		// Only item
		newSortOrder = 1000;
	} else if (prevSortOrder === null) {
		// Moving to first position
		newSortOrder = nextSortOrder! / 2;
	} else if (nextSortOrder === null) {
		// Moving to last position
		newSortOrder = prevSortOrder + 1000;
	} else {
		// Moving between two items
		newSortOrder = (prevSortOrder + nextSortOrder) / 2;
	}

	return await db.collection.update({
		where: { id: collectionId },
		data: { sortOrder: newSortOrder },
	});
}

/**
 * O(1) reorder: Move a request to a new position using fractional indexing
 * Only updates the single moved item's sortOrder
 */
export async function reorderRequestAction(
	requestId: string,
	prevSortOrder: number | null,
	nextSortOrder: number | null,
) {
	let newSortOrder: number;

	if (prevSortOrder === null && nextSortOrder === null) {
		// Only item
		newSortOrder = 1000;
	} else if (prevSortOrder === null) {
		// Moving to first position
		newSortOrder = nextSortOrder! / 2;
	} else if (nextSortOrder === null) {
		// Moving to last position
		newSortOrder = prevSortOrder + 1000;
	} else {
		// Moving between two items
		newSortOrder = (prevSortOrder + nextSortOrder) / 2;
	}

	return await db.request.update({
		where: { id: requestId },
		data: { sortOrder: newSortOrder },
	});
}

/**
 * Batch reorder collections (fallback for bulk operations)
 */
export async function reorderCollectionsAction(orderedIds: string[]) {
	return await db.$transaction(
		async (tx) => {
			const updates = await Promise.all(
				orderedIds.map((id, index) =>
					tx.collection.update({
						where: { id },
						data: { sortOrder: (index + 1) * 1000 },
					}),
				),
			);
			return updates;
		},
		{ timeout: 30000 },
	);
}

/**
 * Batch reorder requests (fallback for bulk operations)
 */
export async function reorderRequestsAction(orderedIds: string[]) {
	return await db.$transaction(
		async (tx) => {
			const updates = await Promise.all(
				orderedIds.map((id, index) =>
					tx.request.update({
						where: { id },
						data: { sortOrder: (index + 1) * 1000 },
					}),
				),
			);
			return updates;
		},
		{ timeout: 30000 },
	);
}
