import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import { Gift, Trophy, Users } from "lucide-react";

const GIVEAWAYS_QUERY = `*[_type == "giveaway"] | order(_createdAt desc) {
  _id, title, giveawayType, prizeValue, isActive, entryCount, startDate, endDate, drawingFrequency
}`;

export default async function AdminGiveawaysPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const role = user.publicMetadata?.role as string;
  if (role !== "admin") redirect("/dashboard");

  const { data: giveaways } = await sanityFetch({ query: GIVEAWAYS_QUERY });
  const list = (giveaways as any[]) || [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Giveaway Management</h1>

      {list.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <Gift className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">No giveaways created yet</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((g: any) => (
            <div key={g._id} className="glass-card p-6">
              <div className="flex items-center gap-3">
                {g.giveawayType === "consumer" ? (
                  <Gift className="h-6 w-6 text-pd-gold" />
                ) : (
                  <Trophy className="h-6 w-6 text-pd-purple" />
                )}
                <div>
                  <h3 className="font-heading font-semibold text-white">{g.title}</h3>
                  <p className="text-sm text-gray-400">{g.giveawayType} &middot; ${g.prizeValue} &middot; {g.drawingFrequency}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs ${g.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                  {g.isActive ? "Active" : "Inactive"}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Users className="h-3 w-3" /> {g.entryCount || 0} entries
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
