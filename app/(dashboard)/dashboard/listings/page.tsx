import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import { BUSINESSES_BY_OWNER_QUERY } from "@/lib/sanity/queries";
import Link from "next/link";
import { Plus, Shield, ExternalLink } from "lucide-react";
import type { Business } from "@/types";

export default async function ListingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { data: businesses } = await sanityFetch({
    query: BUSINESSES_BY_OWNER_QUERY,
    params: { clerkId: user.id },
  });

  const bizList = (businesses as Business[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">My Listings</h1>
        <Link href="/claim" className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
          <Plus className="h-4 w-4" /> Claim Business
        </Link>
      </div>

      {bizList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <p className="text-gray-400">No listings yet. Claim your business to get started.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bizList.map((biz) => (
            <div key={biz._id} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pd-purple/10 text-lg font-bold text-pd-purple-light">
                    {biz.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-white">{biz.name}</h3>
                      {biz.isVerified && <Shield className="h-4 w-4 text-pd-gold" />}
                    </div>
                    <p className="text-sm text-gray-400">{biz.primaryCategory?.name} &middot; {biz.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${biz.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {biz.status}
                  </span>
                  <Link href={`/business/${biz.slug?.current}`} className="text-gray-400 hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
