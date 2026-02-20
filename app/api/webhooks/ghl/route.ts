import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEnabled } from "@/lib/feature-flags";

const GHL_STAGE_MAP: Record<string, string> = {
  "New Lead": "not_contacted",
  "Contacted": "contacted",
  "Follow Up": "follow_up",
  "Appointment Set": "appointment_set",
  "Appointment Completed": "appointment_completed",
  "Closed Won": "closed_won",
  "Closed Lost": "closed_lost",
};

const TIER_MAP: Record<string, string> = {
  verified_platinum: "verified_platinum",
  "verified platinum": "verified_platinum",
  platinum_partner: "platinum_partner",
  "platinum partner": "platinum_partner",
  platinum_elite: "platinum_elite",
  "platinum elite": "platinum_elite",
};

export async function POST(req: NextRequest) {
  try {
    const flag = await isEnabled("ghl_integration");
    if (!flag) {
      return NextResponse.json({ skipped: true, reason: "ghl_integration flag off" });
    }

    const body = await req.json();
    const adminClient = createAdminClient();

    // Handle contact update from GHL
    if (body.contact_id || body.ghl_contact_id) {
      const ghlId = body.contact_id || body.ghl_contact_id;

      // Find business by GHL contact ID
      const { data: biz } = await adminClient
        .from("businesses")
        .select("id, outreach_status")
        .eq("ghl_contact_id", ghlId)
        .single();

      if (biz) {
        const updateData: Record<string, any> = {};

        // Map pipeline stage to outreach status
        if (body.pipeline_stage || body.stage_name) {
          const stage = body.pipeline_stage || body.stage_name;
          const mappedStatus = GHL_STAGE_MAP[stage];
          if (mappedStatus) {
            updateData.outreach_status = mappedStatus;
          }
        }

        // Map tier if provided
        if (body.plan_name) {
          const tier = TIER_MAP[body.plan_name?.toLowerCase()];
          if (tier) {
            updateData.tier = tier;
            updateData.subscription_status = body.status || "active";
            updateData.is_featured = tier === "platinum_partner" || tier === "platinum_elite";
          }
        }

        if (body.last_contacted) {
          updateData.outreach_last_contacted_at = body.last_contacted;
        }

        if (Object.keys(updateData).length > 0) {
          await adminClient
            .from("businesses")
            .update(updateData)
            .eq("id", biz.id);
        }

        // Log activity
        await adminClient.from("events").insert({
          event_type: "ghl.contact_updated",
          event_data: body,
          business_id: biz.id,
        });
      }
    } else if (body.email) {
      // Legacy: find by email
      const { data: profile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", body.email)
        .single();

      if (profile && body.plan_name) {
        const tier = TIER_MAP[body.plan_name?.toLowerCase()] || "free";
        await adminClient
          .from("businesses")
          .update({
            tier,
            is_featured: tier === "platinum_partner" || tier === "platinum_elite",
            subscription_status: body.status || "active",
          })
          .eq("owner_user_id", profile.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GHL webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
