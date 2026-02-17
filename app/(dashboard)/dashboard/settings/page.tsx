import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
      <div className="mt-8 glass-card p-12 text-center">
        <Settings className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">Business settings coming soon</p>
        <p className="mt-2 text-sm text-gray-500">Manage your business profile, notifications, and preferences.</p>
      </div>
    </div>
  );
}
