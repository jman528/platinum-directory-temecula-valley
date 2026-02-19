import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Store,
  Users,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  UserPlus,
  Coins,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
    redirect("/dashboard");
  }

  const [
    { count: totalBusinesses },
    { count: activeBusinesses },
    { count: claimedBusinesses },
    { count: unclaimedBusinesses },
    { count: totalUsers },
    { count: businessOwners },
    { count: customers },
    { count: totalLeads },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("is_claimed", true),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .or("is_claimed.is.null,is_claimed.eq.false"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "business_owner"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "customer"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true }),
  ]);

  // Recent activity
  const { data: recentClaims } = await supabase
    .from("businesses")
    .select("id, name, claimed_by, created_at")
    .eq("is_claimed", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name, user_type, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const stats = [
    {
      label: "Total Businesses",
      value: totalBusinesses || 0,
      icon: Store,
      color: "text-pd-blue",
    },
    {
      label: "Active Listings",
      value: activeBusinesses || 0,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      label: "Claimed",
      value: claimedBusinesses || 0,
      icon: Shield,
      color: "text-pd-gold",
    },
    {
      label: "Unclaimed",
      value: unclaimedBusinesses || 0,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      label: "Total Users",
      value: totalUsers || 0,
      icon: Users,
      color: "text-pd-purple-light",
    },
    {
      label: "Business Owners",
      value: businessOwners || 0,
      icon: UserPlus,
      color: "text-blue-400",
    },
    {
      label: "Customers",
      value: customers || 0,
      icon: Users,
      color: "text-green-400",
    },
    {
      label: "Total Leads",
      value: totalLeads || 0,
      icon: DollarSign,
      color: "text-pd-gold",
    },
  ];

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">
        Platform Overview
      </h2>
      <p className="mt-1 text-gray-400">
        Key metrics across your directory platform.
      </p>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Claims */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            Recent Claims
          </h3>
          <div className="mt-4 space-y-3">
            {(recentClaims || []).length === 0 ? (
              <p className="text-sm text-gray-500">No claims yet.</p>
            ) : (
              (recentClaims || []).map((biz: any) => (
                <div
                  key={biz.id}
                  className="flex items-center justify-between border-b border-pd-purple/10 pb-2"
                >
                  <div>
                    <p className="text-sm text-white">{biz.name}</p>
                    <p className="text-xs text-gray-500">
                      by {biz.claimed_by || "Unknown"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(biz.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            Recent Signups
          </h3>
          <div className="mt-4 space-y-3">
            {(recentUsers || []).length === 0 ? (
              <p className="text-sm text-gray-500">No users yet.</p>
            ) : (
              (recentUsers || []).map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-b border-pd-purple/10 pb-2"
                >
                  <div>
                    <p className="text-sm text-white">
                      {u.full_name || u.email}
                    </p>
                    <p className="text-xs text-gray-500">{u.user_type}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
