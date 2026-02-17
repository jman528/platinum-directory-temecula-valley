'use server'

import { writeClient } from '@/lib/sanity/write-client'

export async function createLead(formData: FormData) {
  const lead = await writeClient.create({
    _type: 'lead',
    business: { _type: 'reference', _ref: formData.get('businessId') as string },
    customerName: formData.get('name') as string,
    customerEmail: formData.get('email') as string,
    customerPhone: formData.get('phone') as string,
    message: formData.get('message') as string,
    service: formData.get('service') as string,
    status: 'new',
    source: (formData.get('source') as string) || 'directory_listing',
  })

  return lead
}

export async function updateLeadStatus(leadId: string, status: string) {
  const updated = await writeClient.patch(leadId).set({ status }).commit()
  return updated
}
