import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processReferralSignup, generateUserRefCode } from "@/lib/tracking/attribution";
import { POINTS_CONFIG } from "@/lib/points-config";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Post-signup: generate referral code + welcome bonus + process referral
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const adminClient = createAdminClient();

          // Check if user already has a referral code
          const { data: profile } = await adminClient
            .from("profiles")
            .select("referral_code, points_balance, onboarding_steps")
            .eq("id", user.id)
            .single();

          if (profile && !profile.referral_code) {
            // Generate referral code
            const refCode = generateUserRefCode();
            await adminClient
              .from("profiles")
              .update({
                referral_code: refCode,
                onboarding_steps: { account_created: true },
              })
              .eq("id", user.id);

            // Award signup bonus
            await adminClient.from("points_ledger").insert({
              user_id: user.id,
              points: POINTS_CONFIG.SIGNUP_BONUS,
              action: "signup_bonus",
            });

            await adminClient
              .from("profiles")
              .update({
                points_balance: (profile.points_balance || 0) + POINTS_CONFIG.SIGNUP_BONUS,
                total_points_earned: POINTS_CONFIG.SIGNUP_BONUS,
              })
              .eq("id", user.id);
          }

          // Process referral if pd_ref cookie exists
          const cookieStore = await cookies();
          const refCookie = cookieStore.get("pd_ref");
          const affCookie = cookieStore.get("pd_aff");

          if (refCookie?.value) {
            // Parse tracking params from pd_tracking cookie
            let trackingMeta: any = {};
            const trackingCookie = cookieStore.get("pd_tracking");
            if (trackingCookie?.value) {
              try { trackingMeta = JSON.parse(trackingCookie.value); } catch {}
            }

            await processReferralSignup(refCookie.value, user.id, trackingMeta);
          }

          // Store affiliate code if present
          if (affCookie?.value) {
            await adminClient
              .from("profiles")
              .update({ referred_by_affiliate: affCookie.value })
              .eq("id", user.id);
          }
        }
      } catch (err) {
        console.error("Post-signup processing error:", err);
        // Don't block the redirect on processing errors
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
}
