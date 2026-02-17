import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container py-16">
      <h1 className="font-heading text-4xl font-bold text-white">Privacy Policy</h1>
      <div className="mt-8 max-w-3xl space-y-6 text-gray-300">
        <p>Last updated: February 2026</p>
        <h2 className="font-heading text-xl font-bold text-white">Information We Collect</h2>
        <p>We collect information you provide directly, including name, email, phone number, and ZIP code when you create an account, enter giveaways, or submit inquiries.</p>
        <h2 className="font-heading text-xl font-bold text-white">How We Use Information</h2>
        <p>We use your information to provide our directory services, process giveaway entries, connect consumers with businesses, and improve our platform.</p>
        <h2 className="font-heading text-xl font-bold text-white">Data Sharing</h2>
        <p>We share your inquiry information with businesses you contact through our platform. We do not sell personal data to third parties.</p>
        <h2 className="font-heading text-xl font-bold text-white">Contact</h2>
        <p>For privacy-related questions, contact us at privacy@platinumdirectory.com.</p>
      </div>
    </div>
  );
}
