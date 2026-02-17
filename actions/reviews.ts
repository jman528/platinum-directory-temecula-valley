'use server'

import { writeClient } from '@/lib/sanity/write-client'
import { currentUser } from '@clerk/nextjs/server'

export async function createReview(formData: FormData) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')

  const review = await writeClient.create({
    _type: 'review',
    business: { _type: 'reference', _ref: formData.get('businessId') as string },
    authorClerkId: user.id,
    authorName: `${user.firstName} ${user.lastName}`,
    authorAvatar: user.imageUrl,
    rating: Number(formData.get('rating')),
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    status: 'pending',
    publishedAt: new Date().toISOString(),
  })

  return review
}
