import { Tag } from "lucide-react";
import Link from "next/link";

export default function DashboardOffersPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">
        Smart Offers
      </h1>
      <div className="mt-8 glass-card p-12 text-center">
        <Tag className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">
          Smart Offers coming soon
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Create irresistible offers to drive foot traffic and online sales.
        </p>
        <Link
          href="/dashboard/promotions"
          className="mt-6 inline-block rounded-lg bg-pd-blue px-6 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
        >
          Manage Promotions
        </Link>
      </div>
    </div>
  );
}
