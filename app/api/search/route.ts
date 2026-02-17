import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { BUSINESS_SEARCH_QUERY } from "@/lib/sanity/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const page = Number(searchParams.get("page")) || 1;
  const perPage = 12;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  const businesses = await client.fetch(BUSINESS_SEARCH_QUERY, {
    query, category, city, start, end,
  } as Record<string, unknown>);

  return NextResponse.json({ businesses, page, perPage });
}
