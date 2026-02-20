// app/api/credits/balance/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get balance from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_credits_balance')
    .eq('id', user.id)
    .single()

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('ai_credit_transactions')
    .select('id, credits_delta, reason, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    balance: profile?.ai_credits_balance ?? 0,
    transactions: transactions ?? [],
  })
}
