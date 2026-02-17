import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Platinum Directory Temecula Valley.",
};

export default function ContactPage() {
  return (
    <div className="container py-16">
      <h1 className="font-heading text-4xl font-bold text-white">Contact Us</h1>
      <p className="mt-4 text-gray-400">Have a question? We&apos;d love to hear from you.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="glass-card space-y-6 p-8">
          <h2 className="font-heading text-xl font-bold text-white">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Name</label>
              <input type="text" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Email</label>
              <input type="email" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Message</label>
              <textarea rows={4} className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
            </div>
            <button type="submit" className="rounded-lg bg-pd-blue px-6 py-2 font-medium text-white transition-colors hover:bg-pd-blue-dark">
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card flex items-center gap-4 p-6">
            <Mail className="h-6 w-6 text-pd-blue" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">info@platinumdirectory.com</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-6">
            <Phone className="h-6 w-6 text-pd-blue" />
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-white">(951) 555-0100</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-6">
            <MapPin className="h-6 w-6 text-pd-blue" />
            <div>
              <p className="text-sm text-gray-400">Location</p>
              <p className="text-white">Temecula, CA 92590</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
