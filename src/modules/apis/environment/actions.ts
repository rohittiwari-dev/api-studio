'use server';

import { createId } from '@paralleldrive/cuid2';
import db from '@/lib/db';
import { EnvironmentVariable } from './store/environment.store';

export async function getEnvironmentsByWorkspace(workspaceId: string) {
	return await db.environment.findMany({
		where: { workspaceId },
		orderBy: { createdAt: 'asc' },
	});
}

export async function getEnvironmentById(id: string) {
	return await db.environment.findUnique({
		where: { id },
	});
}

export async function createEnvironmentAction(
	workspaceId: string,
	name: string,
	variables: EnvironmentVariable[] = [],
	description?: string,
) {
	const id = createId();
	return await db.environment.create({
		data: {
			id,
			name,
			description,
			variables: variables as any,
			isGlobal: false,
			workspaceId,
		},
	});
}

export async function updateEnvironmentAction(
	id: string,
	data: {
		name?: string;
		description?: string;
		variables?: EnvironmentVariable[];
		isGlobal?: boolean;
	},
) {
	return await db.environment.update({
		where: { id },
		data: {
			...data,
			variables: data.variables as any,
		},
	});
}

export async function deleteEnvironmentAction(id: string) {
	return await db.environment.delete({
		where: { id },
	});
}

export async function duplicateEnvironmentAction(id: string, newName: string) {
	const original = await db.environment.findUnique({
		where: { id },
	});

	if (!original) {
		throw new Error('Environment not found');
	}

	const newId = createId();
	return await db.environment.create({
		data: {
			id: newId,
			name: newName,
			description: original.description,
			variables: original.variables as any,
			isGlobal: false,
			workspaceId: original.workspaceId,
		},
	});
}
