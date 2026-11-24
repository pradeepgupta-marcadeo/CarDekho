import { NextResponse } from "next/server";

// Redirects managed in the CMS ("Redirects" screen, and the ones it adds itself
// when a URL changes), plus a 301 for variant pages that are no longer sold.
// Both lists are fetched at most once a minute; if the CMS is down, requests
// pass straight through (next.config.mjs keeps the built-in redirects).
const CMS = (process.env.CMS_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

let rules = new Map();
let variants = {};
let fetchedAt = 0;

async function load() {
  if (Date.now() - fetchedAt < 60_000) return;
  fetchedAt = Date.now();
  try {
    const [r, v] = await Promise.all([fetch(`${CMS}/api/public/redirects`, { signal: AbortSignal.timeout(2000) }), fetch(`${CMS}/api/public/variant-paths`, { signal: AbortSignal.timeout(2000) })]);
    if (r.ok) rules = new Map((await r.json()).map((x) => [x.source.replace(/\/$/, "") || "/", x]));
    if (v.ok) variants = await v.json();
  } catch {
    // Keep the last known lists.
  }
}

const VARIANT = /^(\/cars\/[^/]+\/[^/]+)\/variants\/([^/]+)$/;

export async function proxy(request) {
  await load();
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  const rule = rules.get(path);
  if (rule && rule.destination !== path) return NextResponse.redirect(new URL(rule.destination, request.url), rule.permanent ? 301 : 307);
  const m = path.match(VARIANT);
  if (m && variants[m[1]] && !variants[m[1]].includes(m[2])) return NextResponse.redirect(new URL(`${m[1]}/variants`, request.url), 301);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|images/|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-z0-9]+$).*)"],
};
