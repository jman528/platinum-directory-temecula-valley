export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id?: string;
  tier: "free" | "verified_platinum" | "platinum_partner" | "platinum_elite";
  is_active: boolean;
  is_featured: boolean;
  is_claimed?: boolean;
  claimed_by?: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  hours?: Record<string, { open?: string; close?: string; closed?: boolean }>;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    yelp?: string;
    google_business?: string;
  };
  amenities?: string[];
  average_rating: number;
  review_count: number;
  cover_image_url?: string;
  logo_url?: string;
  owner_user_id?: string;
  stripe_connect_id?: string;
  stripe_connect_status?: string;
  subscription_status?: string;
  outreach_status?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  category_name?: string;
  category_slug?: string;
  images?: BusinessImage[];
}

export interface BusinessImage {
  id: string;
  business_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_type: "customer" | "business_owner" | "affiliate" | "admin" | "super_admin";
  city?: string;
  state?: string;
  phone?: string;
  referral_code?: string;
  points_balance: number;
  points_pending: number;
  total_points_earned: number;
  ai_credits_balance: number;
  is_affiliate: boolean;
  affiliate_status: string;
  commission_balance_available: number;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  marketing_consent?: boolean;
  marketing_consent_at?: string;
  created_at: string;
}

export interface Offer {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  description?: string;
  terms?: string;
  redemption_instructions?: string;
  offer_type: "voucher" | "local_deal";
  original_price?: number;
  offer_price: number;
  discount_type?: string;
  discount_value?: number;
  max_claims?: number;
  max_per_customer: number;
  current_claims: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  is_featured: boolean;
  status: string;
  cover_image_url?: string;
  business_name?: string;
  business_slug?: string;
}

export interface FeatureFlag {
  id: string;
  flag_key: string;
  enabled: boolean;
  description?: string;
}

export interface Lead {
  id: string;
  business_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  status: string;
  created_at: string;
}

export interface GiveawayEntry {
  id: string;
  giveaway_type: "consumer" | "business";
  email: string;
  full_name?: string;
  phone?: string;
  referral_code?: string;
  total_entries: number;
  created_at: string;
}
