// lib/ai/openrouter.ts
// OpenRouter — single key for 200+ models
// Killer feature: native multi-model fallback routing

const BASE = 'https://openrouter.ai/api/v1'
const SITE_URL = 'https://platinumdirectorytemeculavalley.com'
const SITE_NAME = 'Platinum Directory Temecula Valley'

// Models available for FREE through OpenRouter (rate-limited but no charge)
export const OR_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
] as const

// Paid models accessible via OpenRouter
export const OR_PREMIUM_MODELS = {
  kimi_k25:    'moonshotai/kimi-k2.5',
  deepseek_r1: 'deepseek/deepseek-r1',
  claude_haiku:'anthropic/claude-haiku-4-5',
  gpt4o_mini:  'openai/gpt-4o-mini',
  llama_maverick: 'meta-llama/llama-4-maverick',
} as const

export async function callOpenRouter(
  model: string,
  messages: { role: string; content: string }[],
  options: {
    maxTokens?: number
    temperature?: number
    fallbackModels?: string[]  // OpenRouter's native fallback — unique feature
  } = {}
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const { maxTokens = 500, temperature = 0.7, fallbackModels } = options

  // If fallback models provided, use OpenRouter's native routing
  // It tries each model in order until one succeeds
  const body: Record<string, unknown> = fallbackModels?.length
    ? { models: [model, ...fallbackModels], messages, max_tokens: maxTokens, temperature, route: 'fallback' }
    : { model, messages, max_tokens: maxTokens, temperature }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': SITE_URL,
      'X-Title': SITE_NAME,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  })

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`)

  const data = await res.json()
  return {
    text: data.choices?.[0]?.message?.content || '',
    modelUsed: data.model || model,  // OR tells you which model actually responded
  }
}

// Fetch available models from OpenRouter (for admin dashboard)
export async function getOpenRouterModels() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return []

  const res = await fetch(`${BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return []

  const data = await res.json()
  return (data.data || []).map((m: Record<string, unknown>) => ({
    id: m.id,
    name: m.name,
    isFree: (m.pricing as Record<string, unknown>)?.prompt === '0',
    inputCost: (m.pricing as Record<string, unknown>)?.prompt,
    outputCost: (m.pricing as Record<string, unknown>)?.completion,
    contextLength: m.context_length,
  }))
}
