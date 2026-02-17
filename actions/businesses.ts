'use server'

import { writeClient } from '@/lib/sanity/write-client'
import { client } from '@/lib/sanity/client'
import { currentUser } from '@clerk/nextjs/server'

export async function createBusiness(formData: FormData) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')

  const business = await writeClient.create({
    _type: 'business',
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string || 'Temecula',
    state: 'CA',
    zip: formData.get('zip') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    website: formData.get('website') as string,
    ownerClerkId: user.id,
    ownerEmail: user.emailAddresses[0]?.emailAddress,
    ownerName: `${user.firstName} ${user.lastName}`,
    tier: 'free',
    status: 'pending',
    isVerified: false,
    isFeatured: false,
    averageRating: 0,
    reviewCount: 0,
  })

  return business
}

export async function updateBusiness(businessId: string, data: Record<string, any>) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')

  const business = await client.fetch(
    `*[_type == "business" && _id == $id && ownerClerkId == $clerkId][0]`,
    { id: businessId, clerkId: user.id }
  )
  if (!business) throw new Error('Business not found or unauthorized')

  const updated = await writeClient.patch(businessId).set(data).commit()
  return updated
}

export async function claimBusiness(formData: FormData) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')

  const businessId = formData.get('businessId') as string
  const business = await client.fetch(
    `*[_type == "business" && _id == $id && !defined(ownerClerkId)][0]`,
    { id: businessId }
  )
  if (!business) throw new Error('Business not found or already claimed')

  const updated = await writeClient.patch(businessId).set({
    ownerClerkId: user.id,
    ownerEmail: user.emailAddresses[0]?.emailAddress,
    ownerName: formData.get('ownerName') as string || `${user.firstName} ${user.lastName}`,
    claimedAt: new Date().toISOString(),
  }).commit()

  return updated
}
