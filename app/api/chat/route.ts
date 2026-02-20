import { NextRequest } from "next/server";
import { callChatAI, type AIMessage } from "@/lib/ai/router";

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
    const { messages, message, conversationHistory } = await req.json();

    // Support both old format (messages array) and new format (message + conversationHistory)
    let chatMessages: AIMessage[];
    if (messages && Array.isArray(messages)) {
      chatMessages = messages.slice(-20);
    } else if (message?.trim()) {
      chatMessages = [
        ...(conversationHistory || []).slice(-10),
        { role: "user" as const, content: message },
      ];
    } else {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await callChatAI(chatMessages, SYSTEM_PROMPT);

    return new Response(
      JSON.stringify({
        reply: result.text,
        content: result.text, // backward compat
        ...(process.env.NODE_ENV === "development" && {
          _debug: {
            provider: result.provider,
            model: result.model,
            attempts: result.attemptCount,
          },
        }),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(
      JSON.stringify({
        reply: "I'm having trouble right now. Try searching the directory directly!",
        content: "I'm having trouble right now. Try searching the directory directly!",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
