import { defineField, defineType } from 'sanity'

export const giveaway = defineType({
  name: 'giveaway',
  title: 'Giveaway',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({
      name: 'giveawayType', title: 'Giveaway Type', type: 'string', validation: (Rule) => Rule.required(),
      options: { list: [
        { title: 'Consumer Giveaway', value: 'consumer' },
        { title: 'Business Sweepstakes', value: 'business' },
      ]},
      description: 'consumer = $250/week prizes for local residents | business = $3,500 Elite package sweepstakes for paying businesses'
    }),
    defineField({ name: 'prizeValue', title: 'Prize Value ($)', type: 'number', description: 'Prize value in dollars' }),
    defineField({ name: 'prizeDescription', title: 'Prize Description', type: 'string' }),
    defineField({ name: 'eligibility', title: 'Eligibility', type: 'text', description: 'Who can enter' }),
    defineField({
      name: 'requiredTiers', title: 'Required Tiers', type: 'array', of: [{ type: 'string' }],
      options: { list: [
        { title: 'Verified Platinum', value: 'verified_platinum' },
        { title: 'Platinum Partner', value: 'platinum_partner' },
        { title: 'Platinum Elite', value: 'platinum_elite' },
      ] },
      description: 'For business sweepstakes ONLY — which paid tiers qualify'
    }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'datetime' }),
    defineField({ name: 'endDate', title: 'End Date', type: 'datetime' }),
    defineField({ name: 'drawingFrequency', title: 'Drawing Frequency', type: 'string', options: { list: ['weekly', 'monthly', 'quarterly', 'one-time'] } }),
    defineField({ name: 'image', title: 'Image', type: 'image' }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({ name: 'entryCount', title: 'Entry Count', type: 'number', initialValue: 0 }),
    defineField({ name: 'sponsoringBusinesses', title: 'Sponsoring Businesses', type: 'array', of: [{ type: 'reference', to: [{ type: 'business' }] }] }),
    defineField({ name: 'rules', title: 'Rules', type: 'blockContent' }),
  ]
})
