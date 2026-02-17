import { defineField, defineType } from 'sanity'

export const subcategory = defineType({
  name: 'subcategory',
  title: 'Subcategory',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } }),
    defineField({ name: 'parentCategory', title: 'Parent Category', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'order', title: 'Display Order', type: 'number' }),
  ]
})
