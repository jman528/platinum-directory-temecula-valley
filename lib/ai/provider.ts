export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

interface ChatResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

type Provider = "groq" | "openrouter" | "anthropic" | "ollama";

function getProvider(): Provider {
  return (process.env.AI_PROVIDER as Provider) || "groq";
}

// ─── Ollama ──────────────────────────────────────────────
async function ollamaChat(
  messages: ChatMessage[],
  opts: ChatOptions
): Promise<ChatResponse> {
  const base = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = opts.model || process.env.OLLAMA_MODEL || "llama3";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: opts.temperature ?? 0.7,
        num_predict: opts.maxTokens ?? 1024,
      },
    }),
  });

  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();

  return {
    content: data.message?.content ?? "",
    model,
    usage: data.eval_count
      ? { promptTokens: data.prompt_eval_count ?? 0, completionTokens: data.eval_count }
      : undefined,
  };
}

async function* ollamaStream(
  messages: ChatMessage[],
  opts: ChatOptions
): AsyncGenerator<string> {
  const base = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = opts.model || process.env.OLLAMA_MODEL || "llama3";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        temperature: opts.temperature ?? 0.7,
        num_predict: opts.maxTokens ?? 1024,
      },
    }),
  });

  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n").filter(Boolean)) {
      const json = JSON.parse(line);
      if (json.message?.content) yield json.message.content;
    }
  }
}

// ─── OpenRouter ──────────────────────────────────────────
async function openrouterChat(
  messages: ChatMessage[],
  opts: ChatOptions
): Promise<ChatResponse> {
  const model = opts.model || "meta-llama/llama-3-8b-instruct";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    model: data.model ?? model,
    usage: data.usage
      ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
      : undefined,
  };
}

async function* openrouterStream(
  messages: ChatMessage[],
  opts: ChatOptions
): AsyncGenerator<string> {
  const model = opts.model || "meta-llama/llama-3-8b-instruct";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
  yield* readSSEStream(res);
}

// ─── Anthropic ───────────────────────────────────────────
async function anthropicChat(
  messages: ChatMessage[],
  opts: ChatOptions
): Promise<ChatResponse> {
  const model = opts.model || "claude-sonnet-4-6";

  // Extract system message
  const systemMsg = messages.find((m) => m.role === "system")?.content;
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
      ...(systemMsg ? { system: systemMsg } : {}),
      messages: chatMessages,
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.type === "text" ? data.content[0].text : "";

  return {
    content: text,
    model: data.model ?? model,
    usage: data.usage
      ? { promptTokens: data.usage.input_tokens, completionTokens: data.usage.output_tokens }
      : undefined,
  };
}

async function* anthropicStream(
  messages: ChatMessage[],
  opts: ChatOptions
): AsyncGenerator<string> {
  const model = opts.model || "claude-sonnet-4-6";
  const systemMsg = messages.find((m) => m.role === "system")?.content;
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
      stream: true,
      ...(systemMsg ? { system: systemMsg } : {}),
      messages: chatMessages,
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        if (json.type === "content_block_delta" && json.delta?.text) {
          yield json.delta.text;
        }
      } catch { /* skip malformed lines */ }
    }
  }
}

// ─── Groq ────────────────────────────────────────────────
async function groqChat(
  messages: ChatMessage[],
  opts: ChatOptions
): Promise<ChatResponse> {
  const model = opts.model || "llama-3.3-70b-versatile";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    model: data.model ?? model,
    usage: data.usage
      ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
      : undefined,
  };
}

async function* groqStream(
  messages: ChatMessage[],
  opts: ChatOptions
): AsyncGenerator<string> {
  const model = opts.model || "llama-3.3-70b-versatile";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  yield* readSSEStream(res);
}

// ─── Shared SSE reader (OpenAI-compatible format) ────────
async function* readSSEStream(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { /* skip malformed lines */ }
    }
  }
}

// ─── Public API ──────────────────────────────────────────
export async function chatCompletion(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<ChatResponse> {
  const provider = getProvider();
  switch (provider) {
    case "ollama":
      return ollamaChat(messages, opts);
    case "openrouter":
      return openrouterChat(messages, opts);
    case "anthropic":
      return anthropicChat(messages, opts);
    case "groq":
      return groqChat(messages, opts);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export async function* streamChat(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): AsyncGenerator<string> {
  const provider = getProvider();
  switch (provider) {
    case "ollama":
      yield* ollamaStream(messages, opts);
      break;
    case "openrouter":
      yield* openrouterStream(messages, opts);
      break;
    case "anthropic":
      yield* anthropicStream(messages, opts);
      break;
    case "groq":
      yield* groqStream(messages, opts);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
