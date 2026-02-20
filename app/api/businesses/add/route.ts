import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import * as postmark from "postmark";

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

// Validate that a string looks like a real street address, not marketing text
function looksLikeAddress(text: string): boolean {
  const trimmed = text.trim();
  // Must start with a street number
  if (!/^\d+\s+\w/.test(trimmed)) return false;
  // Must be reasonable length (real addresses are short)
  if (trimmed.length > 120) return false;
  // Must contain a street suffix
  const streetSuffixes = /\b(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|way|ln|lane|ct|court|pkwy|parkway|hwy|highway|cir|circle|pl|place|ter|terrace|trl|trail|loop|sq|square)\b/i;
  if (!streetSuffixes.test(trimmed)) return false;
  // Reject if it contains marketing/business language
  const marketingWords = /\b(million|billion|advertising|strategy|marketing|revenue|customers|clients|online|digital|campaign|solution|platform|services|experience|professional|business|industry|leading|premier)\b/i;
  if (marketingWords.test(trimmed)) return false;
  return true;
}

// Validate that a string looks like a phone number
function looksLikePhone(text: string): boolean {
  const digits = text.replace(/\D/g, "");
  const d = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return d.length === 10 && /^[2-9]/.test(d);
}

// Strip tagline from business name — split on separators like |, –, —, :, or " - "
function stripTagline(text: string): string {
  // Split on: pipe, en-dash, em-dash, colon, or spaced hyphen (" - ")
  return text.split(/\s*[|–—:]\s*|\s+-\s+/)[0]?.trim() || text;
}

// Extract business metadata from HTML
function extractMeta(html: string) {
  const get = (pattern: RegExp) => {
    const match = html.match(pattern);
    return match?.[1]?.trim() || "";
  };

  // Also support reversed attribute order: content="..." property="..."
  const getMeta = (prop: string, attr: string = "property") => {
    return get(new RegExp(`<meta[^>]+${attr}="${prop}"[^>]+content="([^"]+)"`, "i"))
      || get(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+${attr}="${prop}"`, "i"));
  };

  // BUSINESS NAME — prefer og:site_name, then og:title, then <title>
  // Strip taglines from ALL sources
  const ogSiteName = stripTagline(getMeta("og:site_name"));
  const ogTitle = stripTagline(getMeta("og:title"));
  const titleTag = get(/<title[^>]*>([^<]+)<\/title>/i);
  const nameFromTitle = stripTagline(titleTag);
  const name = (ogSiteName || ogTitle || nameFromTitle).slice(0, 100);

  // DESCRIPTION — from og:description or meta description, capped at 500 chars
  const ogDescription = getMeta("og:description");
  const metaDescription = getMeta("description", "name");
  const description = (ogDescription || metaDescription).slice(0, 500);

  // PHONE — prefer tel: links (most reliable), then general regex
  const telLinkMatch = html.match(/href="tel:([^"]+)"/i);
  let phone = "";
  if (telLinkMatch) {
    phone = telLinkMatch[1].replace(/\s/g, "");
  }
  if (!phone || !looksLikePhone(phone)) {
    // Fallback: regex for phone patterns
    const phoneRegex =
      /(?:\+1[\s.-]?)?\(?([2-9]\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/;
    const phoneMatch = html.match(phoneRegex);
    phone = phoneMatch ? phoneMatch[0] : "";
  }

  // ADDRESS — try schema.org structured data first
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
    // Try <address> HTML tag content
    const addressTagMatch = html.match(/<address[^>]*>([\s\S]*?)<\/address>/i);
    if (addressTagMatch) {
      const addrText = stripHTML(addressTagMatch[1]).replace(/\s+/g, " ").trim();
      const streetMatch = addrText.match(
        /(\d+\s+[\w\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Way|Ln|Lane|Ct|Court|Pkwy|Parkway|Hwy|Highway)[.,]?\s*(?:Suite|Ste|#)?\s*\d*)/i
      );
      if (streetMatch) address = streetMatch[1].trim();
    }

    // Fallback: regex for common street address patterns in body
    if (!address) {
      const addressMatch = html.match(
        /(\d+\s+[\w\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Way|Ln|Lane|Ct|Court|Pkwy|Parkway|Hwy|Highway)[.,]?\s*(?:Suite|Ste|#)?\s*\d*)/i
      );
      address = addressMatch?.[1]?.trim() || "";
    }
  }

  // Sanitize all fields
  const cleanName = decodeHTMLEntities(stripHTML(name));
  const cleanDescription = decodeHTMLEntities(stripHTML(description));
  const cleanPhone = phone && looksLikePhone(phone) ? formatPhoneNumber(phone) : "";
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

      // Add claimer as owner in business_members
      if (business?.id) {
        await admin
          .from("business_members")
          .upsert({
            business_id: business.id,
            profile_id: user.id,
            role: "owner",
            status: "active",
            accepted_at: new Date().toISOString(),
          }, { onConflict: "business_id,profile_id" });
      }

      // Update user profile to business_owner
      await admin
        .from("profiles")
        .update({ user_type: "business_owner" })
        .eq("id", user.id)
        .eq("user_type", "customer");

      // Send Postmark email notifications (fire-and-forget, don't block response)
      if (process.env.POSTMARK_SERVER_TOKEN) {
        const pmClient = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://platinumdirectorytemeculavalley.com";
        const submittedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

        // Email to submitting user
        pmClient.sendEmail({
          From: "noreply@platinumdirectorytemeculavalley.com",
          To: user.email || "",
          Subject: "Your business has been submitted to Platinum Directory",
          HtmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #1a1a2e;">Your Business Has Been Submitted!</h2>
              <p>Thank you for submitting <strong>${name.trim()}</strong> to Platinum Directory Temecula Valley.</p>
              <p><strong>Submitted:</strong> ${submittedDate}</p>
              <p>Our team will review your listing within <strong>24-48 hours</strong>. Once approved, your business will be live in the directory.</p>
              <p><a href="${siteUrl}/dashboard" style="display: inline-block; background: #C9A84C; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Your Dashboard</a></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="font-size: 12px; color: #888;">Platinum Directory Temecula Valley</p>
            </div>
          `,
          TextBody: `Your business "${name.trim()}" has been submitted to Platinum Directory. Submitted: ${submittedDate}. We'll review within 24-48 hours. View your dashboard: ${siteUrl}/dashboard`,
        }).catch((err: any) => console.error("Postmark user email error:", err));

        // Email to admin
        pmClient.sendEmail({
          From: "noreply@platinumdirectorytemeculavalley.com",
          To: "jesse@platinumdirectorytemeculavalley.com",
          Subject: `New business submission: ${name.trim()}`,
          HtmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #1a1a2e;">New Business Submission</h2>
              <p><strong>Business:</strong> ${name.trim()}</p>
              <p><strong>Submitted by:</strong> ${user.email}</p>
              <p><strong>Date:</strong> ${submittedDate}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
              ${website ? `<p><strong>Website:</strong> ${website}</p>` : ""}
              <p><a href="${siteUrl}/admin/moderation" style="display: inline-block; background: #C9A84C; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review in Moderation Queue</a></p>
            </div>
          `,
          TextBody: `New business submission: ${name.trim()}. Submitted by: ${user.email}. Review at: ${siteUrl}/admin/moderation`,
        }).catch((err: any) => console.error("Postmark admin email error:", err));
      }

      return NextResponse.json({ success: true, business });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Business add error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
