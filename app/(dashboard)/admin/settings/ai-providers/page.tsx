"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PROVIDER_META: Record<
  string,
  { label: string; priority: number; envKey: string; color: string; notes: string }
> = {
  groq: {
    label: "Groq",
    priority: 1,
    envKey: "GROQ_API_KEY",
    color: "yellow",
    notes: "Free tier, 14,400 req/day. Fastest inference.",
  },
  google: {
    label: "Google Gemini",
    priority: 2,
    envKey: "GOOGLE_GEMINI_API_KEY",
    color: "blue",
    notes: "Very cheap, generous free tier. Chat fallback.",
  },
  deepseek: {
    label: "DeepSeek",
    priority: 3,
    envKey: "DEEPSEEK_API_KEY",
    color: "purple",
    notes: "Beats GPT-4o at 10x lower cost. Best for enrichment.",
  },
  moonshot: {
    label: "Kimi / Moonshot",
    priority: 4,
    envKey: "MOONSHOT_API_KEY",
    color: "indigo",
    notes: "256K context. Great for agentic long-context tasks.",
  },
  together: {
    label: "Together AI",
    priority: 5,
    envKey: "TOGETHER_API_KEY",
    color: "green",
    notes: "50+ open-source models. Content generation.",
  },
  openrouter: {
    label: "OpenRouter",
    priority: 6,
    envKey: "OPENROUTER_API_KEY",
    color: "teal",
    notes: "200+ models, one key. Has FREE tier models.",
  },
  openai: {
    label: "OpenAI",
    priority: 7,
    envKey: "OPENAI_API_KEY",
    color: "emerald",
    notes: "Use sparingly. gpt-4o-mini for cost control.",
  },
  anthropic: {
    label: "Anthropic",
    priority: 8,
    envKey: "ANTHROPIC_API_KEY",
    color: "orange",
    notes: "Highest quality, highest cost. Last resort.",
  },
};

interface TestResult {
  success: boolean;
  latencyMs: number;
  response?: string;
  model?: string;
  error?: string;
}

export default function AIProvidersPage() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (
        profile?.user_type !== "admin" &&
        profile?.user_type !== "super_admin"
      ) {
        window.location.href = "/dashboard";
        return;
      }
      setAuthorized(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authorized) return;
    async function fetchStatus() {
      try {
        const res = await fetch("/api/admin/ai-providers/status");
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch provider status:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [authorized]);

  async function testProvider(key: string) {
    setTesting(key);
    try {
      const res = await fetch("/api/admin/ai-providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: key }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [key]: data }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [key]: { success: false, latencyMs: 0, error: "Network error" },
      }));
    } finally {
      setTesting(null);
    }
  }

  if (!authorized || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  const configuredCount = Object.values(status).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">
            AI Providers
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {configuredCount} of 8 providers configured. Priority order
            determines fallback chain.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Object.entries(PROVIDER_META).map(([key, meta]) => {
          const isConfigured = status[key] ?? false;
          const result = testResults[key];

          return (
            <div
              key={key}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-colors ${
                isConfigured
                  ? "border-white/10 bg-white/5"
                  : "border-white/5 bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                      isConfigured
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-500"
                    }`}
                  >
                    {meta.priority}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{meta.label}</h3>
                    <p className="text-xs text-gray-500">{meta.envKey}</p>
                  </div>
                </div>
                {isConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-600" />
                )}
              </div>

              <p className="mt-3 text-xs text-gray-400">{meta.notes}</p>

              {isConfigured && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => testProvider(key)}
                    disabled={testing === key}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50"
                  >
                    {testing === key ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                    Test
                  </button>
                  {result && (
                    <span
                      className={`text-xs ${result.success ? "text-green-400" : "text-red-400"}`}
                    >
                      {result.success
                        ? `OK — ${result.latencyMs}ms (${result.model})`
                        : `Failed: ${result.error}`}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
