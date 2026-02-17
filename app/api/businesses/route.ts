import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { writeClient } from "@/lib/sanity/write-client";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";

  let filter = `*[_type == "business" && status == "active"`;
  if (city) filter += ` && city == "${city}"`;
  if (category) filter += ` && primaryCategory->slug.current == "${category}"`;
  filter += `] | order(tier desc, averageRating desc) [0...20] { _id, name, slug, city, tier, averageRating }`;

  const businesses = await client.fetch(filter);
  return NextResponse.json({ businesses });
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const business = await writeClient.create({
      _type: "business",
      ...body,
      ownerClerkId: user.id,
      ownerEmail: user.emailAddresses[0]?.emailAddress,
      tier: "free",
      status: "pending",
      isVerified: false,
      isFeatured: false,
      averageRating: 0,
      reviewCount: 0,
    });

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error("Business creation error:", error);
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
  }
}
