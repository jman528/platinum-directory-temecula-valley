import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const TRACKING_PARAMS = [
  "ref", "aff",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "wbraid", "gbraid", "fbclid", "ttclid", "msclkid",
  "sclid", "li_fat_id", "epik",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refresh the auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const searchParams = url.searchParams;

  // --- Capture UTM & click ID params into pd_tracking cookie ---
  const trackingData: Record<string, string> = {};
  for (const param of TRACKING_PARAMS) {
    const value = searchParams.get(param);
    if (value) trackingData[param] = value;
  }

  if (Object.keys(trackingData).length > 0) {
    supabaseResponse.cookies.set("pd_tracking", JSON.stringify(trackingData), {
      httpOnly: false, // JS needs to read this for UTM persistence
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  // --- Capture referral code (?ref=CODE) into pd_ref cookie ---
  const refCode = searchParams.get("ref");
  if (refCode) {
    supabaseResponse.cookies.set("pd_ref", refCode, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
    });
  }

  // --- Capture affiliate code (?aff=CODE) into pd_aff cookie ---
  const affCode = searchParams.get("aff");
  if (affCode) {
    supabaseResponse.cookies.set("pd_aff", affCode, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  // --- Set visitor ID cookie if not present ---
  if (!request.cookies.get("pd_visitor_id")) {
    const visitorId = crypto.randomUUID();
    supabaseResponse.cookies.set("pd_visitor_id", visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 730, // 2 years
      path: "/",
    });
  }

  // --- Protect /dashboard/* and /admin/* routes ---
  const pathname = url.pathname;
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) &&
    !user
  ) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
