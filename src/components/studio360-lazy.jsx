"use client";

import dynamic from "next/dynamic";

// The 360 studio draws on a canvas in the browser, so it loads there only; until then a box of the same size holds
// its place (no layout shift).
export const Studio360Lazy = dynamic(() => import("./studio360").then((m) => m.Studio360), {
  ssr: false,
  loading: () => <div className="aspect-4/3 w-full animate-pulse rounded-xl bg-[#e9e9e9] sm:aspect-video" aria-hidden />,
});
