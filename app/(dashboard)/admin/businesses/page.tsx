import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import Link from "next/link";
import { Shield, Upload } from "lucide-react";
import type { Business } from "@/types";

const ALL_BUSINESSES_QUERY = `*[_type == "business"] | order(_createdAt desc) [0...50] {
  _id, name, slug, city, tier, status, isVerified, ownerEmail, _createdAt
}`;

export default async function AdminBusinessesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const role = user.publicMetadata?.role as string;
  if (role !== "admin") redirect("/dashboard");

  const { data: businesses } = await sanityFetch({ query: ALL_BUSINESSES_QUERY });
  const bizList = (businesses as any[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Business Management</h1>
        <Link href="/admin/businesses/import" className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
          <Upload className="h-4 w-4" /> Import
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pd-purple/20 text-left">
              <th className="pb-3 text-gray-400">Business</th>
              <th className="pb-3 text-gray-400">City</th>
              <th className="pb-3 text-gray-400">Tier</th>
              <th className="pb-3 text-gray-400">Status</th>
              <th className="pb-3 text-gray-400">Owner</th>
            </tr>
          </thead>
          <tbody>
            {bizList.map((biz: any) => (
              <tr key={biz._id} className="border-b border-pd-purple/10">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{biz.name}</span>
                    {biz.isVerified && <Shield className="h-3 w-3 text-pd-gold" />}
                  </div>
                </td>
                <td className="py-3 text-gray-400">{biz.city || "—"}</td>
                <td className="py-3"><span className="capitalize text-pd-purple-light">{biz.tier?.replace(/_/g, " ")}</span></td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${biz.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {biz.status}
                  </span>
                </td>
                <td className="py-3 text-gray-400">{biz.ownerEmail || "Unclaimed"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
