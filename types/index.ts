export interface Business {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  longDescription?: any[];
  primaryCategory?: { name: string; slug: { current: string }; icon: string };
  subcategories?: { name: string; slug: { current: string } }[];
  tags?: string[];
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  neighborhood?: string;
  geopoint?: { lat: number; lng: number };
  phone?: string;
  email?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    yelp?: string;
    googleBusiness?: string;
  };
  logo?: SanityImage;
  coverImage?: SanityImage;
  coverImageUrl?: string;
  gallery?: SanityImage[];
  videoUrl?: string;
  hours?: Record<string, { open?: string; close?: string; closed?: boolean }>;
  priceRange?: string;
  amenities?: string[];
  cuisineTypes?: string[];
  paymentMethods?: string[];
  languages?: string[];
  yearEstablished?: number;
  googleRating?: number;
  googleReviewCount?: number;
  googlePlaceId?: string;
  smartOffers?: SmartOffer[];
  tier: 'free' | 'verified_platinum' | 'platinum_partner' | 'platinum_elite';
  status: 'pending' | 'active' | 'suspended' | 'expired';
  isVerified: boolean;
  isFeatured: boolean;
  ownerClerkId?: string;
  ownerEmail?: string;
  ownerName?: string;
  claimedAt?: string;
  averageRating: number;
  reviewCount: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SmartOffer {
  title: string;
  description?: string;
  originalPrice?: number;
  offerPrice?: number;
  image?: SanityImage;
  validFrom?: string;
  validUntil?: string;
  maxRedemptions?: number;
  currentRedemptions?: number;
  isActive: boolean;
  terms?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  icon?: string;
  image?: SanityImage;
  order: number;
  isActive: boolean;
  businessCount: number;
}

export interface Review {
  _id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  photos?: SanityImage[];
  publishedAt: string;
  ownerResponse?: {
    body: string;
    respondedAt: string;
  };
}

export interface Lead {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  service?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  _createdAt: string;
}

export interface Giveaway {
  _id: string;
  title: string;
  description?: string;
  giveawayType: 'consumer' | 'business';
  prizeValue: number;
  prizeDescription: string;
  eligibility?: string;
  requiredTiers?: string[];
  startDate: string;
  endDate: string;
  drawingFrequency: string;
  image?: SanityImage;
  entryCount: number;
  sponsoringBusinesses?: { name: string; slug: { current: string }; logo?: SanityImage }[];
  rules?: any[];
  isActive: boolean;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}
