import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Shield, ExternalLink } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: biz } = await supabase
    .from("businesses")
    .select("tier, subscription_status")
    .eq("owner_user_id", user.id)
    .limit(1)
    .single();

  const tier = biz?.tier || "free";

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
          <p className="text-gray-400">Your subscription is managed through Stripe.</p>
          <p className="mt-2 text-sm text-gray-500">
            Status: <span className="capitalize text-white">{biz?.subscription_status || "active"}</span>
          </p>
        </div>
      )}
    </div>
  );
}
