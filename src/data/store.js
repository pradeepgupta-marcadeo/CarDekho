// The website's single source of content: the CMS snapshot.
//
// Every page, layout and metadata function calls `await ready()` first. That
// loads the snapshot through a cached function (tag "cms"), so pages stay
// statically prerendered and fast; when an editor saves in the CMS, the CMS
// calls /api/revalidate, which expires the tag and the pages regenerate.
// If the CMS is unreachable, the copy saved at build time (snapshot.json) is used.
import { cacheLife, cacheTag } from "next/cache";
import { hydrateCars } from "./cars";
import { hydrateContent } from "./content";
import saved from "./snapshot.json";
import { hydrateSite } from "./site";
import { hydrateTopics } from "./topics";

const CMS = (process.env.CMS_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function loadSnapshot() {
  "use cache";
  cacheTag("cms");
  try {
    const res = await fetch(`${CMS}/api/public/snapshot`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`CMS answered ${res.status}`);
    const live = await res.json();
    cacheLife("max"); // kept until the CMS says something changed
    return live;
  } catch {
    // The CMS is down or restarting: the saved copy stands in only briefly, so the live content (new photos,
    // 360 views) comes back by itself as soon as the CMS answers again, instead of the old copy staying for good.
    cacheLife("seconds");
    return saved;
  }
}

let applied = "";
let current = saved;

function apply(s) {
  hydrateSite({ site: s.site, cities: s.cities, nav: s.nav, footer: s.footer, blocks: s.blocks });
  hydrateTopics(s.topics);
  hydrateCars({ cars: s.cars, brands: s.brands, sitePhotos: s.sitePhotos });
  hydrateContent(s);
  current = s;
  applied = s.version;
}

/** Loads the latest CMS content into the data modules. Await it before reading any data. */
/** A tiny cached value carrying the "cms" tag, so pages built from the saved copy still refresh after a CMS save. */
async function cmsTag() {
  "use cache";
  cacheTag("cms");
  cacheLife("max");
  return saved.version;
}

export async function ready() {
  // During "next build" read the saved copy directly: going through the cached loader would store and re-read the
  // whole snapshot for each of the thousands of pages, which makes pages time out. cmsTag() still ties every page
  // to the "cms" tag, so the CMS refresh (revalidateTag) re-renders it with fresh content afterwards.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    await cmsTag();
    const s = saved;
    if (s.version !== applied) apply(s);
    return;
  }
  const s = await loadSnapshot();
  if (s.version !== applied) apply(s);
}

export const seoFor = (path) => current.seo?.[path];
export const analytics = () => current.analytics ?? { ga4Id: "", clarityId: "", gscVerification: "", bingVerification: "", firstParty: true };
export const credits = () => current.credits ?? [];
export const redirects = () => current.redirects ?? [];
export const cmsUrl = () => CMS;
/** Search phrases for a page, main keyword first (from the CMS keyword bank). */
export const keywordsFor = (path) => current.keywords?.[path] ?? [];
/** The year of the data on the site (from the snapshot, so pages stay static and consistent). */
export const contentYear = () => new Date(current.generatedAt ?? saved.generatedAt ?? "2026-01-01").getFullYear();
