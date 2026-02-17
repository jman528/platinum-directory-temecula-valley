import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import { AlertTriangle, Star, Check, X } from "lucide-react";

const PENDING_REVIEWS_QUERY = `*[_type == "review" && status == "pending"] | order(_createdAt desc) [0...20] {
  _id, authorName, rating, title, body, _createdAt,
  business->{name}
}`;

export default async function ModerationPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const role = user.publicMetadata?.role as string;
  if (role !== "admin") redirect("/dashboard");

  const { data: reviews } = await sanityFetch({ query: PENDING_REVIEWS_QUERY });
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
            <div key={review._id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Review for <span className="text-white">{review.business?.name}</span></p>
                  <p className="mt-1 font-medium text-white">{review.title}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: review.rating || 0 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-pd-gold text-pd-gold" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{review.body}</p>
                  <p className="mt-1 text-xs text-gray-500">by {review.authorName}</p>
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
