import { SITE } from "@/data/site";
import { ready } from "@/data/store";

export default async function robots() {
  await ready();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/shortlist"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
