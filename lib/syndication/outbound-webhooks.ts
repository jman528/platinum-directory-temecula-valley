// lib/syndication/outbound-webhooks.ts
// Fire webhooks to external services (n8n, Zapier) when events happen

import { createAdminClient } from "@/lib/supabase/admin";

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function fireOutboundWebhook(
  event: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Fire to n8n system webhook
  if (N8N_BASE_URL) {
    try {
      const res = await fetch(`${N8N_BASE_URL}/webhook/pd-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(`n8n webhook failed: ${res.status}`);
      }
    } catch (err) {
      console.error("n8n webhook error:", err);
    }
  }

  // Fire to business-configured webhooks (Partner+ tier)
  if (data.businessId) {
    try {
      const adminClient = createAdminClient();
      const { data: biz } = await adminClient
        .from("businesses")
        .select("webhook_url, tier")
        .eq("id", data.businessId)
        .single();

      if (biz?.webhook_url && biz.tier !== "free") {
        await fetch(biz.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // business webhook failure shouldn't break flow
    }
  }

  return { success: true };
}

// Pre-defined event helpers
export async function onBusinessVerified(businessId: string, businessData: Record<string, unknown>) {
  return fireOutboundWebhook("business.verified", { businessId, ...businessData });
}

export async function onOfferPublished(offerId: string, offerData: Record<string, unknown>) {
  return fireOutboundWebhook("offer.published", { offerId, ...offerData });
}

export async function onOfferPurchased(offerId: string, purchaseData: Record<string, unknown>) {
  return fireOutboundWebhook("offer.purchased", { offerId, ...purchaseData });
}

export async function onGiveawayEntered(giveawayId: string, entryData: Record<string, unknown>) {
  return fireOutboundWebhook("giveaway.entered", { giveawayId, ...entryData });
}
