"use server";
import { createId } from "@paralleldrive/cuid2";
import { Prisma, type Request } from "@/generated/prisma/client";
import db from "@/lib/db";

export const getAllRequests = async (workspace: string) => {
  try {
    const data = await db.request.findMany({
      where: { workspaceId: workspace },
      include: {},
    });
    return data;
  } catch (_error) {
    return [];
  }
};

export const getRequestById = async (id: string, workspace: string) => {
  return await db.request.findUnique({
    where: { id, collection: { workspaceId: workspace } },
    include: {},
  });
};

export const createRequest = async (data: Request) => {
  return await db.request.create({
    data: {
      name: data.name,
      url: data.url,
      method: data.method,
      headers: (data.headers || []) as Prisma.InputJsonValue[],
      parameters: (data.parameters || []) as Prisma.InputJsonValue[],
      body: data.body || undefined,
      collectionId: data.collectionId,
      workspaceId: data.workspaceId,
      auth: data.auth || undefined,
      bodyType: data.bodyType || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: data.type,
      messageType: data.messageType,
      id: data.id,
    },
    include: {},
  });
};

export const updateRequest = async (
  id: string,
  data: Partial<
    Omit<
      Request,
      "id" | "createdAt" | "updatedAt" | "workspaceId" | "collectionId"
    >
  >,
) => {
  const { savedMessages, ...updateData } = data;
  return await db.request.update({
    where: {
      id,
    },
    data: {
      ...updateData,
      headers: (data.headers || []) as Prisma.InputJsonValue[],
      parameters: (data.parameters || []) as Prisma.InputJsonValue[],
      body: data.body || undefined,
      auth: data.auth || undefined,
      updatedAt: new Date(),
      // Handle savedMessages: use Prisma.JsonNull if null, otherwise the value or undefined
      ...(savedMessages !== undefined && {
        savedMessages:
          savedMessages === null
            ? Prisma.JsonNull
            : (savedMessages as Prisma.InputJsonValue),
      }),
    },
  });
};

export const deleteRequest = async (id: string, workspace: string) => {
  return await db.request.delete({
    where: { id, workspaceId: workspace },
  });
};

export const getAllIndependentRequests = async (workspace: string) => {
  try {
    const data = await db.request.findMany({
      where: {
        workspaceId: workspace,
        collectionId: null,
      },
      include: {},
      orderBy: { sortOrder: "asc" },
    });
    return {
      success: true,
      data,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Failed to fetch independent requests",
    };
  }
};

export const getRequestsByCollectionId = async (collectionId: string) => {
  return await db.request.findMany({
    where: {
      collectionId,
    },
    include: {},
  });
};
export const getRequestCountByCollectionId = async (collectionId: string) => {
  return await db.request.count({
    where: {
      collectionId,
    },
  });
};

export const getRecentRequests = async (workspaceId: string, limit: number) => {
  return await db.request.findMany({
    where: { workspaceId },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });
};

export const duplicateRequest = async (
  id: string,
  id_for_duplicate: string,
) => {
  const request = (await db.request.findUnique({
    where: { id },
  })) as Request | null;
  if (!request) {
    throw new Error("Request not found");
  }
  return await db.request.create({
    data: {
      id: id_for_duplicate || createId(),
      name: request.name,
      url: request.url,
      method: request.method,
      headers: (request.headers || []) as Prisma.InputJsonValue[],
      parameters: (request.parameters || []) as Prisma.InputJsonValue[],
      body: request.body ?? undefined,
      collectionId: request.collectionId,
      workspaceId: request.workspaceId,
      auth: (request.auth ?? undefined) as Prisma.InputJsonValue | undefined,
      bodyType: request.bodyType ?? undefined,
      type: request.type,
      messageType: request.messageType ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: request.description ?? undefined,
    },
  });
};

export const getAllRequestsWithCollectionInfo = async (workspaceId: string) => {
  return await db.request.findMany({
    where: { workspaceId, collectionId: { not: null } },
    include: {
      collection: true,
    },
  });
};
