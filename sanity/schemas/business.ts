import { defineField, defineType } from 'sanity'

export const business = defineType({
  name: 'business',
  title: 'Business',
  type: 'document',
  fields: [
    // CORE IDENTITY
    defineField({ name: 'name', title: 'Business Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'URL Slug', type: 'slug', options: { source: 'name', maxLength: 96 } }),
    defineField({ name: 'description', title: 'Short Description', type: 'text', rows: 3 }),
    defineField({ name: 'longDescription', title: 'Full Description', type: 'blockContent' }),

    // CATEGORIZATION
    defineField({ name: 'primaryCategory', title: 'Primary Category', type: 'reference', to: [{ type: 'category' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'subcategories', title: 'Subcategories', type: 'array', of: [{ type: 'reference', to: [{ type: 'subcategory' }] }] }),
    defineField({ name: 'tags', title: 'Tags / Keywords', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),

    // LOCATION & CONTACT
    defineField({ name: 'address', title: 'Street Address', type: 'string' }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'state', title: 'State', type: 'string', initialValue: 'CA' }),
    defineField({ name: 'zip', title: 'ZIP Code', type: 'string' }),
    defineField({ name: 'neighborhood', title: 'Neighborhood / Area', type: 'string', description: 'e.g., Old Town, Wine Country, Redhawk, Promenade Mall' }),
    defineField({ name: 'geopoint', title: 'Map Location', type: 'geopoint' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'website', title: 'Website', type: 'url' }),

    // SOCIAL MEDIA
    defineField({
      name: 'socialLinks', title: 'Social Media', type: 'object',
      fields: [
        { name: 'facebook', title: 'Facebook', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'twitter', title: 'X / Twitter', type: 'url' },
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'youtube', title: 'YouTube', type: 'url' },
        { name: 'tiktok', title: 'TikTok', type: 'url' },
        { name: 'yelp', title: 'Yelp', type: 'url' },
        { name: 'googleBusiness', title: 'Google Business URL', type: 'url' },
      ]
    }),

    // MEDIA
    defineField({ name: 'logo', title: 'Business Logo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'coverImageUrl', title: 'Cover Image URL (Placeholder)', type: 'url', description: 'External image URL used as a placeholder until a Sanity image asset is uploaded' }),
    defineField({ name: 'gallery', title: 'Photo Gallery', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'videoUrl', title: 'Video URL', type: 'url' }),

    // HOURS
    defineField({
      name: 'hours', title: 'Business Hours', type: 'object',
      fields: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => ({
        name: day, title: day.charAt(0).toUpperCase() + day.slice(1), type: 'object',
        fields: [
          { name: 'open', title: 'Open', type: 'string', description: 'e.g., 9:00 AM' },
          { name: 'close', title: 'Close', type: 'string', description: 'e.g., 5:00 PM' },
          { name: 'closed', title: 'Closed', type: 'boolean', initialValue: false },
        ]
      }))
    }),

    // SEARCH & FILTER ATTRIBUTES
    defineField({
      name: 'priceRange', title: 'Price Range', type: 'string',
      options: { list: [
        { title: '$', value: '$' },
        { title: '$$', value: '$$' },
        { title: '$$$', value: '$$$' },
        { title: '$$$$', value: '$$$$' },
      ]}
    }),
    defineField({
      name: 'amenities', title: 'Amenities', type: 'array', of: [{ type: 'string' }],
      options: { list: [
        'WiFi', 'Parking', 'Wheelchair Accessible', 'Outdoor Seating',
        'Pet Friendly', 'Delivery', 'Takeout', 'Reservations',
        'Live Music', 'Happy Hour', 'Private Events', 'Kids Friendly',
        'Wine Tasting', 'Tours Available', 'Gift Shop', 'Catering',
        'Drive Through', 'Curbside Pickup', 'Online Ordering',
        'Military Discount', 'Senior Discount', 'Student Discount',
        'First Responder Discount'
      ].map(a => ({ title: a, value: a })) }
    }),
    defineField({
      name: 'cuisineTypes', title: 'Cuisine Types', type: 'array', of: [{ type: 'string' }],
      description: 'For restaurants only',
      options: { list: [
        'Italian', 'Mexican', 'Japanese', 'American', 'Chinese',
        'Indian', 'Vegan', 'Seafood', 'Steakhouse', 'Mediterranean',
        'Thai', 'Korean', 'Vietnamese', 'French', 'BBQ', 'Pizza',
        'Sushi', 'Brunch', 'Farm-to-Table'
      ].map(c => ({ title: c, value: c })) }
    }),
    defineField({
      name: 'paymentMethods', title: 'Payment Methods', type: 'array', of: [{ type: 'string' }],
      options: { list: ['Cash', 'Credit Card', 'Debit Card', 'Apple Pay', 'Google Pay', 'Venmo', 'PayPal'].map(p => ({ title: p, value: p })) }
    }),
    defineField({
      name: 'languages', title: 'Languages Spoken', type: 'array', of: [{ type: 'string' }],
      options: { list: ['English', 'Spanish', 'French', 'Mandarin', 'Korean', 'Japanese', 'Vietnamese', 'Tagalog', 'Other'].map(l => ({ title: l, value: l })) }
    }),
    defineField({ name: 'yearEstablished', title: 'Year Established', type: 'number' }),

    // GOOGLE DATA (imported)
    defineField({ name: 'googleRating', title: 'Google Rating', type: 'number' }),
    defineField({ name: 'googleReviewCount', title: 'Google Review Count', type: 'number' }),
    defineField({ name: 'googlePlaceId', title: 'Google Place ID', type: 'string' }),

    // SMART OFFERS
    defineField({
      name: 'smartOffers', title: 'Smart Offers', type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Offer Title', type: 'string' },
          { name: 'description', title: 'Description', type: 'text' },
          { name: 'originalPrice', title: 'Original Price ($)', type: 'number' },
          { name: 'offerPrice', title: 'Offer Price ($)', type: 'number' },
          { name: 'image', title: 'Offer Image', type: 'image' },
          { name: 'validFrom', title: 'Valid From', type: 'datetime' },
          { name: 'validUntil', title: 'Valid Until', type: 'datetime' },
          { name: 'maxRedemptions', title: 'Max Redemptions', type: 'number' },
          { name: 'currentRedemptions', title: 'Current Redemptions', type: 'number', initialValue: 0 },
          { name: 'isActive', title: 'Active', type: 'boolean', initialValue: true },
          { name: 'terms', title: 'Terms & Conditions', type: 'text' },
        ]
      }]
    }),

    // TIER & STATUS
    defineField({
      name: 'tier', title: 'Subscription Tier', type: 'string',
      options: { list: [
        { title: 'Free', value: 'free' },
        { title: 'Verified Platinum', value: 'verified_platinum' },
        { title: 'Platinum Partner', value: 'platinum_partner' },
        { title: 'Platinum Elite', value: 'platinum_elite' },
      ]},
      initialValue: 'free'
    }),
    defineField({
      name: 'status', title: 'Listing Status', type: 'string',
      options: { list: [
        { title: 'Pending', value: 'pending' },
        { title: 'Active', value: 'active' },
        { title: 'Suspended', value: 'suspended' },
        { title: 'Expired', value: 'expired' },
      ]},
      initialValue: 'pending'
    }),
    defineField({ name: 'isFeatured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'isVerified', title: 'Verified', type: 'boolean', initialValue: false }),

    // OWNERSHIP
    defineField({ name: 'ownerClerkId', title: 'Owner Clerk ID', type: 'string' }),
    defineField({ name: 'ownerEmail', title: 'Owner Email', type: 'string' }),
    defineField({ name: 'ownerName', title: 'Owner Name', type: 'string' }),
    defineField({ name: 'claimedAt', title: 'Claimed Date', type: 'datetime' }),

    // RATINGS (platform)
    defineField({ name: 'averageRating', title: 'Average Rating', type: 'number', initialValue: 0 }),
    defineField({ name: 'reviewCount', title: 'Review Count', type: 'number', initialValue: 0 }),

    // SEO
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'city', media: 'logo' }
  }
})
