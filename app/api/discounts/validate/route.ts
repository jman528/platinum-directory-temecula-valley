import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, applies_to, user_id, tier } = body;

  if (!code) {
    return NextResponse.json({ valid: false, reason: "No code provided" });
  }

  const adminClient = createAdminClient();

  // 1. Find code
  const { data: discount } = await adminClient
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!discount) {
    return NextResponse.json({ valid: false, reason: "Invalid or inactive code" });
  }

  // 2. Check expiry
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, reason: "This code has expired" });
  }

  // 3. Check start date
  if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
    return NextResponse.json({ valid: false, reason: "This code is not yet active" });
  }

  // 4. Check max uses
  if (discount.max_uses && discount.current_uses >= discount.max_uses) {
    return NextResponse.json({ valid: false, reason: "This code has reached its usage limit" });
  }

  // 5. Check per-user limit
  if (user_id && discount.max_uses_per_user) {
    const { count } = await adminClient
      .from("discount_code_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("discount_code_id", discount.id)
      .eq("user_id", user_id);

    if ((count || 0) >= discount.max_uses_per_user) {
      return NextResponse.json({ valid: false, reason: "You have already used this code" });
    }
  }

  // 6. Check applies_to
  if (applies_to && discount.applies_to !== "any" && discount.applies_to !== applies_to) {
    return NextResponse.json({ valid: false, reason: `This code applies to ${discount.applies_to} only` });
  }

  // 7. Check min_tier
  if (discount.min_tier && tier) {
    const tierOrder = ["free", "verified_platinum", "platinum_partner", "platinum_elite"];
    if (tierOrder.indexOf(tier) < tierOrder.indexOf(discount.min_tier)) {
      return NextResponse.json({
        valid: false,
        reason: `This code requires ${discount.min_tier.replace(/_/g, " ")} tier or higher`,
      });
    }
  }

  return NextResponse.json({
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      applies_to: discount.applies_to,
      description: discount.description,
    },
  });
}
