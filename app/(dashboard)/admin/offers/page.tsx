import { Tag } from "lucide-react";

export default function AdminOffersPage() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">
        Smart Offers
      </h2>
      <div className="mt-8 glass-card p-12 text-center">
        <Tag className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">
          Smart Offers management coming soon
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Create and manage offers across all businesses.
        </p>
      </div>
    </div>
  );
}
