"use client";

import { useState, useRef, useEffect } from "react";
import { Check, RotateCcw } from "lucide-react";

interface DigitalSignatureProps {
  tier: string;
  monthlyPrice: number;
  setupFee: number;
  businessName: string;
  onSubmit: (data: SignatureData) => void;
  submitting: boolean;
}

export interface SignatureData {
  businessLegalName: string;
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signerPhone: string;
  businessAddress: string;
  signatureData: string;
  signatureType: "typed" | "drawn";
  consents: boolean[];
}

export default function DigitalSignature({
  tier,
  monthlyPrice,
  setupFee,
  businessName,
  onSubmit,
  submitting,
}: DigitalSignatureProps) {
  const [sigMode, setSigMode] = useState<"typed" | "drawn">("typed");
  const [form, setForm] = useState({
    businessLegalName: businessName || "",
    signerName: "",
    signerTitle: "",
    signerEmail: "",
    signerPhone: "",
    businessAddress: "",
  });
  const [typedSig, setTypedSig] = useState("");
  const [consents, setConsents] = useState([false, false, false, false]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [sigMode]);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    setHasDrawn(true);
  }

  function endDraw() {
    isDrawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setHasDrawn(false);
  }

  function toggleConsent(idx: number) {
    setConsents(prev => prev.map((c, i) => (i === idx ? !c : c)));
  }

  const allFieldsFilled =
    form.businessLegalName &&
    form.signerName &&
    form.signerEmail &&
    form.signerPhone &&
    (sigMode === "typed" ? typedSig.length >= 2 : hasDrawn);
  const allConsents = consents.every(Boolean);
  const canSubmit = allFieldsFilled && allConsents && !submitting;

  function handleSubmit() {
    let signatureData = "";
    if (sigMode === "typed") {
      signatureData = typedSig;
    } else {
      const canvas = canvasRef.current;
      if (canvas) signatureData = canvas.toDataURL("image/png");
    }

    onSubmit({
      ...form,
      signatureData,
      signatureType: sigMode,
      consents,
    });
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-gold/40 focus:outline-none text-sm";

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-xl font-bold text-white">Signature & Authorization</h3>

      {/* Business Info Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Business Legal Name *</label>
          <input
            type="text"
            value={form.businessLegalName}
            onChange={e => setForm({ ...form, businessLegalName: e.target.value })}
            className={inputClass}
            placeholder="Business legal name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Your Full Name *</label>
          <input
            type="text"
            value={form.signerName}
            onChange={e => setForm({ ...form, signerName: e.target.value })}
            className={inputClass}
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Title / Position</label>
          <input
            type="text"
            value={form.signerTitle}
            onChange={e => setForm({ ...form, signerTitle: e.target.value })}
            className={inputClass}
            placeholder="e.g. Owner, Manager"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Email Address *</label>
          <input
            type="email"
            value={form.signerEmail}
            onChange={e => setForm({ ...form, signerEmail: e.target.value })}
            className={inputClass}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Phone Number *</label>
          <input
            type="tel"
            value={form.signerPhone}
            onChange={e => setForm({ ...form, signerPhone: formatPhone(e.target.value) })}
            className={inputClass}
            placeholder="(951) 555-1234"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Business Address</label>
          <input
            type="text"
            value={form.businessAddress}
            onChange={e => setForm({ ...form, businessAddress: e.target.value })}
            className={inputClass}
            placeholder="123 Main St, Temecula, CA"
          />
        </div>
      </div>

      {/* Signature Mode Selector */}
      <div>
        <label className="mb-2 block text-sm text-gray-400">Signature *</label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSigMode("typed")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
              sigMode === "typed"
                ? "bg-pd-gold/20 text-pd-gold border border-pd-gold/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Type Signature
          </button>
          <button
            onClick={() => setSigMode("drawn")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
              sigMode === "drawn"
                ? "bg-pd-gold/20 text-pd-gold border border-pd-gold/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Draw Signature
          </button>
        </div>

        {sigMode === "typed" ? (
          <div>
            <input
              type="text"
              value={typedSig}
              onChange={e => setTypedSig(e.target.value)}
              className={inputClass}
              placeholder="Type your full name"
            />
            {typedSig && (
              <div className="mt-3 rounded-lg border border-white/10 bg-white p-4">
                <p
                  className="text-2xl text-black"
                  style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
                >
                  {typedSig}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="rounded-lg border border-white/10 bg-white overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <button
              onClick={clearCanvas}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-3">
        {[
          "I have read and agree to the terms of this Membership Agreement",
          `I am authorized to enter into this agreement on behalf of ${form.businessLegalName || "[Business Name]"}`,
          `I understand that the setup fee of $${setupFee.toLocaleString()} is non-refundable`,
          `I authorize recurring monthly charges of $${monthlyPrice.toLocaleString()}/month to my payment method`,
        ].map((text, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => toggleConsent(i)}
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                consents[i]
                  ? "border-pd-gold bg-pd-gold/20"
                  : "border-white/20 bg-white/5 group-hover:border-white/40"
              }`}
            >
              {consents[i] && <Check className="h-3 w-3 text-pd-gold" />}
            </div>
            <span className="text-sm text-gray-300">{text}</span>
          </label>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-lg bg-gradient-to-r from-pd-gold to-yellow-500 px-6 py-4 text-lg font-bold text-black hover:from-pd-gold/90 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {submitting ? "Processing..." : "Sign & Continue to Payment →"}
      </button>
    </div>
  );
}
