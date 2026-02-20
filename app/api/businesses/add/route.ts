import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Decode HTML entities like &#8211; &amp; etc.
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&nbsp;/g, " ");
}

// Strip HTML tags
function stripHTML(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

// Format phone as (XXX) XXX-XXXX
function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Strip leading 1 for US numbers
  const d = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return raw; // Return original if not 10 digits
}

// Validate that a string looks like a street address, not a description
function looksLikeAddress(text: string): boolean {
  // An address typically starts with a number followed by a street name
  return /^\d+\s+\w/.test(text.trim()) && text.length < 200;
}

// Extract business metadata from HTML
function extractMeta(html: string) {
  const get = (pattern: RegExp) => {
    const match = html.match(pattern);
    return match?.[1]?.trim() || "";
  };

  // BUSINESS NAME — prefer og:site_name, then og:title, then <title> (first segment)
  const ogSiteName = get(
    /<meta[^>]+property="og:site_name"[^>]+content="([^"]+)"/i
  );
  const ogTitle = get(
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i
  );
  const titleTag = get(/<title[^>]*>([^<]+)<\/title>/i);
  const nameFromTitle = titleTag?.split(/[|–—-]/)[0]?.trim() || "";
  const name = (ogSiteName || ogTitle || nameFromTitle).slice(0, 100);

  // DESCRIPTION — from og:description or meta description, capped at 500 chars
  const ogDescription = get(
    /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i
  );
  const metaDescription = get(
    /<meta[^>]+name="description"[^>]+content="([^"]+)"/i
  );
  const description = (ogDescription || metaDescription).slice(0, 500);

  // PHONE — handles (951) 462-7023, 951-462-7023, 9514627023, +1 951 462 7023
  const phoneRegex =
    /(?:\+1[\s.-]?)?\(?([2-9]\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/;
  const phoneMatch = html.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // ADDRESS — try schema.org structured data first, then street pattern fallback
  const schemaAddress = get(/"streetAddress"\s*:\s*"([^"]+)"/i);
  const schemaCity = get(/"addressLocality"\s*:\s*"([^"]+)"/i);
  const schemaState = get(/"addressRegion"\s*:\s*"([^"]+)"/i);

  let address = "";
  let city = "";
  let state = "";

  if (schemaAddress) {
    address = schemaAddress;
    city = schemaCity;
    state = schemaState;
  } else {
    // Fallback: regex for common street address patterns
    const addressMatch = html.match(
      /(\d+\s+[\w\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Ln|Ct|Pkwy|Hwy)[.,]?\s*(?:Suite|Ste|#)?\s*\d*)/i
    );
    address = addressMatch?.[1]?.trim() || "";
  }

  // Sanitize all fields
  const cleanName = decodeHTMLEntities(stripHTML(name));
  const cleanDescription = decodeHTMLEntities(stripHTML(description));
  const cleanPhone = phone ? formatPhoneNumber(phone) : "";
  const cleanAddress = address && looksLikeAddress(address) ? decodeHTMLEntities(address) : "";

  return {
    name: cleanName,
    description: cleanDescription,
    phone: cleanPhone,
    address: cleanAddress,
    city: city ? decodeHTMLEntities(city) : "",
    state: state || "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();

    // ─── Scrape URL ──────────────────────────────────────
    if (body.action === "scrape") {
      const { url } = body;
      if (!url) {
        return NextResponse.json({ error: "URL required" }, { status: 400 });
      }

      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; PlatinumDirectory/1.0)",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          return NextResponse.json(
            { error: "Could not reach that website" },
            { status: 400 }
          );
        }

        const html = await res.text();
        const meta = extractMeta(html);

        return NextResponse.json({
          name: meta.name,
          description: meta.description,
          phone: meta.phone,
          address: meta.address,
          city: meta.city || "Temecula",
          website: url.replace(/\/$/, ""),
        });
      } catch {
        return NextResponse.json(
          { error: "Could not fetch that URL. Check the address and try again." },
          { status: 400 }
        );
      }
    }

    // ─── Create Business ─────────────────────────────────
    if (body.action === "create") {
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { name, category, address, city, state, zip_code, phone, website, description } = body;

      if (!name?.trim()) {
        return NextResponse.json({ error: "Business name is required" }, { status: 400 });
      }

      const admin = createAdminClient();
      const slug = slugify(name) + "-" + Date.now().toString(36);

      // Resolve category_id from slug
      let category_id = null;
      if (category) {
        const { data: cat } = await admin
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();
        category_id = cat?.id || null;
      }

      const { data: business, error: insertError } = await admin
        .from("businesses")
        .insert({
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          category_id,
          address: address?.trim() || null,
          city: city?.trim() || "Temecula",
          state: state?.trim() || "CA",
          zip_code: zip_code?.trim() || null,
          phone: phone?.trim() || null,
          website: website?.trim() || null,
          tier: "free",
          is_active: false,
          is_featured: false,
          is_claimed: true,
          claimed_by: user.id,
          owner_user_id: user.id,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          average_rating: 0,
          review_count: 0,
          outreach_status: "not_contacted",
        })
        .select("id, slug")
        .single();

      if (insertError) {
        console.error("Business insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Ensure owner_user_id is set (guard against RLS/triggers stripping it)
      if (user?.id && business?.id) {
        await admin
          .from("businesses")
          .update({ owner_user_id: user.id })
          .eq("id", business.id);
      }

      // Update user profile to business_owner
      await admin
        .from("profiles")
        .update({ user_type: "business_owner" })
        .eq("id", user.id)
        .eq("user_type", "customer");

      return NextResponse.json({ success: true, business });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Business add error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
