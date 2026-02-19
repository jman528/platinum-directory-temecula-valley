'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function createLead(formData: FormData) {
  const supabase = createAdminClient()

  const businessId = formData.get('businessId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const message = formData.get('message') as string
  const service = formData.get('service') as string
  const source = (formData.get('source') as string) || 'website'

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      business_id: businessId,
      name,
      email,
      phone: phone || '',
      message: message || (service ? `Service inquiry: ${service}` : ''),
      status: 'new',
      source,
    })
    .select()
    .single()

  if (error) {
    console.error('Lead creation error:', error)
    throw new Error('Failed to create lead')
  }

  return lead
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = createAdminClient()

  const { data: updated, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .select()
    .single()

  if (error) {
    console.error('Lead status update error:', error)
    throw new Error('Failed to update lead status')
  }

  return updated
}
