import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Mail, Phone } from "lucide-react";
import type { Lead } from "@/types";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get user's businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id);

  const bizIds = (businesses || []).map((b: any) => b.id);

  // Fetch leads for all owned businesses
  let allLeads: Lead[] = [];
  if (bizIds.length > 0) {
    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .in("business_id", bizIds)
      .order("created_at", { ascending: false });

    allLeads = (leads as Lead[]) || [];
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-400",
    contacted: "bg-yellow-500/20 text-yellow-400",
    qualified: "bg-purple-500/20 text-purple-400",
    converted: "bg-green-500/20 text-green-400",
    lost: "bg-red-500/20 text-red-400",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Leads</h1>
      <p className="mt-1 text-gray-400">{allLeads.length} total leads</p>

      {allLeads.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">No leads yet. They&apos;ll show up here when customers contact you.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {allLeads.map((lead) => (
            <div key={lead.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{lead.name}</p>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-400">
                    {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                  </div>
                  {lead.message && <p className="mt-2 text-sm text-gray-500 line-clamp-1">{lead.message}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[lead.status] || ""}`}>
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
