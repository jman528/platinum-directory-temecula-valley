import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">System Settings</h1>
      <div className="mt-8 glass-card p-12 text-center">
        <Settings className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">System settings coming soon</p>
      </div>
    </div>
  );
}
