"use server";

import type { Organization } from "@/generated/prisma/client";
import db from "@/lib/db";

export const getActiveOrganization = async (
  userId: string,
): Promise<{
  name: string;
  id: string;
  createdAt: Date;
  slug: string | null;
  logo: string | null;
  metadata: string | null;
} | null> => {
  // Get the most recent session with an active org for this user
  const recentSession = await db.session.findFirst({
    where: {
      userId,
      activeOrganizationId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { activeOrganizationId: true },
  });

  // If we have an org ID from session, fetch and return it
  if (recentSession?.activeOrganizationId) {
    const org = await db.organization.findUnique({
      where: { id: recentSession.activeOrganizationId },
    });
    if (org) {
      return org;
    }
  }

  // Fallback: Get the most recent organization the user is a member of
  return db.organization.findFirst({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
  });
};

export const listUserWorkspaces = async (userId: string) => {
  try {
    const workspaces = await db.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return workspaces;
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return [];
  }
};

export const updateWorkspaceGlobalAuth = async (
  workspaceId: string,
  globalAuth: { type: string; data?: unknown } | null,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await db.organization.update({
      where: { id: workspaceId },
      data: { globalAuth: globalAuth as any },
    });
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to update global auth" };
  }
};

export const getWorkspaceWithGlobalAuth = async (
  workspaceId: string,
): Promise<Organization | null> => {
  try {
    const workspace = await db.organization.findUnique({
      where: { id: workspaceId },
    });
    return workspace;
  } catch (_error) {
    return null;
  }
};

export const getWorkspaceById = async (
  workspaceId: string,
): Promise<Organization | null> => {
  try {
    const workspace = await db.organization.findUnique({
      where: { id: workspaceId },
    });
    return workspace;
  } catch (_error) {
    return null;
  }
};

export const updateWorkspaceAiConfig = async (
  workspaceId: string,
  aiConfig: {
    provider: string;
    apiKey: string;
    model?: string;
    enabled?: boolean;
  } | null,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await db.organization.update({
      where: { id: workspaceId },
      data: { aiConfig: aiConfig as any },
    });
    return { success: true };
  } catch (err: any) {
    console.error("updateWorkspaceAiConfig error:", err);
    return {
      success: false,
      error: err.message || "Failed to update AI config",
    };
  }
};

export const getWorkspaceAiConfig = async (workspaceId: string) => {
  try {
    const workspace = await db.organization.findUnique({
      where: { id: workspaceId },
      select: { aiConfig: true },
    });
    return workspace?.aiConfig as {
      provider: string;
      apiKey: string;
      model?: string;
      enabled?: boolean;
    } | null;
  } catch (_error) {
    return null;
  }
};
