"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Upload,
  Users,
  Coins,
  Tag,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/businesses", label: "Businesses", icon: Store },
  { href: "/admin/businesses/import", label: "Import", icon: Upload },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/points", label: "Points", icon: Coins },
  { href: "/admin/offers", label: "Smart Offers", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {/* Admin header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-gray-600">/</span>
          <h1 className="font-heading text-lg font-bold text-pd-gold">
            Admin Panel
          </h1>
        </div>
      </div>

      {/* Admin sub-navigation */}
      <nav className="flex flex-wrap gap-1 rounded-xl border border-pd-purple/20 bg-pd-dark/50 p-1">
        {adminNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/admin";
          const isOverviewActive =
            item.exact && pathname === "/admin";
          const active = isActive || isOverviewActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-pd-purple/20 text-white"
                  : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      {children}
    </div>
  );
}
