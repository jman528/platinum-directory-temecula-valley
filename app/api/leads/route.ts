import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, name, email, phone, message, service, source } = body;

    if (!businessId || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        business_id: businessId,
        name,
        email,
        phone: phone || "",
        message: message || (service ? `Service inquiry: ${service}` : ""),
        status: "new",
        source: source || "website",
      })
      .select()
      .single();

    if (error) {
      console.error("Lead creation error:", error);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
