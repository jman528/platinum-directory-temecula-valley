import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const to = formData.get("To") as string;

  const response = new twilio.twiml.VoiceResponse();

  if (to) {
    const dial = response.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER!,
      record: "record-from-answer-dual",
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/recording`,
    });
    dial.number(to);
  } else {
    response.say("No phone number provided.");
  }

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
