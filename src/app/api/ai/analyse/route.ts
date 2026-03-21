import { streamText } from "ai";
import { getWorkspaceAiModel } from "@/lib/ai";

interface AnalyseRequest {
  response: {
    status: number;
    statusText: string;
    time: number;
    size: number;
    headers: Record<string, string>;
    body: string | unknown;
  };
  request: {
    method: string;
    url: string;
  };
  workspaceId?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as AnalyseRequest;
  const { response, request, workspaceId } = body;

  const prompt = `Analyse this API response and provide a structured analysis in markdown:

## Request Context
- Method: ${request?.method || "GET"}
- URL: ${request?.url || "Unknown"}

## Response Data
- Status: ${response?.status} ${response?.statusText}
- Time: ${response?.time}ms
- Size: ${response?.size} bytes

### Response Headers
\`\`\`json
${JSON.stringify(response?.headers || {}, null, 2)}
\`\`\`

### Response Body
\`\`\`
${typeof response?.body === "string" ? response.body.slice(0, 3000) : JSON.stringify(response?.body, null, 2)?.slice(0, 3000)}
\`\`\`

Provide a brief, ultra-concise analysis focusing ONLY on:
1. **Status** — 1 brief sentence.
2. **Key Headers** — Only mention security/caching/rate-limit if relevant.
3. **Body & Issues** — 1-2 bullet points max on structure or errors.

CRITICAL: Keep your entire response as short as physically possible. No verbose paragraphs. Use emojis for visual scanning.`;

  try {
    const result = streamText({
      model: await getWorkspaceAiModel(workspaceId),
      prompt,
      maxOutputTokens: 2048,
    });

    const customStream = new ReadableStream({
      async start(controller) {
        const reader = result.textStream.getReader();
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (error: any) {
          console.error(
            "Analyse AI stream error:",
            error?.message || "Unknown error",
          );
          const isRateLimit =
            error?.statusCode === 429 ||
            error?.status === 429 ||
            error?.message?.toLowerCase().includes("quota");
          const errorMsg = isRateLimit
            ? "\n\n⚠️ **AI Quota Exceeded.** Please check your Gemini API plan and billing."
            : `\n\n⚠️ Error: Could not analyze response at this time.`;
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    const isRateLimit =
      error?.statusCode === 429 ||
      error?.status === 429 ||
      error?.message?.toLowerCase().includes("quota");
    if (isRateLimit) {
      return new Response(
        "AI Quota Exceeded. Please check your Gemini API plan and billing.",
        { status: 429 },
      );
    }
    return new Response(error?.message || "Internal Server Error", {
      status: 500,
    });
  }
}
