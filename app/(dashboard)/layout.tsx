import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const tier = (user.publicMetadata?.tier as string) || "free";

  return (
    <div className="flex min-h-screen bg-pd-dark">
      <DashboardSidebar tier={tier} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
