import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/write-client";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, rating, title, body: reviewBody } = body;

    if (!businessId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await writeClient.create({
      _type: "review",
      business: { _type: "reference", _ref: businessId },
      authorClerkId: user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorAvatar: user.imageUrl,
      rating: Number(rating),
      title: title || "",
      body: reviewBody || "",
      status: "pending",
      publishedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
