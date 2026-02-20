import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ONE-TIME USE ROUTE — Delete this file after use!
// Protected by a secret key
const SETUP_SECRET = process.env.SUPERADMIN_SETUP_SECRET;

export async function POST(req: NextRequest) {
  const { email, secret } = await req.json();

  // Verify the secret matches env var
  if (!SETUP_SECRET || secret !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Find user by email
  const { data: userData, error: userError } =
    await adminClient.auth.admin.listUsers();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const user = userData?.users?.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json(
      { error: "User not found. Make sure you have signed up first." },
      { status: 404 }
    );
  }

  // Update profile to super_admin (upsert in case profile row doesn't exist yet)
  const { error: updateError } = await adminClient
    .from("profiles")
    .upsert({
      id: user.id,
      user_type: "super_admin",
      email: email,
    });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `User ${email} is now super_admin. DELETE this API route now!`,
  });
}
