// lib/syndication/platforms/meta.ts
// Meta (Facebook + Instagram) posting via Graph API

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export async function postToFacebook(
  message: string,
  link?: string,
  imageUrl?: string
): Promise<PostResult> {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) {
    return { success: false, error: "Facebook credentials not configured" };
  }

  try {
    let endpoint: string;
    let body: Record<string, string>;

    if (imageUrl) {
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
      body = { url: imageUrl, caption: message, access_token: accessToken };
    } else {
      endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
      body = { message, access_token: accessToken };
      if (link) body.link = link;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.id) {
      return {
        success: true,
        postId: data.id,
        postUrl: `https://facebook.com/${data.id}`,
      };
    }
    return { success: false, error: data.error?.message || "Unknown error" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function postToInstagram(
  caption: string,
  imageUrl: string
): Promise<PostResult> {
  const accountId = process.env.IG_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!accountId || !accessToken) {
    return { success: false, error: "Instagram credentials not configured" };
  }

  try {
    // Step 1: Create media container
    const createRes = await fetch(
      `${GRAPH_API_BASE}/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );
    const createData = await createRes.json();
    if (!createData.id) {
      return { success: false, error: createData.error?.message || "Failed to create media" };
    }

    // Step 2: Publish
    const publishRes = await fetch(
      `${GRAPH_API_BASE}/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();
    if (publishData.id) {
      return { success: true, postId: publishData.id };
    }
    return { success: false, error: publishData.error?.message || "Failed to publish" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
