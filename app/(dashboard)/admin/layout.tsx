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
  ShieldAlert,
  BarChart3,
  Megaphone,
  Bot,
  UsersRound,
  Flag,
  Gift,
  CreditCard,
  Bell,
  Search,
  Ticket,
  Phone,
  Palette,
  Share2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/businesses", label: "Businesses", icon: Store },
  { href: "/admin/businesses/import", label: "Import", icon: Upload },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/advertisers", label: "Advertisers", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/offers", label: "Smart Offers", icon: Tag },
  { href: "/admin/giveaways", label: "Giveaways", icon: Gift },
  { href: "/admin/points", label: "Points & Multipliers", icon: Coins },
  { href: "/admin/ai", label: "AI Agents & Credits", icon: Bot },
  { href: "/admin/team", label: "Team", icon: UsersRound },
  { href: "/admin/flags", label: "Feature Flags", icon: Flag },
  { href: "/admin/discounts", label: "Discount Codes", icon: Ticket },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/admin/banners", label: "Banners", icon: Palette },
  { href: "/admin/syndication", label: "Syndication", icon: Share2 },
  { href: "/admin/citations", label: "Citations", icon: FileText },
  { href: "/admin/dialer", label: "Dialer", icon: Phone },
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
      {/* Admin Top Bar */}
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
          <span className="ml-2 rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-green-400">
            Production
          </span>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users, businesses..."
              className="w-48 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <button className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Admin sub-navigation */}
      <nav className="flex flex-wrap gap-1 rounded-xl border border-pd-purple/20 bg-pd-dark/50 p-1">
        {adminNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/admin";
          const isOverviewActive = item.exact && pathname === "/admin";
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
