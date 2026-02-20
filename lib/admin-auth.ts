// lib/admin-auth.ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('user_type, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.user_type)) {
    redirect('/dashboard')
  }

  return { user, profile, isSuperAdmin: profile.user_type === 'super_admin' }
}

export async function requireSuperAdmin() {
  const { user, profile } = await requireAdmin()
  if (profile.user_type !== 'super_admin') {
    redirect('/admin')
  }
  return { user, profile }
}
