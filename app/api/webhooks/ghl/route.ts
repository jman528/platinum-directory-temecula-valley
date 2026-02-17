import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { writeClient } from "@/lib/sanity/write-client";

const TIER_MAP: Record<string, string> = {
  "verified_platinum": "verified_platinum",
  "verified platinum": "verified_platinum",
  "platinum_partner": "platinum_partner",
  "platinum partner": "platinum_partner",
  "platinum_elite": "platinum_elite",
  "platinum elite": "platinum_elite",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact_id, email, plan_name, status, billing_period } = body;

    const tier = TIER_MAP[plan_name?.toLowerCase()] || "free";

    // Find Clerk user by email
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ emailAddress: [email] });
    const user = users.data[0];

    if (user) {
      await clerk.users.updateUserMetadata(user.id, {
        publicMetadata: {
          tier,
          subscription_status: status || "active",
          billing_period: billing_period || "monthly",
          subscription_updated_at: new Date().toISOString(),
        },
      });
    }

    // Update Sanity business tier
    const businesses = await writeClient.fetch(
      `*[_type == "business" && ownerEmail == $email]{ _id }`,
      { email }
    );

    for (const biz of businesses) {
      await writeClient.patch(biz._id).set({
        tier,
        isVerified: tier !== "free",
        isFeatured: tier === "platinum_partner" || tier === "platinum_elite",
      }).commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GHL webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
