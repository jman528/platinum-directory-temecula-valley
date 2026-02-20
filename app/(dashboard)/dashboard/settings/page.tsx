"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Settings, Users, Mail, Loader2, UserPlus, Trash2, CheckCircle,
  AlertCircle, Shield, Clock, LogOut, User, Phone, Bell, Store,
  Calendar, Crown,
} from "lucide-react";

interface TeamMember {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Team invite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("business_staff");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.full_name || "");
        setPhone(profileData.phone || "");
        setEmailNotifications(profileData.email_notifications !== false);
      }

      const { data: bizData } = await supabase
        .from("businesses")
        .select("id, name, tier, slug")
        .eq("owner_user_id", u.id)
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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: displayName.trim() || null,
        phone: phone.trim() || null,
        email_notifications: emailNotifications,
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError("Failed to save profile.");
    } else {
      setSuccess("Profile updated successfully.");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedBiz) return;
    setInviting(true);
    setError("");
    setSuccess("");

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const tierLabels: Record<string, string> = {
    free: "Free",
    verified_platinum: "Verified Platinum",
    platinum_partner: "Platinum Partner",
    platinum_elite: "Platinum Elite",
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    business_owner: "Business Owner",
    customer: "Customer",
  };

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
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>

      {/* Messages */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <p className="text-sm text-green-300">{success}</p>
        </div>
      )}

      {/* Profile Section */}
      <form onSubmit={handleSaveProfile} className="mt-6">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-pd-gold" />
          <h2 className="font-heading text-lg font-bold text-white">Profile</h2>
        </div>

        <div className="mt-4 glass-card p-6 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
              <User className="h-3.5 w-3.5" /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 123-4567"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
            />
          </div>

          {/* Tier & Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
                <Crown className="h-3.5 w-3.5" /> Subscription Tier
              </label>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-pd-gold">
                {tierLabels[businesses[0]?.tier || "free"] || "Free"}
              </div>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
                <Shield className="h-3.5 w-3.5" /> Role
              </label>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white">
                {roleLabels[profile?.user_type || "customer"] || "Customer"}
              </div>
            </div>
          </div>

          {/* Account Created */}
          {user?.created_at && (
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-400">
                <Calendar className="h-3.5 w-3.5" /> Member Since
              </label>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300">
                {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-pd-purple-light" />
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive updates about leads, offers, and activity</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${emailNotifications ? "bg-pd-purple" : "bg-gray-600"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${emailNotifications ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-pd-purple/20 px-4 py-2.5 text-sm font-medium text-pd-purple-light transition-colors hover:bg-pd-purple/30 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>

      {/* My Businesses */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-pd-gold" />
          <h2 className="font-heading text-lg font-bold text-white">My Businesses</h2>
        </div>
        {businesses.length === 0 ? (
          <div className="mt-4 glass-card p-8 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">No businesses claimed yet</p>
            <Link
              href="/claim"
              className="mt-4 inline-block rounded-xl bg-pd-gold/20 px-6 py-2 text-sm font-medium text-pd-gold transition-colors hover:bg-pd-gold/30"
            >
              Claim a Business
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {businesses.map((biz) => (
              <Link key={biz.id} href={`/business/${biz.slug}`} className="glass-card flex items-center gap-3 p-4 transition-colors hover:border-pd-purple/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pd-purple/15">
                  <Store className="h-5 w-5 text-pd-purple-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{biz.name}</p>
                  <span className="rounded-full bg-pd-gold/20 px-2 py-0.5 text-[10px] font-bold text-pd-gold">
                    {tierLabels[biz.tier] || "Free"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Team Management (only if user has businesses) */}
      {businesses.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-pd-gold" />
            <h2 className="font-heading text-lg font-bold text-white">Team Members</h2>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Invite staff to help manage your business.
          </p>

          {businesses.length > 1 && (
            <div className="mt-3">
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
      )}

      {/* Sign Out */}
      <div className="mt-8 mb-8">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
