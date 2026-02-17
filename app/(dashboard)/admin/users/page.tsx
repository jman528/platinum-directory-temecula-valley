import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">User Management</h1>
      <div className="mt-8 glass-card p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">User management coming soon</p>
        <p className="mt-2 text-sm text-gray-500">Manage customers, business owners, and admins via Clerk dashboard.</p>
      </div>
    </div>
  );
}
