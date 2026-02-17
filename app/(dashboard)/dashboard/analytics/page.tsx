import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Analytics</h1>
      <div className="mt-8 glass-card p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">Analytics coming soon</p>
        <p className="mt-2 text-sm text-gray-500">Profile views, lead tracking, and performance metrics.</p>
      </div>
    </div>
  );
}
