import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Shield, ExternalLink, Sparkles } from "lucide-react";

export default async function ListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*, categories(name, slug)")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  const bizList = (businesses as any[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">My Listings</h1>
        <Link href="/claim-business" className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
          <Plus className="h-4 w-4" /> Claim Business
        </Link>
      </div>

      {bizList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <p className="text-gray-400">No listings yet. Claim your business to get started.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bizList.map((biz: any) => (
            <div key={biz.id} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pd-purple/10 text-lg font-bold text-pd-purple-light">
                    {biz.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-white">{biz.name}</h3>
                      {biz.tier !== "free" && <Shield className="h-4 w-4 text-pd-gold" />}
                    </div>
                    <p className="text-sm text-gray-400">{biz.categories?.name || "Uncategorized"} &middot; {biz.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${biz.is_active ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {biz.is_active ? "active" : "inactive"}
                  </span>
                  <Link href={`/dashboard/listings/${biz.id}/enrich`} className="flex items-center gap-1 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs text-purple-400 hover:bg-purple-500/20" title="AI Enrich">
                    <Sparkles className="h-3 w-3" /> Enrich
                  </Link>
                  <Link href={`/business/${biz.slug}`} className="text-gray-400 hover:text-white">
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
