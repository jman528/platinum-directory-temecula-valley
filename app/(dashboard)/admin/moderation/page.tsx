import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle, Star, Check, X } from "lucide-react";

export default async function ModerationPage() {
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

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, businesses(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  const reviewList = (reviews as any[]) || [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Moderation Queue</h1>
      <p className="mt-1 text-gray-400">{reviewList.length} items pending review</p>

      {reviewList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">All clear! No items to moderate.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviewList.map((review: any) => (
            <div key={review.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Review for <span className="text-white">{review.businesses?.name}</span></p>
                  <p className="mt-1 font-medium text-white">{review.title}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: review.rating || 0 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-pd-gold text-pd-gold" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{review.body}</p>
                  <p className="mt-1 text-xs text-gray-500">by {review.author_name}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-green-500/20 p-2 text-green-400 hover:bg-green-500/30">
                    <Check className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
