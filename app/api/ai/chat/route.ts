import { NextRequest, NextResponse } from 'next/server'

const PD_ASSISTANT_SYSTEM_PROMPT = `You are the Platinum Directory Assistant for Temecula Valley, California.
You help visitors discover local businesses, wineries, restaurants, spas,
and attractions. You know about Temecula's wine country, Old Town, and
the surrounding area. Keep responses concise (2-3 sentences max).
When asked about specific businesses, suggest they search the directory.
Current date: ${new Date().toLocaleDateString()}`

// Model fallback chain for PD Assistant
// Priority: Groq (primary) → Google Gemini → DeepSeek → OpenAI → Anthropic (last resort)
const MODEL_CHAIN = [
  {
    provider: 'groq' as const,
    model: 'llama-3.3-70b-versatile',
    apiKey: () => process.env.GROQ_API_KEY,
  },
  {
    provider: 'google' as const,
    model: 'gemini-2.0-flash',
    apiKey: () => process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
  },
  {
    provider: 'deepseek' as const,
    model: 'deepseek-chat',
    apiKey: () => process.env.DEEPSEEK_API_KEY,
  },
  {
    provider: 'openai' as const,
    model: 'gpt-4o-mini',
    apiKey: () => process.env.OPENAI_API_KEY,
  },
  {
    provider: 'anthropic' as const,
    model: 'claude-haiku-4-5-20251001',
    apiKey: () => process.env.ANTHROPIC_API_KEY,
  },
]

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callWithFallback(messages: ChatMessage[]) {
  for (const config of MODEL_CHAIN) {
    const apiKey = config.apiKey()
    if (!apiKey || apiKey === 'your_anthropic_key') continue
    try {
      if (config.provider === 'groq') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            max_tokens: 500,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(15_000),
        })
        if (response.ok) {
          const data = await response.json()
          return { text: data.choices[0]?.message?.content, provider: config.provider, model: config.model }
        }
      }
      if (config.provider === 'google') {
        const systemMsg = messages.find(m => m.role === 'system')
        const convo = messages.filter(m => m.role !== 'system')
        const body: Record<string, unknown> = {
          contents: convo.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }
        if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15_000),
          }
        )
        if (response.ok) {
          const data = await response.json()
          return { text: data.candidates?.[0]?.content?.parts?.[0]?.text, provider: config.provider, model: config.model }
        }
      }
      if (config.provider === 'deepseek' || config.provider === 'openai') {
        const baseUrl = config.provider === 'deepseek'
          ? 'https://api.deepseek.com/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions'
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            max_tokens: 500,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(15_000),
        })
        if (response.ok) {
          const data = await response.json()
          return { text: data.choices[0]?.message?.content, provider: config.provider, model: config.model }
        }
      }
      if (config.provider === 'anthropic') {
        const systemMsg = messages.find(m => m.role === 'system')
        const convo = messages.filter(m => m.role !== 'system')
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: config.model,
            system: systemMsg?.content,
            messages: convo,
            max_tokens: 500,
          }),
          signal: AbortSignal.timeout(15_000),
        })
        if (response.ok) {
          const data = await response.json()
          return { text: data.content?.[0]?.text, provider: config.provider, model: config.model }
        }
      }
    } catch (err) {
      console.error(`Provider ${config.provider} failed:`, err)
      continue
    }
  }
  throw new Error('All AI providers failed')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, conversationHistory = [], messages: msgArray } = body

    // Support both formats: { messages: [...] } and { message, conversationHistory }
    let chatMessages: ChatMessage[]
    if (msgArray && Array.isArray(msgArray)) {
      // Dashboard AI page sends { messages: [...] }
      chatMessages = [
        { role: 'system', content: PD_ASSISTANT_SYSTEM_PROMPT },
        ...msgArray.slice(-20),
      ]
    } else if (message?.trim()) {
      chatMessages = [
        { role: 'system', content: PD_ASSISTANT_SYSTEM_PROMPT },
        ...conversationHistory.slice(-10),
        { role: 'user', content: message },
      ]
    } else {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const result = await callWithFallback(chatMessages)

    return NextResponse.json({
      reply: result.text,
      ...(process.env.NODE_ENV === 'development' && { _debug: { provider: result.provider, model: result.model } }),
    })
  } catch (err) {
    console.error('[Chat API]', err)
    return NextResponse.json({ reply: "I'm having trouble right now. Try searching the directory directly!" })
  }
}
