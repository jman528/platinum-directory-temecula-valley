import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createHash, randomBytes } from 'crypto'

function hashKey(key: string): string {
  return createHash('sha256').update(key + (process.env.KEY_SALT || 'pd_salt_2026')).digest('hex')
}

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

  const { keyName, agentName, agentDescription, allowedActions, expiresInDays } = await req.json()
  const adminClient = createAdminClient()

  const rawKey = `pdtv_${randomBytes(24).toString('base64url')}`
  const keyHash = hashKey(rawKey)
  const keyLast4 = rawKey.slice(-4)

  const { data, error } = await adminClient
    .from('external_api_keys')
    .insert({
      key_name: keyName,
      key_prefix: 'pdtv_',
      key_hash: keyHash,
      key_last4: keyLast4,
      agent_name: agentName,
      agent_description: agentDescription,
      allowed_actions: allowedActions || ['search', 'list_businesses', 'get_business'],
      owned_by_user_id: user.id,
      expires_at: expiresInDays
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id,
    key: rawKey,   // Shown ONCE — never stored in plaintext
    keyLast4,
    message: 'Copy this key now. It will not be shown again.',
  })
}

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('external_api_keys')
    .select('id, key_name, key_prefix, key_last4, agent_name, is_active, last_used_at, use_count, expires_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keys: data })
}
