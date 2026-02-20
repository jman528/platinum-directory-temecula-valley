// lib/syndication/platforms/reddit.ts
// Reddit posting via API

interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "PlatinumDirectory/1.0",
    },
    body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  });

  const data = await res.json();
  return data.access_token || null;
}

export async function postToReddit(
  subreddit: string,
  title: string,
  text: string,
  kind: "self" | "link" = "self",
  url?: string
): Promise<PostResult> {
  const accessToken = await getRedditAccessToken();
  if (!accessToken) {
    return { success: false, error: "Reddit credentials not configured" };
  }

  try {
    const body = new URLSearchParams({
      sr: subreddit,
      kind,
      title,
      ...(kind === "self" ? { text } : { url: url || "" }),
      resubmit: "true",
    });

    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PlatinumDirectory/1.0",
      },
      body: body.toString(),
    });

    const data = await res.json();
    if (data.json?.data?.url) {
      return {
        success: true,
        postId: data.json.data.id,
        postUrl: data.json.data.url,
      };
    }
    return {
      success: false,
      error: data.json?.errors?.[0]?.[1] || "Unknown error",
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
