import { defineField, defineType } from 'sanity'

export const giveawayEntry = defineType({
  name: 'giveawayEntry',
  title: 'Giveaway Entry',
  type: 'document',
  fields: [
    defineField({ name: 'giveaway', title: 'Giveaway', type: 'reference', to: [{ type: 'giveaway' }] }),
    // Consumer entry fields
    defineField({ name: 'fullName', title: 'Full Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'zipCode', title: 'ZIP Code', type: 'string' }),
    defineField({ name: 'entries', title: 'Total Entries', type: 'number', initialValue: 1, description: 'Total entries (1 base + bonus from shares)' }),
    defineField({ name: 'referralCode', title: 'Referral Code', type: 'string' }),
    defineField({ name: 'referredBy', title: 'Referred By', type: 'string' }),
    defineField({ name: 'sharedFacebook', title: 'Shared on Facebook', type: 'boolean', initialValue: false }),
    defineField({ name: 'sharedTwitter', title: 'Shared on Twitter', type: 'boolean', initialValue: false }),
    defineField({ name: 'sharedReferral', title: 'Shared Referral', type: 'boolean', initialValue: false }),
    // Business sweepstakes entry fields
    defineField({ name: 'business', title: 'Business', type: 'reference', to: [{ type: 'business' }], description: 'For business sweepstakes' }),
    defineField({ name: 'businessTier', title: 'Business Tier at Entry', type: 'string' }),
    defineField({ name: 'ownerClerkId', title: 'Owner Clerk ID', type: 'string' }),
  ]
})
