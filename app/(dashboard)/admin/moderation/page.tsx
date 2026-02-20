"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ShieldAlert, Star, CheckCircle, XCircle, AlertTriangle,
  Eye, Trash2, Ban, RotateCcw, FileText, Activity, Loader2,
} from "lucide-react";

export default function ModerationPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewList, setReviewList] = useState<any[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [suspiciousList, setSuspiciousList] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);
      loadData();
    }
    init();
  }, []);

  async function loadData() {
    setLoading(true);
    const [reviewsRes, bizRes, usersRes] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, title, body, rating, author_name, status, created_at, business_id, businesses(name, slug)")
        .in("status", ["pending", "flagged"])
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("businesses")
        .select("id, name, slug, city, tier, created_at, owner_user_id, phone, website")
        .eq("is_active", false)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("profiles")
        .select("id, full_name, email, points_balance, created_at, user_type")
        .gt("points_balance", 5000)
        .order("points_balance", { ascending: false })
        .limit(10),
    ]);
    setReviewList(reviewsRes.data || []);
    setPendingList(bizRes.data || []);
    setSuspiciousList(usersRes.data || []);
    setLoading(false);
  }

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function approveReview(reviewId: string) {
    const { error } = await supabase
      .from("reviews")
      .update({ status: "approved" })
      .eq("id", reviewId);
    if (error) { showToast("Failed to approve review", "error"); return; }
    setReviewList(prev => prev.filter(r => r.id !== reviewId));
    showToast("Review approved");
  }

  async function deleteReview(reviewId: string) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) { showToast("Failed to delete review", "error"); return; }
    setReviewList(prev => prev.filter(r => r.id !== reviewId));
    showToast("Review deleted");
  }

  async function approveBusiness(bizId: string) {
    const { error } = await supabase
      .from("businesses")
      .update({
        is_active: true,
        is_verified: true,
        claim_status: "approved",
      })
      .eq("id", bizId);
    if (error) { showToast("Failed to approve business", "error"); return; }
    setPendingList(prev => prev.filter(b => b.id !== bizId));
    showToast("Business approved and now live in directory");
  }

  async function rejectBusiness(bizId: string) {
    const { error } = await supabase
      .from("businesses")
      .update({ claim_status: "rejected" })
      .eq("id", bizId);
    if (error) { showToast("Failed to reject business", "error"); return; }
    setPendingList(prev => prev.filter(b => b.id !== bizId));
    showToast("Business rejected");
  }

  async function resetPoints(userId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ points_balance: 0 })
      .eq("id", userId);
    if (error) { showToast("Failed to reset points", "error"); return; }
    setSuspiciousList(prev => prev.filter(u => u.id !== userId));
    showToast("Points reset to 0");
  }

  if (!authorized) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pd-purple" /></div>;
  }

  const totalItems = reviewList.length + pendingList.length + suspiciousList.length;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Moderation Queue</h2>
          <p className="mt-1 text-gray-400">{totalItems} items requiring attention</p>
        </div>
        {totalItems === 0 && !loading && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" /> All Clear
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
        </div>
      ) : (
        <>
          {/* Summary Badges */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span className="text-red-300">{reviewList.length} Flagged Reviews</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300">{pendingList.length} Pending Verification</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300">{suspiciousList.length} Suspicious Activity</span>
            </div>
          </div>

          {/* Flagged Reviews Section */}
          {reviewList.length > 0 && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
                <ShieldAlert className="h-5 w-5 text-red-400" /> Flagged Reviews
              </h3>
              <div className="mt-4 space-y-3">
                {reviewList.map((review: any) => (
                  <div key={review.id} className="glass-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                            {review.status === "flagged" ? "Flagged (Urgent)" : "Pending Review"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          Review by <span className="text-white">{review.author_name || "Anonymous"}</span> on{" "}
                          <span className="text-white">{(review.businesses as any)?.name || "Unknown"}</span>
                        </p>
                        {review.title && <p className="mt-1 font-medium text-white">{review.title}</p>}
                        <div className="mt-1 flex items-center gap-1">
                          {Array.from({ length: review.rating || 0 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-pd-gold text-pd-gold" />
                          ))}
                          {Array.from({ length: 5 - (review.rating || 0) }).map((_, i) => (
                            <Star key={`e-${i}`} className="h-3 w-3 text-gray-600" />
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{review.body}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Submitted {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => approveReview(review.id)}
                          className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Business Verification Section */}
          {pendingList.length > 0 && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-400" /> Pending Business Verification
              </h3>
              <div className="mt-4 space-y-3">
                {pendingList.map((biz: any) => (
                  <div key={biz.id} className="glass-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/businesses/${biz.id}`} className="font-medium text-white hover:text-pd-gold">
                            {biz.name}
                          </Link>
                          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                            Pending
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">
                          {biz.city || "No city"} &middot; {biz.tier?.replace(/_/g, " ") || "free"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                          {biz.phone && <span>Phone: {biz.phone}</span>}
                          {biz.website && <span>Website: {biz.website}</span>}
                          <span>Submitted {new Date(biz.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/admin/businesses/${biz.id}`}
                          className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Details
                        </Link>
                        <button
                          onClick={() => approveBusiness(biz.id)}
                          className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => rejectBusiness(biz.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Activity Section */}
          {suspiciousList.length > 0 && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
                <Activity className="h-5 w-5 text-purple-400" /> Suspicious User Activity
              </h3>
              <p className="mt-1 text-sm text-gray-500">Users with unusually high points balances</p>
              <div className="mt-4 space-y-3">
                {suspiciousList.map((user: any) => (
                  <div key={user.id} className="glass-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{user.full_name || user.email}</p>
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                            {user.user_type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">
                          Points Balance: <span className="font-semibold text-pd-gold">{user.points_balance?.toLocaleString()}</span>
                          {" "}&middot; Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => resetPoints(user.id)}
                          className="flex items-center gap-1 rounded-lg bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reset Points
                        </button>
                        <button className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white">
                          <Eye className="h-3.5 w-3.5" /> View Logs
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Clear Message */}
          {totalItems === 0 && (
            <div className="mt-8 glass-card p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400/60" />
              <p className="mt-4 text-lg text-gray-400">All clear! No items to moderate.</p>
              <p className="mt-1 text-sm text-gray-500">Check back later for new moderation items.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
