import { createClient } from "@/lib/supabase/server";
import type { FeatureFlag } from "@/types";

let flagCache: Map<string, boolean> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchFlags(): Promise<Map<string, boolean>> {
  const now = Date.now();
  if (flagCache && now - cacheTimestamp < CACHE_TTL) {
    return flagCache;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("flag_key, enabled");

  if (error) {
    console.error("Failed to fetch feature flags:", error);
    return flagCache ?? new Map();
  }

  const flags = new Map<string, boolean>();
  for (const flag of data as FeatureFlag[]) {
    flags.set(flag.flag_key, flag.enabled);
  }

  flagCache = flags;
  cacheTimestamp = now;
  return flags;
}

export async function isEnabled(flagKey: string): Promise<boolean> {
  const flags = await fetchFlags();
  return flags.get(flagKey) ?? false;
}

export function invalidateCache() {
  flagCache = null;
  cacheTimestamp = 0;
}
