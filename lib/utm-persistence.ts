/**
 * Client-side UTM parameter persistence.
 * Reads tracking params from the pd_tracking cookie (set by middleware)
 * and provides helpers to append them to internal URLs.
 */

export function getStoredTrackingParams(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/pd_tracking=([^;]+)/);
  if (!match) return {};
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

export function getVisitorId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/pd_visitor_id=([^;]+)/);
  return match?.[1] || "";
}

export function getRefCode(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/pd_ref=([^;]+)/);
  return match?.[1] || "";
}

export function getAffCode(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/pd_aff=([^;]+)/);
  return match?.[1] || "";
}

export function appendTrackingParams(url: string): string {
  const params = getStoredTrackingParams();
  if (Object.keys(params).length === 0) return url;

  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    for (const [key, value] of Object.entries(params)) {
      if (!parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, value);
      }
    }
    // Return just pathname + search for internal URLs
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}
