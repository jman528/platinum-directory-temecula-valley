import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Store, Users, AlertTriangle, DollarSign, Clock, Shield } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
    redirect("/dashboard");
  }

  // Fetch platform stats in parallel
  const [
    { count: totalBusinesses },
    { count: activeBusinesses },
    { count: pendingBusinesses },
    { count: totalLeads },
    { count: pendingReviews },
    { count: totalGiveawayEntries },
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("giveaway_entries").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-1 text-gray-400">Platform overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-pd-blue" />
            <div>
              <p className="text-2xl font-bold text-white">{activeBusinesses || 0}</p>
              <p className="text-xs text-gray-400">Active Businesses</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{pendingBusinesses || 0}</p>
              <p className="text-xs text-gray-400">Pending Listings</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{totalLeads || 0}</p>
              <p className="text-xs text-gray-400">Total Leads</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{pendingReviews || 0}</p>
              <p className="text-xs text-gray-400">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-pd-gold" />
            <div>
              <p className="text-2xl font-bold text-white">{totalBusinesses || 0}</p>
              <p className="text-xs text-gray-400">Total Businesses</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-pd-purple" />
            <div>
              <p className="text-2xl font-bold text-white">{totalGiveawayEntries || 0}</p>
              <p className="text-xs text-gray-400">Giveaway Entries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
