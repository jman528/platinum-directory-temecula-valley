import { cookies } from "next/headers";

export async function getVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("pd_visitor_id");
  if (existing) return existing.value;

  const id = crypto.randomUUID();
  cookieStore.set("pd_visitor_id", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 730, // 2 years
    path: "/",
  });
  return id;
}

export function getVisitorIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/pd_visitor_id=([^;]+)/);
  return match ? match[1] : null;
}
