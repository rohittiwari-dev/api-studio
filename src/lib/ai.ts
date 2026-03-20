import { createGoogleGenerativeAI } from "@ai-sdk/google";
import env from "./env";

// Google Gemini AI client — shared module-level instance
export const google = createGoogleGenerativeAI({
  apiKey: env.AI_API_KEY,
});

// The model to use — configurable via env, defaults to gemini-2.0-flash
export const aiModel = google(env.AI_MODEL ?? "gemini-2.0-flash");
