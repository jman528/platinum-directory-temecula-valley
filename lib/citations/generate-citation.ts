// lib/citations/generate-citation.ts
// Generates NAP (Name, Address, Phone) data for citation submissions

import { BASE_URL } from "@/lib/syndication-config";

interface CitationData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  description: string;
  categories: string[];
}

export function generateCitationData(business: {
  name: string;
  address?: string;
  city?: string;
  zip_code?: string;
  phone?: string;
  website?: string;
  description?: string;
  category?: string;
  slug: string;
}): CitationData {
  const pdMention = `Featured on Platinum Directory Temecula Valley — discover Smart Offers and exclusive deals at ${BASE_URL}/business/${business.slug}`;

  return {
    name: business.name,
    address: business.address || "",
    city: business.city || "Temecula",
    state: "CA",
    zip: business.zip_code || "",
    phone: business.phone || "",
    website: business.website || "", // Their own website — NOT PD
    description: business.description
      ? `${business.description} ${pdMention}`
      : pdMention,
    categories: business.category ? [business.category] : ["Local Business"],
  };
}

export function generatePDCitation(): CitationData {
  return {
    name: "Platinum Directory Temecula Valley",
    address: "",
    city: "Temecula",
    state: "CA",
    zip: "92591",
    phone: "",
    website: BASE_URL,
    description:
      "Temecula Valley's premier local business directory and deals marketplace. Discover the best wineries, restaurants, and experiences across 11 cities in Southern California's wine country. Smart Offers, weekly giveaways, and exclusive deals.",
    categories: ["Business Directory", "Internet Marketing Service"],
  };
}

export function citationToCSVRow(data: CitationData): string {
  const escape = (s: string) => {
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [
    data.name,
    data.address,
    data.city,
    data.state,
    data.zip,
    data.phone,
    data.website,
    data.description,
    data.categories.join("; "),
  ]
    .map(escape)
    .join(",");
}

export const CITATION_CSV_HEADER =
  "Business Name,Address,City,State,ZIP,Phone,Website,Description,Category";
