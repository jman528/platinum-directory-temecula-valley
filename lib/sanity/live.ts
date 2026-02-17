import { defineLive } from "next-sanity/live";
import { client } from "./client";

const live = defineLive({
  client: client.withConfig({ apiVersion: "v2025-01-01" }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
});

export const SanityLive = live.SanityLive;

export async function sanityFetch<T = unknown>(options: {
  query: string;
  params?: Record<string, unknown>;
}): Promise<{ data: T }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return live.sanityFetch(options as any);
}
