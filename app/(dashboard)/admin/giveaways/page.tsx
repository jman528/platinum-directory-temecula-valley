import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Gift, Trophy, Users } from "lucide-react";
import type { GiveawayEntry } from "@/types";

export default async function AdminGiveawaysPage() {
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

  // Fetch giveaway entries grouped by type with counts
  const [
    { data: entries },
    { count: consumerCount },
    { count: businessCount },
  ] = await Promise.all([
    supabase
      .from("giveaway_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("giveaway_entries")
      .select("*", { count: "exact", head: true })
      .eq("giveaway_type", "consumer"),
    supabase
      .from("giveaway_entries")
      .select("*", { count: "exact", head: true })
      .eq("giveaway_type", "business"),
  ]);

  const entryList = (entries as GiveawayEntry[]) || [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Giveaway Management</h1>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-pd-gold" />
            <div>
              <h3 className="font-heading font-semibold text-white">Consumer Giveaway</h3>
              <p className="text-sm text-gray-400">consumer &middot; Monthly Drawing</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
              Active
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Users className="h-3 w-3" /> {consumerCount || 0} entries
            </span>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-pd-purple" />
            <div>
              <h3 className="font-heading font-semibold text-white">Business Giveaway</h3>
              <p className="text-sm text-gray-400">business &middot; Monthly Drawing</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
              Active
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Users className="h-3 w-3" /> {businessCount || 0} entries
            </span>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white">Recent Entries</h2>
        {entryList.length === 0 ? (
          <div className="mt-4 glass-card p-12 text-center">
            <Gift className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-lg text-gray-400">No giveaway entries yet</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pd-purple/20 text-left">
                  <th className="pb-3 text-gray-400">Name</th>
                  <th className="pb-3 text-gray-400">Email</th>
                  <th className="pb-3 text-gray-400">Type</th>
                  <th className="pb-3 text-gray-400">Entries</th>
                  <th className="pb-3 text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {entryList.map((entry) => (
                  <tr key={entry.id} className="border-b border-pd-purple/10">
                    <td className="py-3 text-white">{entry.full_name || "\u2014"}</td>
                    <td className="py-3 text-gray-400">{entry.email}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${entry.giveaway_type === "consumer" ? "bg-pd-gold/20 text-pd-gold" : "bg-pd-purple/20 text-pd-purple-light"}`}>
                        {entry.giveaway_type}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{entry.total_entries}</td>
                    <td className="py-3 text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
