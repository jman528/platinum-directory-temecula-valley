"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  MessageSquare,
  BarChart3,
  Tag,
  CreditCard,
  Settings,
  ArrowLeft,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings", icon: Store },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/promotions", label: "Smart Offers", icon: Tag },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ tier, userType }: { tier: string; userType?: string }) {
  const isAdmin = userType === "admin" || userType === "super_admin";
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-pd-purple/20 bg-[#0D1321] lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-pd-purple/20 p-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <h2 className="mt-3 font-heading text-lg font-bold text-white">Dashboard</h2>
          <div className="mt-1 flex items-center gap-1">
            <Shield className="h-3 w-3 text-pd-gold" />
            <span className="text-xs text-pd-gold capitalize">
              {tier.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-pd-purple/15 text-white"
                    : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-2 border-t border-pd-purple/20" />
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-pd-gold/15 text-pd-gold"
                    : "text-pd-gold/70 hover:bg-pd-gold/10 hover:text-pd-gold"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        {tier === "free" && (
          <div className="m-3 rounded-lg border border-pd-gold/30 bg-pd-gold/5 p-3">
            <p className="text-xs font-medium text-pd-gold">Upgrade Your Plan</p>
            <p className="mt-1 text-xs text-gray-400">
              Get verified, unlock features, and attract more customers.
            </p>
            <Link
              href="/pricing"
              className="mt-2 block rounded-md bg-pd-gold px-3 py-1.5 text-center text-xs font-medium text-pd-dark transition-colors hover:bg-pd-gold-light"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
