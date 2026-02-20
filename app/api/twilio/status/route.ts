import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const to = formData.get("To") as string;
    const duration = formData.get("CallDuration") as string;

    const adminClient = createAdminClient();

    await adminClient.from("events").insert({
      event_type: `twilio.call.${callStatus}`,
      event_data: {
        call_sid: callSid,
        status: callStatus,
        to,
        duration: duration ? parseInt(duration) : null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Twilio status callback error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
