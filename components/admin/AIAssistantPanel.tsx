"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Send, Copy, CheckCircle, Loader2, Brain,
  Phone, PhoneOff, MessageSquare, ClipboardList,
  AlertTriangle, DollarSign, Mail, Mic, MicOff,
  ChevronDown, ChevronRight, Sparkles,
} from "lucide-react";

interface Business {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  tier?: string;
  rating?: number;
  review_count?: number;
  lead_score?: number;
  outreach_status?: string;
  outreach_last_contacted_at?: string;
  categories?: { name: string } | null;
}

interface AIAssistantPanelProps {
  business?: Business | null;
  mode: "pre-call" | "during-call" | "post-call" | "general";
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const OBJECTION_BUTTONS = [
  "Too Expensive",
  "Not Interested",
  "Already Have Yelp/Google",
  "Need to Think About It",
  "Bad Experience Before",
];

const TIER_OPTIONS = [
  { value: "verified_platinum", label: "Verified ($99/mo)" },
  { value: "platinum_partner", label: "Partner ($799/mo)" },
  { value: "platinum_elite", label: "Elite ($3,500/mo)" },
];

export default function AIAssistantPanel({ business, mode, isOpen, onClose }: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [objectionOpen, setObjectionOpen] = useState(false);
  const [postCallNotes, setPostCallNotes] = useState("");
  const [disposition, setDisposition] = useState("");
  const [roiTier, setRoiTier] = useState("verified_platinum");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  // Auto-fetch pre-call briefing
  useEffect(() => {
    if (isOpen && activeTab === "pre-call" && business?.id && !aiResponse) {
      fetchPreCall();
    }
  }, [isOpen, activeTab, business?.id]);

  // Ctrl+K handler is in the parent component

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, activeTab]);

  async function fetchPreCall() {
    if (!business?.id) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/admin/ai/pre-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: business.id }),
      });
      const data = await res.json();
      setAiResponse(data.briefing || data.error || "No response");
    } catch {
      setAiResponse("AI assistant is offline. Check connection.");
    }
    setLoading(false);
  }

  async function handleObjection(objection: string) {
    if (!business?.id) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/admin/ai/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: business.id, objection_type: objection }),
      });
      const data = await res.json();
      setAiResponse(data.response || data.error || "No response");
    } catch {
      setAiResponse("AI assistant is offline. Check connection.");
    }
    setLoading(false);
    setObjectionOpen(false);
  }

  async function handleROI() {
    if (!business?.id) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/admin/ai/roi-calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: business.id, tier: roiTier }),
      });
      const data = await res.json();
      setAiResponse(data.calculation || data.error || "No response");
    } catch {
      setAiResponse("AI assistant is offline. Check connection.");
    }
    setLoading(false);
  }

  async function handlePostCall() {
    if (!business?.id || !postCallNotes) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/admin/ai/post-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          raw_notes: postCallNotes,
          disposition: disposition || "follow_up",
        }),
      });
      const data = await res.json();
      setAiResponse(data.structured_notes || data.error || "No response");
    } catch {
      setAiResponse("AI assistant is offline. Check connection.");
    }
    setLoading(false);
  }

  async function handleDraftEmail(emailType: string) {
    if (!business?.id) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/admin/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          context: postCallNotes || aiResponse,
          email_type: emailType,
        }),
      });
      const data = await res.json();
      const email = data.subject
        ? `**Subject:** ${data.subject}\n**To:** ${data.to || business.email || "N/A"}\n\n${data.body}`
        : data.error || "No response";
      setAiResponse(email);
    } catch {
      setAiResponse("AI assistant is offline. Check connection.");
    }
    setLoading(false);
  }

  async function handleChat() {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText("");
    const newHistory = [...chatHistory, { role: "user" as const, content: userMsg }];
    setChatHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          business_id: business?.id || null,
          history: newHistory.slice(-10),
        }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.response || data.error || "No response" }]);
    } catch {
      setChatHistory([...newHistory, { role: "assistant", content: "AI assistant is offline." }]);
    }
    setLoading(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleVoiceNote() {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPostCallNotes(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  const tabs = [
    { key: "pre-call", label: "Pre-Call", icon: ClipboardList },
    { key: "during-call", label: "On Call", icon: Phone },
    { key: "post-call", label: "Post-Call", icon: PhoneOff },
    { key: "general", label: "Chat", icon: MessageSquare },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-[420px] flex-col border-l border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pd-gold" />
            <h3 className="font-heading text-lg font-bold text-white">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Business Context */}
        {business && (
          <div className="border-b border-white/10 px-4 py-3">
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="font-medium text-white">{business.name}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                {business.categories?.name && <span>{business.categories.name}</span>}
                {business.city && <span>&middot; {business.city}</span>}
                {business.tier && business.tier !== "free" && (
                  <span className="rounded bg-pd-gold/10 px-1.5 text-pd-gold">
                    {business.tier.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {business.rating && (
                  <span className="text-yellow-400">
                    {"★".repeat(Math.round(business.rating))} {business.rating}
                  </span>
                )}
                {business.lead_score !== undefined && (
                  <span className={business.lead_score > 60 ? "text-orange-400" : "text-gray-500"}>
                    Score: {business.lead_score}
                  </span>
                )}
                {business.outreach_status && (
                  <span className="text-gray-500">
                    {business.outreach_status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key as any); setAiResponse(""); }}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                activeTab === t.key
                  ? "border-b-2 border-pd-gold text-pd-gold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* PRE-CALL TAB */}
          {activeTab === "pre-call" && (
            <div className="space-y-4">
              {!business ? (
                <p className="text-center text-sm text-gray-500">Select a business to get a pre-call briefing</p>
              ) : (
                <>
                  <button
                    onClick={fetchPreCall}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-pd-gold/10 px-4 py-2.5 text-sm font-medium text-pd-gold hover:bg-pd-gold/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                    {loading ? "Generating Briefing..." : "Generate Pre-Call Briefing"}
                  </button>
                  {aiResponse && <AIResponseBlock text={aiResponse} onCopy={() => copyToClipboard(aiResponse)} copied={copied} />}
                </>
              )}
            </div>
          )}

          {/* DURING-CALL TAB */}
          {activeTab === "during-call" && (
            <div className="space-y-4">
              {/* Objection Help */}
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <button
                  onClick={() => setObjectionOpen(!objectionOpen)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Objection Help</span>
                  </div>
                  {objectionOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                </button>
                {objectionOpen && (
                  <div className="border-t border-white/10 p-3 space-y-2">
                    <p className="text-xs text-gray-500 mb-2">What objection are you hearing?</p>
                    {OBJECTION_BUTTONS.map(obj => (
                      <button
                        key={obj}
                        onClick={() => handleObjection(obj)}
                        disabled={loading}
                        className="w-full rounded-lg bg-white/[0.03] px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/[0.06] disabled:opacity-50"
                      >
                        {obj}
                      </button>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Custom objection..."
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                        onKeyDown={e => {
                          if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                            handleObjection((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ROI Calculator */}
              <div className="rounded-lg border border-white/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Quick ROI</span>
                </div>
                <select
                  value={roiTier}
                  onChange={e => setRoiTier(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {TIER_OPTIONS.map(t => (
                    <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleROI}
                  disabled={loading || !business}
                  className="w-full rounded-lg bg-green-600/20 px-3 py-2 text-sm font-medium text-green-400 hover:bg-green-600/30 disabled:opacity-50"
                >
                  {loading ? "Calculating..." : "Show ROI"}
                </button>
              </div>

              {/* Send Info Email */}
              <button
                onClick={() => handleDraftEmail("intro")}
                disabled={loading || !business}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.03] disabled:opacity-50"
              >
                <Mail className="h-4 w-4" /> Draft Info Email
              </button>

              {aiResponse && <AIResponseBlock text={aiResponse} onCopy={() => copyToClipboard(aiResponse)} copied={copied} />}
            </div>
          )}

          {/* POST-CALL TAB */}
          {activeTab === "post-call" && (
            <div className="space-y-4">
              {/* Voice Note */}
              <div className="flex gap-2">
                <button
                  onClick={toggleVoiceNote}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    isRecording
                      ? "bg-red-600/20 text-red-400 animate-pulse"
                      : "bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]"
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? "Stop Recording" : "Voice Note"}
                </button>
                <select
                  value={disposition}
                  onChange={e => setDisposition(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="" className="bg-gray-900">Disposition...</option>
                  <option value="appointment_set" className="bg-gray-900">Appointment Set</option>
                  <option value="follow_up" className="bg-gray-900">Follow Up</option>
                  <option value="not_interested" className="bg-gray-900">Not Interested</option>
                  <option value="voicemail" className="bg-gray-900">Voicemail</option>
                  <option value="no_answer" className="bg-gray-900">No Answer</option>
                  <option value="closed_won" className="bg-gray-900">Closed Won</option>
                  <option value="closed_lost" className="bg-gray-900">Closed Lost</option>
                </select>
              </div>

              {/* Notes */}
              <textarea
                value={postCallNotes}
                onChange={e => setPostCallNotes(e.target.value)}
                placeholder="Type or speak your call notes... (e.g. 'talked to maria, she's interested but needs to check with husband, wants partner tier, call back thursday')"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handlePostCall}
                  disabled={loading || !postCallNotes || !business}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pd-purple/20 px-3 py-2.5 text-sm font-medium text-pd-purple hover:bg-pd-purple/30 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  Process Notes
                </button>
                <button
                  onClick={() => handleDraftEmail("follow_up")}
                  disabled={loading || !business}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-gray-400 hover:bg-white/[0.03] disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
              </div>

              {aiResponse && <AIResponseBlock text={aiResponse} onCopy={() => copyToClipboard(aiResponse)} copied={copied} />}
            </div>
          )}

          {/* GENERAL CHAT TAB */}
          {activeTab === "general" && (
            <div className="space-y-3">
              {chatHistory.length === 0 && (
                <div className="rounded-lg bg-white/[0.02] p-4 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-pd-gold/50" />
                  <p className="mt-2 text-sm text-gray-500">
                    Ask me anything about the platform, pitch strategies, business data, or help drafting messages.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {[
                      "What's the best pitch for a day spa?",
                      "Draft a text follow-up for this business",
                      "What businesses have the highest lead scores?",
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInputText(q); }}
                        className="block w-full rounded-lg bg-white/[0.03] px-3 py-2 text-left text-xs text-gray-400 hover:bg-white/[0.06]"
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-pd-gold/10 text-pd-gold"
                      : "bg-white/[0.03] text-gray-300"
                  }`}>
                    <SimpleMarkdown text={msg.content} />
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="mt-1 flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input (for general chat) */}
        {activeTab === "general" && (
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                placeholder="Ask Frank's AI assistant..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-pd-gold/30"
              />
              <button
                onClick={handleChat}
                disabled={loading || !inputText.trim()}
                className="rounded-lg bg-pd-gold px-3 py-2.5 text-black hover:bg-pd-gold/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple markdown renderer for AI responses
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-bold text-white">{line.replace(/\*\*/g, "")}</p>;
        }
        if (line.startsWith("## ")) {
          return <p key={i} className="font-bold text-white mt-2">{line.slice(3)}</p>;
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return <p key={i} className="pl-3">&bull; {renderInline(line.slice(2))}</p>;
        }
        if (line.startsWith("* ")) {
          return <p key={i} className="pl-3">&bull; {renderInline(line.slice(2))}</p>;
        }
        if (line.match(/^\d+\.\s/)) {
          return <p key={i} className="pl-3">{renderInline(line)}</p>;
        }
        if (line.trim() === "") {
          return <br key={i} />;
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function AIResponseBlock({ text, onCopy, copied }: { text: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-pd-gold">
          <Sparkles className="h-3 w-3" /> AI Response
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white"
        >
          {copied ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="text-sm text-gray-300">
        <SimpleMarkdown text={text} />
      </div>
    </div>
  );
}
