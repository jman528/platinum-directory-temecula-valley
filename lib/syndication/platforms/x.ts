// lib/syndication/platforms/x.ts
// X (Twitter) posting via API v2

import crypto from "crypto";

interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

function generateOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string> = {}
): string {
  const apiKey = process.env.X_API_KEY!;
  const apiSecret = process.env.X_API_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessSecret = process.env.X_ACCESS_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
    ...params,
  };

  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join("&");

  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  oauthParams.oauth_signature = signature;

  const authHeader = Object.keys(oauthParams)
    .filter((k) => k.startsWith("oauth_"))
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${authHeader}`;
}

export async function postToX(text: string): Promise<PostResult> {
  if (!process.env.X_API_KEY || !process.env.X_ACCESS_TOKEN) {
    return { success: false, error: "X/Twitter credentials not configured" };
  }

  // Truncate to 280 chars
  const truncated = text.length > 280 ? text.slice(0, 277) + "..." : text;

  try {
    const url = "https://api.twitter.com/2/tweets";
    const body = JSON.stringify({ text: truncated });
    const authHeader = generateOAuthHeader("POST", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json();
    if (data.data?.id) {
      return {
        success: true,
        postId: data.data.id,
        postUrl: `https://x.com/i/status/${data.data.id}`,
      };
    }
    return { success: false, error: data.detail || data.title || "Unknown error" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
