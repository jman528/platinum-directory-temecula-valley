import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/write-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, email, phone, message, service, source } = body;

    if (!businessId || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lead = await writeClient.create({
      _type: "lead",
      business: { _type: "reference", _ref: businessId },
      customerName: name,
      customerEmail: email,
      customerPhone: phone || "",
      message: message || "",
      service: service || "",
      status: "new",
      source: source || "directory_listing",
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
