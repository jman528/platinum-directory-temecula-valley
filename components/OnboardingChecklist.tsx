"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Phone, User, Gift, Share2, X, Loader2 } from "lucide-react";
import { POINTS_CONFIG, pointsToDollars } from "@/lib/points-config";

interface Step {
  key: string;
  label: string;
  points: number;
  icon: React.ElementType;
  href?: string;
  btnLabel: string;
}

const STEPS: Step[] = [
  { key: "account_created", label: "Create Account", points: POINTS_CONFIG.SIGNUP_BONUS, icon: CheckCircle, btnLabel: "Done" },
  { key: "phone_verified", label: "Verify Phone", points: POINTS_CONFIG.PHONE_VERIFY_BONUS, icon: Phone, href: "/dashboard/settings", btnLabel: "Verify Now" },
  { key: "profile_complete", label: "Complete Profile", points: POINTS_CONFIG.COMPLETE_PROFILE_BONUS, icon: User, href: "/dashboard/settings", btnLabel: "Complete Profile" },
  { key: "first_giveaway", label: "Enter Giveaway", points: POINTS_CONFIG.FIRST_GIVEAWAY_ENTRY, icon: Gift, href: "/giveaway", btnLabel: "Enter Now" },
  { key: "first_share", label: "Share on Social", points: POINTS_CONFIG.FIRST_SHARE_BONUS, icon: Share2, href: "/dashboard/rewards", btnLabel: "Share Now" },
];

const TOTAL_POINTS = STEPS.reduce((sum, s) => sum + s.points, 0);

export default function OnboardingChecklist() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, onboarding_steps, created_at")
        .eq("id", user.id)
        .single();

      if (!profile) { setLoading(false); return; }

      // If already completed and more than 24 hours ago, hide
      if (profile.onboarding_completed) {
        setAllDone(true);
        setLoading(false);
        return;
      }

      const steps = (profile.onboarding_steps as Record<string, boolean>) || {};
      // Account creation is always complete
      steps.account_created = true;
      setCompletedSteps(new Set(Object.keys(steps).filter((k) => steps[k])));
      setLoading(false);
    }
    load();
  }, []);

  if (loading || dismissed || allDone) return null;

  const completed = completedSteps.size;
  const earnedPoints = STEPS.filter((s) => completedSteps.has(s.key)).reduce((sum, s) => sum + s.points, 0);
  const remainingPoints = TOTAL_POINTS - earnedPoints;
  const progress = (completed / STEPS.length) * 100;

  if (completed === STEPS.length) return null;

  return (
    <div className="glass-card mb-6 overflow-hidden border-pd-gold/20">
      <div className="flex items-center justify-between bg-pd-gold/5 px-5 py-3">
        <div>
          <p className="text-sm font-medium text-pd-gold">Welcome Bonus</p>
          <p className="text-xs text-gray-400">
            {completed}/{STEPS.length} complete — ${pointsToDollars(earnedPoints)} earned, ${pointsToDollars(remainingPoints)} to go!
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-500 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-pd-gold to-pd-purple transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="divide-y divide-white/5 px-5">
        {STEPS.map((step) => {
          const done = completedSteps.has(step.key);
          return (
            <div key={step.key} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  done ? "bg-green-500/20" : "bg-white/5"
                }`}>
                  {done ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <step.icon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className={`text-sm ${done ? "text-green-400 line-through" : "text-white"}`}>{step.label}</p>
                  <p className="text-xs text-gray-500">+{step.points.toLocaleString()} pts (${pointsToDollars(step.points)})</p>
                </div>
              </div>
              {!done && step.href && (
                <button
                  onClick={() => router.push(step.href!)}
                  className="rounded-lg bg-pd-gold/15 px-3 py-1.5 text-xs font-medium text-pd-gold hover:bg-pd-gold/25"
                >
                  {step.btnLabel} →
                </button>
              )}
              {done && (
                <span className="text-xs font-medium text-green-400">Earned!</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
