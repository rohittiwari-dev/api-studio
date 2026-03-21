import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import db from "@/lib/db";

export async function getWorkspaceAiModel(workspaceId?: string | null) {
  if (!workspaceId) {
    throw new Error("Workspace ID is required for AI operations.");
  }

  const org = await db.organization.findUnique({
    where: { id: workspaceId },
    select: { aiConfig: true },
  });

  if (!org?.aiConfig) {
    throw new Error(
      "No AI Configuration found for this workspace. Please configure an AI Provider in Settings.",
    );
  }

  const config = org.aiConfig as {
    provider: string;
    apiKey: string;
    model?: string;
  };

  if (!config.apiKey) {
    throw new Error("API Key is missing in your Workspace AI Configuration.");
  }

  if (config.provider === "openai") {
    const openai = createOpenAI({ apiKey: config.apiKey });
    return openai(config.model || "gpt-4o-mini");
  }

  if (config.provider === "google") {
    const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
    return google(config.model || "gemini-2.0-flash");
  }

  throw new Error("Invalid AI Provider specified in Workspace Configuration.");
}
