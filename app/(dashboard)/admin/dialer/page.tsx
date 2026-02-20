"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Phone, PhoneOff, Play, Pause, SkipForward,
  ChevronDown, ChevronRight, Copy, CheckCircle,
  Loader2, Clock, FileText, Flame, Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import { formatPhoneUS } from "@/lib/utils/format-phone";

const AIAssistantPanel = dynamic(() => import("@/components/admin/AIAssistantPanel"), { ssr: false });

const DISPOSITIONS = [
  { value: "interested", label: "Interested", color: "bg-green-500/20 text-green-400" },
  { value: "appointment_set", label: "Callback Scheduled", color: "bg-blue-500/20 text-blue-400" },
  { value: "not_interested", label: "Not Interested", color: "bg-red-500/20 text-red-400" },
  { value: "no_answer", label: "No Answer", color: "bg-gray-500/20 text-gray-400" },
  { value: "wrong_number", label: "Wrong Number", color: "bg-orange-500/20 text-orange-400" },
  { value: "dnc", label: "DNC (Do Not Call)", color: "bg-red-800/20 text-red-500" },
];

const SKIP_REASONS = [
  { value: "not_interested", label: "Not interested" },
  { value: "wrong_number", label: "Wrong number" },
  { value: "callback_later", label: "Callback later" },
  { value: "voicemail", label: "Left voicemail" },
];

const OBJECTIONS = [
  { title: "\"I'm not interested\"", body: "I totally understand - and honestly, most people say that at first because they've been burned by directories before. The difference is we're LOCAL only - just Temecula Valley - and our Smart Offers let you get paid BEFORE customers even walk in. Can I just take 2 minutes to verify your free listing is accurate? No obligation." },
  { title: "\"What does it cost?\"", body: "Great question. Your listing is completely free. We have premium tiers if you want extra features, leads delivered, and lower fees on our Smart Offers - but the basic listing costs you nothing. Want me to verify your info real quick?" },
  { title: "\"We tried Groupon/Yelp\"", body: "I hear that all the time. The problem with Groupon is you're competing with businesses 50 miles away and they take 50% of everything. We're LOCAL only - just Temecula Valley businesses - and our fees are way lower. Plus, you own the customer data. Can I show you the difference?" },
  { title: "\"I'm too busy\"", body: "I completely understand - running a business is no joke. That's exactly why I want to set up a quick 10-minute call when it works for you. Would tomorrow morning or Thursday afternoon be better?" },
  { title: "\"Send me info\"", body: "Absolutely, I'd be happy to. But honestly, the best thing is to just show you your listing and how it works - takes about 5 minutes. What's a good time for a quick screen share? I can send a calendar invite right now." },
  { title: "\"How is this different?\"", body: "Great question. Google and Yelp are national - you're competing with everyone. We're ONLY Temecula Valley - 11 cities, 8,000 local businesses. Plus, our Smart Offers let you create deals where customers pay upfront - you get cash in your pocket before they even visit. Want me to show you how it works?" },
  { title: "\"Need to talk to partner\"", body: "That makes total sense - this is a business decision. Would it help if I scheduled a quick call where both of you can be on? That way you can ask questions together. What day works for you both?" },
];

export default function AdminDialerPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dialerActive, setDialerActive] = useState(false);
  const [callState, setCallState] = useState<"idle" | "dialing" | "in_call" | "wrap_up">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [scriptOpen, setScriptOpen] = useState(false);
  const [openObjection, setOpenObjection] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [skipReason, setSkipReason] = useState("");
  const [roiTicket, setRoiTicket] = useState("100");
  const [roiConversion, setRoiConversion] = useState("20");
  const supabase = createClient();

  // Ctrl+K to toggle AI panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setAiPanelOpen(prev => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") return;
      setAuthorized(true);

      // Load hot leads / call queue
      const { data } = await supabase
        .from("businesses")
        .select("id, name, phone, city, tier, outreach_status, lead_score, categories(name)")
        .eq("is_active", true)
        .not("phone", "is", null)
        .in("outreach_status", ["not_contacted", "follow_up"])
        .order("lead_score", { ascending: false })
        .limit(50);

      setQueue(data || []);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (callState !== "in_call") return;
    const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  function startDialer() {
    setDialerActive(true);
    setCallState("dialing");
    // Simulate dial → connect after 2 seconds
    setTimeout(() => setCallState("in_call"), 2000);
  }

  function endCall() {
    setCallState("wrap_up");
  }

  async function submitDisposition(disposition: string) {
    const biz = queue[currentIndex];
    if (biz) {
      const updateData: Record<string, any> = {
        outreach_status: disposition,
        outreach_last_contacted_at: new Date().toISOString(),
      };
      if (notes) updateData.outreach_notes = notes;
      if (followUpDate) updateData.outreach_next_follow_up = followUpDate;

      await supabase
        .from("businesses")
        .update(updateData)
        .eq("id", biz.id);

      // Increment call attempts
      const { error: rpcError } = await supabase.rpc("increment_call_attempts", { business_id: biz.id });
      if (rpcError) {
        // Fallback: direct update if RPC doesn't exist
        await supabase
          .from("businesses")
          .update({ total_call_attempts: (biz.total_call_attempts || 0) + 1 })
          .eq("id", biz.id);
      }
    }
    setNotes("");
    setFollowUpDate("");
    setCallDuration(0);
    setCallState("idle");

    // Auto-advance
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1);
      setTimeout(() => {
        setCallState("dialing");
        setTimeout(() => setCallState("in_call"), 2000);
      }, 1000);
    } else {
      setDialerActive(false);
    }
  }

  async function skip(reason?: string) {
    const biz = queue[currentIndex];
    if (biz && reason) {
      await supabase
        .from("businesses")
        .update({
          outreach_status: reason === "voicemail" ? "voicemail" : reason === "callback_later" ? "follow_up" : reason,
          outreach_last_contacted_at: new Date().toISOString(),
        })
        .eq("id", biz.id);
    }
    setSkipReason("");
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const current = queue[currentIndex];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!authorized) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pd-purple" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Progressive Dialer</h2>
          <p className="mt-1 text-gray-400">{queue.length} businesses in queue</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAiPanelOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-pd-gold/30 px-3 py-2 text-sm text-pd-gold hover:bg-pd-gold/10"
            title="Ctrl+K"
          >
            <Sparkles className="h-4 w-4" /> AI Assistant
          </button>
          {!dialerActive ? (
            <button
              onClick={startDialer}
              disabled={queue.length === 0}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> Start Dialing
            </button>
          ) : (
            <button
              onClick={() => { setDialerActive(false); setCallState("idle"); }}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Pause className="h-4 w-4" /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Call Queue */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Call */}
          {current && dialerActive && (
            <div className="glass-card border-pd-gold/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-pd-gold">Now Calling</p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-white">{current.name}</h3>
                  <p className="text-sm text-gray-400">{formatPhoneUS(current.phone)} &middot; {current.city}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-pd-gold/10 px-2 py-0.5 text-xs text-pd-gold">
                      {(current.categories?.name || current.tier || "").replace(/_/g, " ")}
                    </span>
                    {current.lead_score > 60 && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                        <Flame className="h-3 w-3" /> Hot Lead ({current.lead_score})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {callState === "in_call" && (
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                      <span className="font-mono text-lg">{formatTime(callDuration)}</span>
                    </div>
                  )}
                  {callState === "dialing" && (
                    <p className="text-yellow-400 animate-pulse">Dialing...</p>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              {callState === "in_call" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={endCall} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                    <PhoneOff className="h-4 w-4" /> End Call
                  </button>
                  <select
                    value={skipReason}
                    onChange={e => { setSkipReason(e.target.value); if (e.target.value) skip(e.target.value); }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 focus:outline-none"
                  >
                    <option value="">Skip...</option>
                    {SKIP_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              )}

              {/* Wrap Up */}
              {callState === "wrap_up" && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-white">Call Disposition:</p>
                  <div className="flex flex-wrap gap-2">
                    {DISPOSITIONS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => submitDisposition(d.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs ${d.color} hover:opacity-80`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Call notes..."
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Queue List */}
          <div className="glass-card p-4">
            <h3 className="font-heading text-lg font-bold text-white">Call Queue</h3>
            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
              {queue.map((biz, i) => (
                <div
                  key={biz.id}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    i === currentIndex && dialerActive ? "bg-pd-gold/10 border border-pd-gold/20" :
                    i < currentIndex ? "opacity-50" : "bg-white/[0.03]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{biz.name}</p>
                    <p className="text-xs text-gray-500">{formatPhoneUS(biz.phone)} &middot; {biz.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {biz.lead_score > 60 && <Flame className="h-3.5 w-3.5 text-orange-400" />}
                    <span className="text-xs text-gray-500">{biz.outreach_status?.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))}
              {loading && <div className="text-center py-4"><Loader2 className="mx-auto h-5 w-5 animate-spin text-pd-purple" /></div>}
              {!loading && queue.length === 0 && <p className="text-center py-4 text-gray-500">No businesses in queue</p>}
            </div>
          </div>
        </div>

        {/* Call Script Panel */}
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setScriptOpen(!scriptOpen)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-pd-gold" />
                <span className="font-heading font-bold text-white">Call Script</span>
              </div>
              {scriptOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </button>

            {scriptOpen && (
              <div className="border-t border-white/10 p-4 space-y-4 text-sm">
                {/* Opening */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-pd-gold">The Opening</p>
                  <p className="mt-2 text-gray-300 leading-relaxed">
                    &ldquo;Hi, this is Frank with Platinum Directory Temecula Valley. I&apos;m calling to introduce myself and let you know that we have a free listing that needs to be verified for <span className="font-bold text-pd-gold">{current?.name || "[BUSINESS NAME]"}</span>.&rdquo;
                  </p>
                </div>

                {/* Bridge */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-pd-gold">The Bridge</p>
                  <p className="mt-2 text-gray-300 leading-relaxed">
                    &ldquo;We&apos;re launching an advanced hybrid lead generation platform - it combines a premium local directory with Smart Offers and deals that actually drive customers to your door. It&apos;s pretty exciting.&rdquo;
                  </p>
                </div>

                {/* The Ask */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-pd-gold">The Ask</p>
                  <p className="mt-2 text-gray-300 leading-relaxed">
                    &ldquo;Do you have a few minutes now, or would Thursday at 1:00 or 3:00 PM work better?&rdquo;
                  </p>
                </div>

                {/* Voicemail */}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Voicemail Script</p>
                  <p className="mt-2 text-gray-300 leading-relaxed">
                    &ldquo;Hi, this is Frank with Platinum Directory Temecula Valley. I&apos;m calling because we have a free listing for <span className="font-bold text-pd-gold">{current?.name || "[BUSINESS NAME]"}</span> that needs to be verified. Give me a call back or I&apos;ll try you again tomorrow.&rdquo;
                  </p>
                </div>

                {/* Text Follow-up */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Text Follow-up</p>
                    <button
                      onClick={() => copyText(`Hi! This is Frank from Platinum Directory. Just left you a voicemail - we have a free listing for ${current?.name || "[BUSINESS NAME]"} that needs verification. Takes 2 minutes. When's a good time for a quick call?`)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-white"
                    >
                      {copied ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 rounded-lg bg-white/5 p-3 text-gray-300">
                    Hi! This is Frank from Platinum Directory. Just left you a voicemail - we have a free listing for <span className="font-bold text-pd-gold">{current?.name || "[BUSINESS NAME]"}</span> that needs verification. Takes 2 minutes. When&apos;s a good time for a quick call?
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Objection Handlers */}
          <div className="glass-card overflow-hidden">
            <div className="p-4">
              <p className="font-heading font-bold text-white">Objection Handlers</p>
            </div>
            <div className="border-t border-white/10">
              {OBJECTIONS.map((obj, i) => (
                <div key={i} className="border-b border-white/5 last:border-0">
                  <button
                    onClick={() => setOpenObjection(openObjection === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm text-gray-300">{obj.title}</span>
                    {openObjection === i ? <ChevronDown className="h-3.5 w-3.5 text-gray-500" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
                  </button>
                  {openObjection === i && (
                    <div className="px-4 pb-3">
                      <p className="rounded-lg bg-green-500/5 p-3 text-xs leading-relaxed text-gray-300">{obj.body}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Goals */}
          <div className="glass-card p-4">
            <p className="font-heading text-sm font-bold text-white">Daily Goals</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              {[
                { label: "Dials", target: "50+" },
                { label: "Conversations", target: "15-20" },
                { label: "Appointments", target: "5-8" },
                { label: "Closes", target: "1-3" },
              ].map(g => (
                <div key={g.label} className="rounded-lg bg-white/[0.03] p-2">
                  <p className="text-lg font-bold text-pd-gold">{g.target}</p>
                  <p className="text-[10px] text-gray-500">{g.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="glass-card p-4">
            <p className="font-heading text-sm font-bold text-white">ROI Calculator</p>
            <p className="mt-1 text-[10px] text-gray-500">Estimate monthly revenue from PD leads</p>
            <div className="mt-3 space-y-2">
              <div>
                <label className="text-[10px] text-gray-500">Avg. Ticket Price ($)</label>
                <input
                  type="number"
                  value={roiTicket}
                  onChange={e => setRoiTicket(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Conversion Rate (%)</label>
                <input
                  type="number"
                  value={roiConversion}
                  onChange={e => setRoiConversion(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none"
                />
              </div>
              {(() => {
                const tierLeads: Record<string, number> = {
                  free: 0,
                  verified_platinum: 10,
                  platinum_partner: 35,
                  platinum_elite: 75,
                };
                const tiers = [
                  { key: "verified_platinum", label: "Verified", leads: 10 },
                  { key: "platinum_partner", label: "Partner", leads: 35 },
                  { key: "platinum_elite", label: "Elite", leads: 75 },
                ];
                const ticket = parseFloat(roiTicket) || 0;
                const conversion = (parseFloat(roiConversion) || 0) / 100;
                const currentTier = current?.tier || "free";
                const currentLeads = tierLeads[currentTier] || 0;
                const currentRevenue = currentLeads * conversion * ticket;

                return (
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    {currentLeads > 0 && current && (
                      <div className="rounded-lg bg-pd-gold/10 p-2 text-center">
                        <p className="text-[10px] text-gray-400">
                          At {current.tier?.replace(/_/g, " ")} ({currentLeads} leads/mo)
                        </p>
                        <p className="text-lg font-bold text-pd-gold">
                          ${currentRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                        </p>
                      </div>
                    )}
                    {tiers.map(t => {
                      const rev = t.leads * conversion * ticket;
                      return (
                        <div key={t.key} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2 py-1.5">
                          <span className="text-xs text-gray-400">{t.label} ({t.leads} leads)</span>
                          <span className="text-xs font-bold text-pd-gold">
                            ${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                          </span>
                        </div>
                      );
                    })}
                    <p className="text-center text-[10px] text-gray-600">
                      &ldquo;If we send you X leads and Y% convert at ${ticket} = revenue&rdquo;
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        business={current ? {
          id: current.id,
          name: current.name,
          phone: current.phone,
          city: current.city,
          tier: current.tier,
          lead_score: current.lead_score,
          outreach_status: current.outreach_status,
          categories: current.categories,
        } : null}
        mode={callState === "in_call" ? "during-call" : callState === "wrap_up" ? "post-call" : "pre-call"}
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />
    </div>
  );
}
