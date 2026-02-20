"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bot, Send, Loader2, Coins, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [tier, setTier] = useState("free");
  const [userType, setUserType] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: biz }] = await Promise.all([
        supabase.from("profiles").select("ai_credits_balance, user_type").eq("id", user.id).single(),
        supabase.from("businesses").select("tier").eq("owner_user_id", user.id).limit(1).single(),
      ]);

      setCreditBalance(profile?.ai_credits_balance ?? 0);
      setTier(biz?.tier || "free");
      setUserType(profile?.user_type || "");
    }
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "I couldn't generate a response." },
        ]);
        if (creditBalance !== null) {
          setCreditBalance((prev) => Math.max(0, (prev || 0) - 1));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = userType === "super_admin" || userType === "admin";
  const isPaidTier = isAdmin || tier !== "free";

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">AI Assistant</h1>
          <p className="mt-1 text-gray-400">
            Get help optimizing your listing, generating social posts, and business insights
          </p>
        </div>
        {creditBalance !== null && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Coins className="h-4 w-4 text-pd-gold" />
            <span className="text-sm text-gray-400">
              <span className="font-semibold text-white">{creditBalance}</span> credits
            </span>
          </div>
        )}
      </div>

      {!isPaidTier ? (
        <div className="mt-8 glass-card flex-1 p-8 text-center">
          <Bot className="mx-auto h-16 w-16 text-gray-500" />
          <h3 className="mt-4 text-xl font-bold text-white">AI Assistant</h3>
          <p className="mt-2 text-gray-400">
            Upgrade to Partner or Elite plan to access the AI Assistant.
            Get help with listing optimization, social media posts, and competitive insights.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pd-gold px-6 py-3 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light"
          >
            <Sparkles className="h-4 w-4" /> Upgrade to Unlock
          </a>
        </div>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Bot className="mx-auto h-12 w-12 text-gray-600" />
                  <p className="mt-3 text-gray-400">
                    I&apos;m your Platinum Directory AI assistant. I can help optimize your listing,
                    generate social posts, and provide business insights.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[
                      "Optimize my listing description",
                      "Generate a social media post",
                      "Suggest keywords for my business",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-pd-purple/20 text-white"
                      : "border border-white/10 bg-white/5 text-gray-300"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask your AI assistant..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-pd-purple"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-pd-purple px-4 py-3 text-white hover:bg-pd-purple/80 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
