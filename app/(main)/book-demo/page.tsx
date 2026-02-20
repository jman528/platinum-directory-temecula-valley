"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function BookDemoPage() {
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    priority: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/booking/available-slots")
      .then(r => r.json())
      .then(d => setSlots(d.slots || []));
  }, []);

  // Group slots by date
  const slotsByDate: Record<string, string[]> = {};
  slots.forEach(s => {
    const date = new Date(s).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(s);
  });
  const dates = Object.keys(slotsByDate);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !form.name || !form.email) return;
    setSubmitting(true);
    try {
      await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferred_time: selectedSlot,
        }),
      });
      setSubmitted(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none text-sm";

  if (submitted) {
    return (
      <div className="premium-bg min-h-screen flex items-center justify-center">
        <div className="glass-card max-w-md p-10 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="mt-6 font-heading text-2xl font-bold text-white">Demo Scheduled!</h1>
          <p className="mt-2 text-gray-400">
            We&apos;ll see you on{" "}
            <span className="text-pd-gold">
              {new Date(selectedSlot).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            {" "}at{" "}
            <span className="text-pd-gold">
              {new Date(selectedSlot).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </p>
          <p className="mt-4 text-sm text-gray-500">A confirmation has been sent to {form.email}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-bg min-h-screen py-16">
      <div className="container max-w-3xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-gold/20">
            <Calendar className="h-8 w-8 text-pd-gold" />
          </div>
          <h1 className="mt-4 font-heading text-3xl font-bold text-white md:text-4xl">
            Schedule a Free Demo
          </h1>
          <p className="mt-2 text-gray-400">
            See how Platinum Directory can help grow your business. 30-minute personalized walkthrough.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {/* Date Picker */}
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">Pick a Date</h3>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {dates.map(date => (
                <button
                  key={date}
                  type="button"
                  onClick={() => { setSelectedDate(date); setSelectedSlot(""); }}
                  className={`flex-shrink-0 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                    selectedDate === date
                      ? "bg-pd-gold text-pd-dark font-bold"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold text-white">Pick a Time</h3>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slotsByDate[selectedDate]?.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedSlot === slot
                        ? "bg-pd-gold text-pd-dark font-bold"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {new Date(slot).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {selectedSlot && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-heading text-lg font-bold text-white">Your Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className={inputClass} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Business Name</label>
                  <input type="text" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">What matters most to you?</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                  <option value="" className="bg-pd-dark">Select...</option>
                  <option value="more_customers" className="bg-pd-dark">More customers</option>
                  <option value="better_reviews" className="bg-pd-dark">Better reviews</option>
                  <option value="competing" className="bg-pd-dark">Competing with bigger businesses</option>
                  <option value="smart_offers" className="bg-pd-dark">Smart Offers</option>
                  <option value="all" className="bg-pd-dark">All of the above</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-glow w-full rounded-xl bg-pd-gold px-6 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light disabled:opacity-50"
              >
                {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <>Confirm Booking <ArrowRight className="inline h-4 w-4 ml-1" /></>}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
