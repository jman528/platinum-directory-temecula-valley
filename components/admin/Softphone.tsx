"use client";

import { useState, useEffect, useRef } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Pause, Play,
  X, Loader2, Clock,
} from "lucide-react";

interface SoftphoneProps {
  phoneNumber?: string;
  businessName?: string;
  onCallEnd?: (duration: number) => void;
}

export default function Softphone({ phoneNumber, businessName, onCallEnd }: SoftphoneProps) {
  const [state, setState] = useState<"idle" | "dialing" | "ringing" | "in_call" | "wrap_up">("idle");
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [duration, setDuration] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state === "in_call") {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  async function startCall() {
    if (!phoneNumber) return;
    setState("dialing");

    try {
      // Get Twilio token
      const tokenRes = await fetch("/api/twilio/token");
      const { token } = await tokenRes.json();

      if (!token) {
        setState("idle");
        return;
      }

      // In production, initialize Twilio Device here
      // For now, simulate the call flow
      setTimeout(() => setState("ringing"), 1000);
      setTimeout(() => setState("in_call"), 3000);
    } catch {
      setState("idle");
    }
  }

  function endCall() {
    setState("wrap_up");
    onCallEnd?.(duration);
    setDuration(0);
    setMuted(false);
    setOnHold(false);
  }

  function dismiss() {
    setState("idle");
    setDuration(0);
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (state === "idle" && !phoneNumber) return null;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-lg shadow-green-600/20 hover:bg-green-700"
      >
        <Phone className="h-6 w-6 text-white" />
        {state === "in_call" && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {formatTime(duration)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-pd-dark shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-pd-gold" />
          <span className="text-sm font-medium text-white">Softphone</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)} className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white">
            <Pause className="h-3 w-3" />
          </button>
          <button onClick={dismiss} className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {businessName && (
          <p className="text-sm font-medium text-white">{businessName}</p>
        )}
        <p className="text-sm text-gray-400">{phoneNumber}</p>

        {/* Status */}
        <div className="mt-3 text-center">
          {state === "idle" && (
            <button
              onClick={startCall}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-6 w-6 text-white" />
            </button>
          )}
          {state === "dialing" && (
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
          {state === "ringing" && (
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <Phone className="h-5 w-5 animate-bounce" />
              <span className="text-sm">Ringing...</span>
            </div>
          )}
          {state === "in_call" && (
            <div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(duration)}</span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setMuted(!muted)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    muted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
                  }`}
                >
                  {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setOnHold(!onHold)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    onHold ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white"
                  }`}
                >
                  {onHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button
                  onClick={endCall}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          )}
          {state === "wrap_up" && (
            <div>
              <p className="text-sm text-gray-400">Call ended</p>
              <button
                onClick={dismiss}
                className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
