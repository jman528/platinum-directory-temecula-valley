import { defineField, defineType } from 'sanity'

export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  fields: [
    defineField({ name: 'business', title: 'Business', type: 'reference', to: [{ type: 'business' }] }),
    defineField({ name: 'customerName', title: 'Customer Name', type: 'string' }),
    defineField({ name: 'customerEmail', title: 'Customer Email', type: 'string' }),
    defineField({ name: 'customerPhone', title: 'Customer Phone', type: 'string' }),
    defineField({ name: 'message', title: 'Message', type: 'text' }),
    defineField({ name: 'service', title: 'Service', type: 'string' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['new', 'contacted', 'qualified', 'converted', 'lost'] }, initialValue: 'new' }),
    defineField({ name: 'source', title: 'Source', type: 'string', options: { list: ['directory_listing', 'smart_offer', 'search', 'referral', 'direct', 'giveaway'] } }),
  ]
})
