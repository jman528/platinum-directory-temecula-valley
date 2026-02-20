// lib/ai/router.ts
// Unified AI router — 8 providers, graceful empty-key fallback
// Priority: Groq → Gemini → DeepSeek → Kimi → Together → OpenRouter → OpenAI → Anthropic

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIRouterConfig {
  preferredProvider?: string
  model?: string             // override default model for preferred provider
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface AIResult {
  text: string
  provider: string
  model: string
  attemptCount: number
}

interface ProviderConfig {
  key: string
  provider: string
  model: string
  baseUrl: string
  apiKey: string | undefined
  callHandler: 'openai_compat' | 'google' | 'anthropic'
}

function buildFallbackChain(preferredProvider?: string, overrideModel?: string): ProviderConfig[] {
  const chain: ProviderConfig[] = [
    // ── 1: Groq ── Free, ultra-fast, best for internal tools
    {
      key: 'groq',
      provider: 'groq',
      model: 'llama-3.1-8b-instant',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
      callHandler: 'openai_compat',
    },
    // ── 2: Google Gemini ── Cheap, generous free tier, fast chat
    {
      key: 'google',
      provider: 'google',
      model: 'gemini-2.0-flash',
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
      callHandler: 'google',
    },
    // ── 3: DeepSeek ── Often beats GPT-4o, fraction of the cost
    {
      key: 'deepseek',
      provider: 'deepseek',
      model: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY,
      callHandler: 'openai_compat',
    },
    // ── 4: Kimi / Moonshot ── Agentic AI, 256K context
    {
      key: 'moonshot',
      provider: 'moonshot',
      model: 'kimi-k2-instruct',
      baseUrl: 'https://api.moonshot.cn/v1',
      apiKey: process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY,
      callHandler: 'openai_compat',
    },
    // ── 5: Together AI ── 50+ open-source models, good value
    {
      key: 'together',
      provider: 'together',
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      baseUrl: 'https://api.together.xyz/v1',
      apiKey: process.env.TOGETHER_API_KEY,
      callHandler: 'openai_compat',
    },
    // ── 6: OpenRouter ── 200+ models, free tier, ultimate fallback
    {
      key: 'openrouter',
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      callHandler: 'openai_compat',
    },
    // ── 7: OpenAI ── Use sparingly, more expensive
    {
      key: 'openai',
      provider: 'openai',
      model: 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY,
      callHandler: 'openai_compat',
    },
    // ── 8: Anthropic ── Last resort, highest cost, different format
    {
      key: 'anthropic',
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      baseUrl: 'https://api.anthropic.com',
      apiKey: process.env.ANTHROPIC_API_KEY,
      callHandler: 'anthropic',
    },
  ]

  // Skip any provider with empty/missing API key — no crash, no throw
  const available = chain.filter(p => p.apiKey && p.apiKey.trim() !== '' && p.apiKey !== 'your_anthropic_key')

  if (available.length === 0) return []

  // Apply model override to preferred provider
  if (overrideModel && preferredProvider) {
    const target = available.find(p => p.key === preferredProvider)
    if (target) target.model = overrideModel
  }

  // Bubble preferred provider to front of chain
  if (preferredProvider) {
    const idx = available.findIndex(p => p.key === preferredProvider)
    if (idx > 0) {
      const [preferred] = available.splice(idx, 1)
      available.unshift(preferred)
    }
  }

  return available
}

// ── CALL HANDLERS ────────────────────────────────────────────

async function callOpenAICompat(
  config: ProviderConfig,
  messages: AIMessage[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  }

  // OpenRouter requires attribution headers
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://platinumdirectorytemeculavalley.com'
    headers['X-Title'] = 'Platinum Directory Temecula Valley'
  }

  // DeepSeek reasoner requires temperature=1
  const effectiveTemp = config.model === 'deepseek-reasoner' ? 1 : temperature

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: maxTokens,
      temperature: effectiveTemp,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    throw new Error(`${config.provider} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error(`${config.provider} returned empty content`)
  return content
}

async function callGoogle(
  config: ProviderConfig,
  messages: AIMessage[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const convo = messages.filter(m => m.role !== 'system')

  const body: Record<string, unknown> = {
    contents: convo.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: maxTokens, temperature },
  }
  if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] }

  const res = await fetch(
    `${config.baseUrl}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    }
  )

  if (!res.ok) throw new Error(`Google HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)

  const data = await res.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Google returned empty content')
  return content
}

async function callAnthropic(
  config: ProviderConfig,
  messages: AIMessage[],
  maxTokens: number,
  _temperature: number
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const convo = messages.filter(m => m.role !== 'system')

  const res = await fetch(`${config.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      system: systemMsg?.content,
      messages: convo,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)

  const data = await res.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Anthropic returned empty content')
  return content
}

// ── MAIN EXPORT ──────────────────────────────────────────────

export async function callAI(
  messages: AIMessage[],
  config: AIRouterConfig = {}
): Promise<AIResult> {
  const {
    preferredProvider,
    model: overrideModel,
    maxTokens = 500,
    temperature = 0.7,
    systemPrompt,
  } = config

  const fullMessages: AIMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  const chain = buildFallbackChain(preferredProvider, overrideModel)

  if (chain.length === 0) {
    console.warn('[AI Router] No providers configured.')
    return { text: "I'm not available right now. Please try again later.", provider: 'none', model: 'none', attemptCount: 0 }
  }

  const errors: string[] = []

  for (let i = 0; i < chain.length; i++) {
    const p = chain[i]
    try {
      let text: string
      if (p.callHandler === 'google') text = await callGoogle(p, fullMessages, maxTokens, temperature)
      else if (p.callHandler === 'anthropic') text = await callAnthropic(p, fullMessages, maxTokens, temperature)
      else text = await callOpenAICompat(p, fullMessages, maxTokens, temperature)

      if (i > 0) console.info(`[AI Router] Fallback used: ${p.provider} (attempt ${i + 1})`)
      return { text, provider: p.provider, model: p.model, attemptCount: i + 1 }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`[${p.provider}] ${msg}`)
      console.error(`[AI Router] ${p.provider} failed:`, msg)
    }
  }

  console.error('[AI Router] All providers exhausted:', errors)
  return { text: "I'm having trouble connecting. Please try again in a moment.", provider: 'failed', model: 'none', attemptCount: chain.length }
}

// ── CONVENIENCE HELPERS ──────────────────────────────────────

// Real-time chat — speed matters, use Groq first
export async function callChatAI(messages: AIMessage[], systemPrompt: string): Promise<AIResult> {
  return callAI(messages, { systemPrompt, maxTokens: 350, temperature: 0.7, preferredProvider: 'groq' })
}

// Structured extraction — accuracy matters, use DeepSeek V3
export async function callEnrichmentAI(prompt: string): Promise<AIResult> {
  return callAI([{ role: 'user', content: prompt }], {
    maxTokens: 1500, temperature: 0.2, preferredProvider: 'deepseek',
  })
}

// Long-form content generation — use Together Llama 70B
export async function callContentAI(prompt: string): Promise<AIResult> {
  return callAI([{ role: 'user', content: prompt }], {
    maxTokens: 2000, temperature: 0.8, preferredProvider: 'together',
  })
}

// Complex reasoning — use DeepSeek R1 (chain-of-thought)
export async function callReasoningAI(prompt: string): Promise<AIResult> {
  return callAI([{ role: 'user', content: prompt }], {
    maxTokens: 4000, temperature: 1.0,
    preferredProvider: 'deepseek', model: 'deepseek-reasoner',
  })
}

// Cost-zero fallback — use OpenRouter free tier models
export async function callFreeAI(messages: AIMessage[], systemPrompt?: string): Promise<AIResult> {
  return callAI(messages, {
    systemPrompt, maxTokens: 500, temperature: 0.7,
    preferredProvider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
  })
}
