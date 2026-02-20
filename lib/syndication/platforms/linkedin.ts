// lib/syndication/platforms/linkedin.ts
// LinkedIn posting via Marketing API

interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export async function postToLinkedIn(
  text: string,
  link?: string
): Promise<PostResult> {
  const orgId = process.env.LINKEDIN_ORG_ID;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!orgId || !accessToken) {
    return { success: false, error: "LinkedIn credentials not configured" };
  }

  try {
    const body: Record<string, unknown> = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: link ? "ARTICLE" : "NONE",
          ...(link
            ? {
                media: [
                  {
                    status: "READY",
                    originalUrl: link,
                  },
                ],
              }
            : {}),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.id) {
      return { success: true, postId: data.id };
    }
    return { success: false, error: data.message || "Unknown error" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
