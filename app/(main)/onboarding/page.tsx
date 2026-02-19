"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/sign-in");
      else setUser(user);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (user) {
      await supabase.from("profiles").update({
        phone: formData.get("phone") as string,
        user_type: isBusinessOwner ? "business_owner" : "customer",
      }).eq("id", user.id);
    }

    if (isBusinessOwner) {
      router.push("/claim");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="font-heading text-2xl font-bold text-white">Welcome to Platinum Directory</h1>
        <p className="mt-2 text-gray-400">Tell us a bit about yourself.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Phone Number</label>
            <input type="tel" name="phone" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-pd-purple/20 bg-pd-dark/50 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isBusinessOwner}
              onChange={(e) => setIsBusinessOwner(e.target.checked)}
              className="rounded"
            />
            <div>
              <p className="text-sm font-medium text-white">I&apos;m a business owner</p>
              <p className="text-xs text-gray-400">I want to list or claim my business</p>
            </div>
          </label>
          <button type="submit" className="w-full rounded-lg bg-pd-blue py-2 font-medium text-white hover:bg-pd-blue-dark">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
