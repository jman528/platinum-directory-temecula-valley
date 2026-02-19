"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings, Users, Mail, Loader2, UserPlus, Trash2, CheckCircle,
  AlertCircle, Shield, Clock,
} from "lucide-react";

interface TeamMember {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

export default function SettingsPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("business_staff");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bizData } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("owner_user_id", user.id)
        .eq("is_active", true);

      const bizList = bizData || [];
      setBusinesses(bizList);
      if (bizList.length > 0) setSelectedBiz(bizList[0].id);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedBiz) return;
    loadMembers();
  }, [selectedBiz]);

  async function loadMembers() {
    const { data } = await supabase
      .from("business_team_members")
      .select("*")
      .eq("business_id", selectedBiz)
      .neq("status", "revoked")
      .order("created_at", { ascending: false });
    setMembers((data as TeamMember[]) || []);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedBiz) return;
    setInviting(true);
    setError("");
    setSuccess("");

    const { data: { user } } = await supabase.auth.getUser();

    // Check if already invited
    const existing = members.find(
      (m) => m.invited_email.toLowerCase() === inviteEmail.toLowerCase().trim()
    );
    if (existing) {
      setError("This email has already been invited.");
      setInviting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("business_team_members")
      .insert({
        business_id: selectedBiz,
        invited_email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        status: "pending",
        invited_by: user?.id,
      });

    if (insertError) {
      setError(insertError.message || "Failed to send invitation.");
      setInviting(false);
      return;
    }

    setSuccess(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setInviting(false);
    loadMembers();
  }

  async function handleRevoke(memberId: string) {
    setError("");
    const { error: revokeError } = await supabase
      .from("business_team_members")
      .update({ status: "revoked" })
      .eq("id", memberId);

    if (revokeError) {
      setError("Failed to revoke access.");
      return;
    }
    loadMembers();
  }

  const roleBadge = (role: string) => {
    switch (role) {
      case "business_owner":
        return <span className="rounded-full bg-pd-gold/20 px-2 py-0.5 text-[10px] font-bold text-pd-gold">OWNER</span>;
      case "business_manager":
        return <span className="rounded-full bg-pd-blue/20 px-2 py-0.5 text-[10px] font-bold text-pd-blue-light">MANAGER</span>;
      default:
        return <span className="rounded-full bg-pd-purple/20 px-2 py-0.5 text-[10px] font-bold text-pd-purple-light">STAFF</span>;
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-3.5 w-3.5 text-green-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>

      {businesses.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <Settings className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">No businesses found</p>
          <p className="mt-2 text-sm text-gray-500">Claim or add a business to manage settings.</p>
        </div>
      ) : (
        <>
          {/* Business selector */}
          {businesses.length > 1 && (
            <div className="mt-4">
              <select
                value={selectedBiz}
                onChange={(e) => setSelectedBiz(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pd-purple/40 focus:outline-none"
              >
                {businesses.map((b: any) => (
                  <option key={b.id} value={b.id} className="bg-pd-dark">{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Team Members Section */}
          <div className="mt-8">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-pd-gold" />
              <h2 className="font-heading text-lg font-bold text-white">Team Members</h2>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Invite staff to help manage your business. Staff can access the dashboard but cannot change billing or ownership.
            </p>

            {/* Invite Form */}
            <form onSubmit={handleInvite} className="mt-4 glass-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@example.com"
                    className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                    required
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="business_staff" className="bg-pd-dark">Staff</option>
                  <option value="business_manager" className="bg-pd-dark">Manager</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-pd-purple/20 px-4 py-2.5 text-sm font-medium text-pd-purple-light transition-colors hover:bg-pd-purple/30 disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Invite
                </button>
              </div>
            </form>

            {/* Messages */}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <p className="text-sm text-green-300">{success}</p>
              </div>
            )}

            {/* Member List */}
            <div className="mt-4 space-y-2">
              {members.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <Users className="mx-auto h-8 w-8 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No team members yet</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="glass-card flex items-center gap-3 p-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-pd-purple/15">
                      <Shield className="h-4 w-4 text-pd-purple-light" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{member.invited_email}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        {roleBadge(member.role)}
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                          {statusIcon(member.status)} {member.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(member.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-500 transition-colors hover:border-red-500/30 hover:text-red-400"
                      title="Revoke access"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
