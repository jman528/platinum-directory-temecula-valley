import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/write-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "user.created") {
      // No-op for now — user data managed through Clerk
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
