"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Flag, Pencil, Trash2, SkipForward, Check, X, Loader2, AlertTriangle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FlaggedBusiness {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  category_id: string | null;
  data_quality_score: number;
  import_raw_data: any;
}

export default function FlaggedNamesPage() {
  const [businesses, setBusinesses] = useState<FlaggedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);
      loadBusinesses();
    }
    init();
  }, []);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("id, name, phone, address, city, category_id, data_quality_score, import_raw_data")
      .eq("has_valid_name", false)
      .order("created_at", { ascending: false })
      .limit(200);
    setBusinesses(data || []);
    setLoading(false);
  }, []);

  async function handleUpdateName(id: string) {
    if (!editName.trim()) return;
    setActionLoading(id);
    await supabase
      .from("businesses")
      .update({ name: editName.trim(), has_valid_name: true })
      .eq("id", id);
    setEditingId(null);
    setEditName("");
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setActionLoading(null);
  }

  async function handleSkip(id: string) {
    setActionLoading(id);
    await supabase
      .from("businesses")
      .update({ has_valid_name: true })
      .eq("id", id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setActionLoading(null);
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    await supabase.from("businesses").delete().eq("id", id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    setActionLoading(null);
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    for (const id of selected) {
      await supabase.from("businesses").delete().eq("id", id);
    }
    setBusinesses(prev => prev.filter(b => !selected.has(b.id)));
    setSelected(new Set());
    setActionLoading(null);
  }

  async function handleBulkMarkReviewed() {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    for (const id of selected) {
      await supabase.from("businesses").update({ has_valid_name: true }).eq("id", id);
    }
    setBusinesses(prev => prev.filter(b => !selected.has(b.id)));
    setSelected(new Set());
    setActionLoading(null);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selected.size === businesses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(businesses.map(b => b.id)));
    }
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <Flag className="h-6 w-6 text-yellow-400" /> Flagged Business Names
          </h1>
          <p className="mt-1 text-gray-400">
            {businesses.length} businesses with potentially invalid names need review
          </p>
        </div>
        <Link
          href="/admin/businesses"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          Back to Businesses
        </Link>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-pd-blue/10 border border-pd-blue/20 px-4 py-3">
          <span className="text-sm text-pd-blue">{selected.size} selected</span>
          <button
            onClick={handleBulkMarkReviewed}
            disabled={actionLoading === "bulk"}
            className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30"
          >
            Mark as Reviewed
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={actionLoading === "bulk"}
            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30"
          >
            Delete Selected
          </button>
          {actionLoading === "bulk" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Check className="h-10 w-10 text-green-400" />
            <p className="mt-3 text-lg font-medium text-white">All Clear</p>
            <p className="mt-1 text-sm text-gray-400">No flagged business names to review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.size === businesses.length && businesses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-600 bg-transparent"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Current Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Quality</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map(biz => (
                  <tr key={biz.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(biz.id)}
                        onChange={() => toggleSelect(biz.id)}
                        className="rounded border-gray-600 bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {editingId === biz.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="rounded-md border border-white/20 bg-pd-dark px-2 py-1 text-sm text-white focus:border-pd-blue focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateName(biz.id)} className="text-green-400 hover:text-green-300">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-300">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${biz.name ? 'text-white' : 'text-red-400 italic'}`}>
                            {biz.name || '(blank)'}
                          </span>
                          {(!biz.name || biz.name.toLowerCase() === 'closed') && (
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{biz.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">{biz.address || '—'}, {biz.city}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        biz.data_quality_score >= 50 ? 'text-green-400' :
                        biz.data_quality_score >= 20 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {biz.data_quality_score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {actionLoading === biz.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(biz.id); setEditName(biz.name || ""); }}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                              title="Edit Name"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleSkip(biz.id)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                              title="Mark as OK"
                            >
                              <SkipForward className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(biz.id)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
