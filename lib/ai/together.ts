// lib/ai/together.ts
// Direct Together.ai integration for specialized tasks requiring specific open-source models

const BASE = 'https://api.together.xyz/v1'

export const TOGETHER_MODELS = {
  chat:     'meta-llama/Llama-3.3-70B-Instruct-Turbo',   // General chat, high quality
  fast:     'meta-llama/Llama-3.1-8B-Instruct-Turbo',    // Fast + cheap for simple tasks
  code:     'Qwen/Qwen2.5-Coder-32B-Instruct',           // Code generation
  content:  'meta-llama/Llama-3.1-70B-Instruct-Turbo',   // Long-form content
  kimi:     'moonshotai/Kimi-K2.5',                       // Kimi via Together (alternative)
  deepseek: 'deepseek-ai/DeepSeek-V3',                   // DeepSeek via Together (alternative)
  classify: 'google/gemma-2-9b-it',                       // Small, cheap classification
} as const

async function callTogether(
  model: string,
  messages: { role: string; content: string }[],
  maxTokens = 500,
  temperature = 0.7
): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) throw new Error('TOGETHER_API_KEY not set')

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    signal: AbortSignal.timeout(45_000),
  })

  if (!res.ok) throw new Error(`Together ${res.status}: ${await res.text()}`)
  return (await res.json()).choices?.[0]?.message?.content || ''
}

export async function generateSocialPost(
  businessName: string,
  platform: 'facebook' | 'instagram' | 'twitter',
  topic: string,
  tone = 'friendly'
): Promise<string> {
  const limits = { facebook: 500, instagram: 300, twitter: 280 }
  return callTogether(
    TOGETHER_MODELS.content,
    [{
      role: 'user',
      content: `Write a ${platform} post for "${businessName}" about: ${topic}
Tone: ${tone}. Max ${limits[platform]} characters. Include emojis and hashtags.
Return ONLY the post text — no labels, no brackets, no explanations.`
    }],
    400, 0.9
  )
}

export async function generateSalesScript(
  businessName: string,
  businessType: string,
  agentName: string,
  intelligence: string
): Promise<string> {
  return callTogether(
    TOGETHER_MODELS.chat,
    [{
      role: 'user',
      content: `Write a 60-second sales call opening for calling "${businessName}" (${businessType}).
Sales rep: ${agentName}. Platform: Platinum Directory Temecula Valley.
Business intel: ${intelligence}
Make it conversational, reference their business specifically, lead naturally to discussing their online presence.
Return ONLY the script — no stage directions or brackets.`
    }],
    600, 0.8
  )
}
