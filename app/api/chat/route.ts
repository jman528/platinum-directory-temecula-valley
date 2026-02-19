import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/ai/provider";

const SYSTEM_PROMPT = `You are the Platinum Directory AI Assistant for Temecula Valley.
You help visitors discover local businesses, wineries, restaurants, deals, and events in the Temecula Valley area (including Temecula, Murrieta, Hemet, Menifee, Fallbrook, Lake Elsinore, Perris, Wildomar, Sun City, Winchester, and Canyon Lake).

Key things you can help with:
- Recommending local businesses, restaurants, and wineries
- Explaining Smart Offers and how to purchase/redeem them
- Helping navigate the directory
- Answering questions about Temecula Valley wine country
- Explaining membership tiers (Free, Verified Platinum, Platinum Partner, Platinum Elite)

Keep responses concise, friendly, and helpful. Use 2-3 sentences max unless the user asks for detail. When recommending businesses, suggest they search the directory at /search or browse deals at /deals.

Do NOT make up specific business names, phone numbers, or addresses unless you are certain they exist. Instead, direct users to search the directory.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepend system message
    const fullMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-20), // Keep last 20 messages for context window
    ];

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(fullMessages, {
            temperature: 0.7,
            maxTokens: 512,
          })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err: any) {
          console.error("Chat stream error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message || "AI service unavailable" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
