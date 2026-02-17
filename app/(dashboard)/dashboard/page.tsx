import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import { BUSINESSES_BY_OWNER_QUERY } from "@/lib/sanity/queries";
import { BarChart3, Users, Eye, DollarSign } from "lucide-react";
import type { Business } from "@/types";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { data: businesses } = await sanityFetch({
    query: BUSINESSES_BY_OWNER_QUERY,
    params: { clerkId: user.id },
  });

  const bizList = (businesses as Business[]) || [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Dashboard Overview</h1>
      <p className="mt-1 text-gray-400">Welcome back, {user.firstName || "there"}!</p>

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
            <a href="/claim" className="mt-4 inline-block rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
              Claim Your Business
            </a>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bizList.map((biz) => (
              <div key={biz._id} className="glass-card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">{biz.name}</p>
                  <p className="text-sm text-gray-400">{biz.city}, {biz.state} &middot; {biz.tier?.replace(/_/g, " ")}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${biz.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {biz.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
