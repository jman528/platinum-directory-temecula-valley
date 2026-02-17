'use server'

import { writeClient } from '@/lib/sanity/write-client'
import { client } from '@/lib/sanity/client'

export async function enterConsumerGiveaway(formData: FormData) {
  const giveawayId = formData.get('giveawayId') as string
  const email = formData.get('email') as string

  // Check for existing entry
  const existing = await client.fetch(
    `*[_type == "giveawayEntry" && giveaway._ref == $giveawayId && email == $email][0]`,
    { giveawayId, email }
  )
  if (existing) throw new Error('You have already entered this giveaway')

  const entry = await writeClient.create({
    _type: 'giveawayEntry',
    giveaway: { _type: 'reference', _ref: giveawayId },
    fullName: formData.get('fullName') as string,
    email,
    phone: formData.get('phone') as string,
    zipCode: formData.get('zipCode') as string,
    entries: 1,
    referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    referredBy: formData.get('referredBy') as string || undefined,
    sharedFacebook: false,
    sharedTwitter: false,
    sharedReferral: false,
  })

  // Increment entry count
  await writeClient.patch(giveawayId).inc({ entryCount: 1 }).commit()

  return entry
}

export async function addBonusEntries(entryId: string, bonusEntries: number, shareType: string) {
  const patch: Record<string, any> = {}
  if (shareType === 'facebook') patch.sharedFacebook = true
  if (shareType === 'twitter') patch.sharedTwitter = true
  if (shareType === 'referral') patch.sharedReferral = true

  const updated = await writeClient
    .patch(entryId)
    .set(patch)
    .inc({ entries: bonusEntries })
    .commit()

  return updated
}
