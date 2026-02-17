import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Shield, ExternalLink } from "lucide-react";

export default async function BillingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const tier = (user.publicMetadata?.tier as string) || "free";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Billing</h1>

      <div className="mt-6 glass-card p-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-pd-blue" />
          <div>
            <p className="font-medium text-white">Current Plan</p>
            <p className="flex items-center gap-2 text-lg capitalize text-pd-gold">
              <Shield className="h-4 w-4" />
              {tier.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      {tier === "free" ? (
        <div className="mt-6 glass-card border-pd-gold/30 p-6 text-center">
          <p className="text-gray-300">Upgrade to unlock more features and attract more customers.</p>
          <Link href="/pricing" className="mt-4 inline-block rounded-lg bg-pd-gold px-6 py-2 font-medium text-pd-dark hover:bg-pd-gold-light">
            View Plans
          </Link>
        </div>
      ) : (
        <div className="mt-6 glass-card p-6">
          <p className="text-gray-400">Your subscription is managed through GoHighLevel.</p>
          <a href="https://lk.platinumdirectorytemeculavalley.com" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
            Manage Subscription <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
