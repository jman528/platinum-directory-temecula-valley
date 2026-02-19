import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Users, Eye, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Fetch profile and user's businesses
  const [{ data: profile }, { data: businesses }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("businesses")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const bizList = (businesses as any[]) || [];
  const displayName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Dashboard Overview</h1>
      <p className="mt-1 text-gray-400">Welcome back, {displayName}!</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-blue/20 p-2"><Eye className="h-5 w-5 text-pd-blue" /></div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-gray-400">Profile Views</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2"><Users className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-gray-400">Leads This Month</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-purple/20 p-2"><BarChart3 className="h-5 w-5 text-pd-purple" /></div>
            <div>
              <p className="text-2xl font-bold text-white">0%</p>
              <p className="text-xs text-gray-400">Response Rate</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-gold/20 p-2"><DollarSign className="h-5 w-5 text-pd-gold" /></div>
            <div>
              <p className="text-2xl font-bold text-white">$0</p>
              <p className="text-xs text-gray-400">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white">My Listings</h2>
        {bizList.length === 0 ? (
          <div className="mt-4 glass-card p-8 text-center">
            <p className="text-gray-400">You haven&apos;t claimed any businesses yet.</p>
            <a href="/claim-business" className="mt-4 inline-block rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
              Claim Your Business
            </a>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bizList.map((biz: any) => (
              <div key={biz.id} className="glass-card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">{biz.name}</p>
                  <p className="text-sm text-gray-400">{biz.city}, {biz.state} &middot; {biz.tier?.replace(/_/g, " ")}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${biz.is_active ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {biz.is_active ? "active" : "inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
