"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { appendTrackingParams } from "@/lib/utm-persistence";

type TrackedLinkProps = ComponentProps<typeof NextLink>;

export default function TrackedLink({ href, ...props }: TrackedLinkProps) {
  const hrefStr = typeof href === "string" ? href : href.pathname || "/";

  // Only append tracking params to internal links
  const isInternal = hrefStr.startsWith("/") || hrefStr.startsWith("#");
  const trackedHref = isInternal ? appendTrackingParams(hrefStr) : hrefStr;

  return <NextLink href={trackedHref} {...props} />;
}
