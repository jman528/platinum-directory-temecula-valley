import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const recordingSid = formData.get("RecordingSid") as string;
    const recordingUrl = formData.get("RecordingUrl") as string;
    const callSid = formData.get("CallSid") as string;
    const duration = formData.get("RecordingDuration") as string;

    const adminClient = createAdminClient();

    await adminClient.from("events").insert({
      event_type: "twilio.recording.completed",
      event_data: {
        recording_sid: recordingSid,
        recording_url: recordingUrl,
        call_sid: callSid,
        duration: duration ? parseInt(duration) : null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Twilio recording callback error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
