import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, full_name, points_balance")
    .eq("id", user.id)
    .single();

  // Get the tier from the user's business (if they own one)
  const { data: biz } = await supabase
    .from("businesses")
    .select("tier")
    .eq("owner_user_id", user.id)
    .limit(1)
    .single();

  const tier = biz?.tier || "free";
  const userType = profile?.user_type || "customer";

  return (
    <div className="flex min-h-screen bg-pd-dark">
      <DashboardSidebar
        tier={tier}
        userType={userType}
        userName={profile?.full_name || undefined}
        userEmail={user.email || undefined}
        pointsBalance={profile?.points_balance ?? 0}
      />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
