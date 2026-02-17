import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/write-client";
import { client } from "@/lib/sanity/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { giveawayId, fullName, email, phone, zipCode, referredBy } = body;

    if (!giveawayId || !fullName || !email || !zipCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing entry
    const existing = await client.fetch(
      `*[_type == "giveawayEntry" && giveaway._ref == $giveawayId && email == $email][0]`,
      { giveawayId, email }
    );
    if (existing) {
      return NextResponse.json({ error: "Already entered" }, { status: 409 });
    }

    const entry = await writeClient.create({
      _type: "giveawayEntry",
      giveaway: { _type: "reference", _ref: giveawayId },
      fullName,
      email,
      phone: phone || "",
      zipCode,
      entries: 1,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy: referredBy || undefined,
    });

    await writeClient.patch(giveawayId).inc({ entryCount: 1 }).commit();

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Giveaway entry error:", error);
    return NextResponse.json({ error: "Failed to enter giveaway" }, { status: 500 });
  }
}
