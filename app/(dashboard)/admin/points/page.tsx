import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Coins, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

export default async function AdminPointsPage() {
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

  // Fetch points economy stats
  const [
    { data: topUsers },
    { data: recentTransactions },
    { count: totalUsers },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, points_balance, total_points_earned")
      .gt("total_points_earned", 0)
      .order("total_points_earned", { ascending: false })
      .limit(20),
    supabase
      .from("points_ledger")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("total_points_earned", 0),
  ]);

  const userList = (topUsers as any[]) || [];
  const txList = (recentTransactions as any[]) || [];

  // Calculate economy stats
  const totalPointsInCirculation = userList.reduce((sum, u) => sum + (u.points_balance || 0), 0);
  const totalPointsEverEarned = userList.reduce((sum, u) => sum + (u.total_points_earned || 0), 0);
  const totalRedeemed = totalPointsEverEarned - totalPointsInCirculation;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Points Management</h1>
      <p className="mt-1 text-gray-400">Monitor and manage the platform points economy</p>

      {/* Economy Overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-gold/20 p-2">
              <Coins className="h-5 w-5 text-pd-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pd-gold">{totalPointsInCirculation.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Points in Circulation</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-purple/20 p-2">
              <TrendingUp className="h-5 w-5 text-pd-purple-light" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pd-purple-light">{totalPointsEverEarned.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Points Issued</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <ArrowDownRight className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{totalRedeemed.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Points Redeemed</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-blue/20 p-2">
              <Users className="h-5 w-5 text-pd-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pd-blue">{totalUsers || 0}</p>
              <p className="text-xs text-gray-400">Users with Points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Top Users */}
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Top Users by Points</h2>
          {userList.length === 0 ? (
            <div className="mt-4 glass-card p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-gray-400">No users have earned points yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {userList.map((u: any, i: number) => (
                <div key={u.id} className="glass-card flex items-center gap-3 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{u.full_name || u.email}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-pd-gold">{(u.points_balance || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">of {(u.total_points_earned || 0).toLocaleString()} earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Recent Transactions</h2>
          {txList.length === 0 ? (
            <div className="mt-4 glass-card p-8 text-center">
              <Coins className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {txList.map((tx: any) => {
                const isEarned = tx.points > 0;
                return (
                  <div key={tx.id} className="glass-card flex items-center gap-3 p-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isEarned ? "bg-green-500/15" : "bg-red-500/15"}`}>
                      {isEarned
                        ? <ArrowUpRight className="h-4 w-4 text-green-400" />
                        : <ArrowDownRight className="h-4 w-4 text-red-400" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {tx.profiles?.full_name || tx.profiles?.email || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {tx.action?.replace(/^(earned_|redeemed_)/, "").replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isEarned ? "text-green-400" : "text-red-400"}`}>
                        {isEarned ? "+" : ""}{tx.points}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
