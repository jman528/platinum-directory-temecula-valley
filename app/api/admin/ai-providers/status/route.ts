import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  // Return boolean only — never expose key values
  return NextResponse.json({
    groq: !!process.env.GROQ_API_KEY,
    google: !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY),
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    moonshot: !!(process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY),
    together: !!process.env.TOGETHER_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key'),
  })
}
