import { defineField, defineType } from 'sanity'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({ name: 'business', title: 'Business', type: 'reference', to: [{ type: 'business' }] }),
    defineField({ name: 'authorClerkId', title: 'Author Clerk ID', type: 'string' }),
    defineField({ name: 'authorName', title: 'Author Name', type: 'string' }),
    defineField({ name: 'authorAvatar', title: 'Author Avatar', type: 'url' }),
    defineField({ name: 'rating', title: 'Rating', type: 'number', validation: (Rule) => Rule.min(1).max(5) }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text' }),
    defineField({ name: 'photos', title: 'Photos', type: 'array', of: [{ type: 'image' }] }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['pending', 'approved', 'flagged', 'removed'] }, initialValue: 'pending' }),
    defineField({ name: 'ownerResponse', title: 'Owner Response', type: 'object', fields: [
      { name: 'body', title: 'Response', type: 'text' },
      { name: 'respondedAt', title: 'Responded At', type: 'datetime' },
    ]}),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
  ]
})
