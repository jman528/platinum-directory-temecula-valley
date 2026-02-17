import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import { Store, Users, AlertTriangle, DollarSign, Clock, Shield } from "lucide-react";

const ADMIN_STATS_QUERY = `{
  "totalBusinesses": count(*[_type == "business"]),
  "activeBusinesses": count(*[_type == "business" && status == "active"]),
  "pendingBusinesses": count(*[_type == "business" && status == "pending"]),
  "totalLeads": count(*[_type == "lead"]),
  "pendingReviews": count(*[_type == "review" && status == "pending"]),
  "totalGiveawayEntries": count(*[_type == "giveawayEntry"])
}`;

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  
  const role = user.publicMetadata?.role as string;
  if (role !== "admin") redirect("/dashboard");

  const { data: stats } = await sanityFetch({ query: ADMIN_STATS_QUERY });
  const s = stats as any || {};

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-1 text-gray-400">Platform overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-pd-blue" />
            <div>
              <p className="text-2xl font-bold text-white">{s.activeBusinesses || 0}</p>
              <p className="text-xs text-gray-400">Active Businesses</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{s.pendingBusinesses || 0}</p>
              <p className="text-xs text-gray-400">Pending Listings</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{s.totalLeads || 0}</p>
              <p className="text-xs text-gray-400">Total Leads</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{s.pendingReviews || 0}</p>
              <p className="text-xs text-gray-400">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-pd-gold" />
            <div>
              <p className="text-2xl font-bold text-white">{s.totalBusinesses || 0}</p>
              <p className="text-xs text-gray-400">Total Businesses</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-pd-purple" />
            <div>
              <p className="text-2xl font-bold text-white">{s.totalGiveawayEntries || 0}</p>
              <p className="text-xs text-gray-400">Giveaway Entries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
