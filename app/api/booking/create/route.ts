import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, business_name, preferred_time, notes } = await req.json();

    if (!name || !email || !preferred_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Log the booking request
    await adminClient.from("events").insert({
      event_type: "booking.created",
      event_data: {
        name,
        email,
        phone,
        business_name,
        preferred_time,
        notes,
      },
    });

    // If business exists, update outreach status
    if (business_name) {
      const { data: biz } = await adminClient
        .from("businesses")
        .select("id")
        .ilike("name", `%${business_name}%`)
        .limit(1)
        .single();

      if (biz) {
        await adminClient
          .from("businesses")
          .update({
            outreach_status: "appointment_set",
            outreach_last_contacted_at: new Date().toISOString(),
          })
          .eq("id", biz.id);
      }
    }

    // Send confirmation email
    sendEmail("business-welcome", email, {
      business_name: business_name || "Your Business",
      slug: "",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      booking: {
        name,
        email,
        preferred_time,
        business_name,
      },
    });
  } catch (err) {
    console.error("Booking creation error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
