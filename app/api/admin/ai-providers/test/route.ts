import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/router'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin' && profile?.user_type !== 'super_admin') return null
  return user
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { provider } = await req.json()
  if (!provider) return NextResponse.json({ error: 'Provider required' }, { status: 400 })

  const start = Date.now()
  try {
    const result = await callAI(
      [{ role: 'user', content: 'Reply with only the word: OK' }],
      { preferredProvider: provider, maxTokens: 10, temperature: 0 }
    )

    const latencyMs = Date.now() - start

    // Check if the actual provider used matches the requested one
    const usedRequested = result.provider === provider

    return NextResponse.json({
      success: true,
      latencyMs,
      response: result.text.trim(),
      model: result.model,
      provider: result.provider,
      usedRequested,
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
