import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/write-client";
import { client } from "@/lib/sanity/client";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, ownerName } = body;

    const business = await client.fetch(
      `*[_type == "business" && _id == $id && !defined(ownerClerkId)][0]`,
      { id: businessId }
    );
    if (!business) {
      return NextResponse.json({ error: "Business not found or already claimed" }, { status: 404 });
    }

    const updated = await writeClient.patch(businessId).set({
      ownerClerkId: user.id,
      ownerEmail: user.emailAddresses[0]?.emailAddress,
      ownerName: ownerName || `${user.firstName} ${user.lastName}`,
      claimedAt: new Date().toISOString(),
    }).commit();

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to claim business" }, { status: 500 });
  }
}
