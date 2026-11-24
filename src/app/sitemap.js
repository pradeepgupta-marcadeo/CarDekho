import { BRANDS, CARS, byPopularity, carUrl, onSale, variantsOf } from "@/data/cars";
import { ARTICLES, CARS_BY_KEY, COLLECTIONS, COMPARE_PAIRS, FACETS, STORIES, TOPICS, articleUrl, newsByBrand } from "@/data/content";
import { CITIES, SITE } from "@/data/site";
import { tabsFor } from "@/lib/model-page";
import { ready } from "@/data/store";

const staticPaths = [
  "",
  "/new-cars",
  "/popular-cars",
  "/electric-cars",
  "/upcoming-cars",
  "/latest-cars",
  "/brands",
  "/compare-cars",
  "/fuel-prices",
  "/news",
  "/expert-reviews",
  "/tips-advice",
  "/user-reviews",
  "/write-review",
  "/car-collections",
  "/visual-stories",
  "/car-loan",
  "/emi-calculator",
  "/car-insurance",
  "/about",
  "/careers",
  "/contact",
  "/faqs",
  "/feedback",
  "/advertise",
  "/partner-dealer",
  "/privacy-policy",
  "/terms",
  "/image-credits",
];

export default async function sitemap() {
  await ready();
  const paths = [
    ...staticPaths,
    ...Object.keys(FACETS).map((f) => `/new-cars/${f}`),
    ...BRANDS.map((b) => `/brands/${b.slug}`),
    ...CARS.flatMap((c) => [carUrl(c), ...[...tabsFor(c), "variants"].map((t) => `${carUrl(c)}/${t}`), ...variantsOf(c).map((v) => `${carUrl(c)}/variants/${v.slug}`)]),
    ...byPopularity(onSale())
      .slice(0, 8)
      .flatMap((c) => CITIES.map((city) => `${carUrl(c)}/price-in-${city.slug}`)),
    ...COMPARE_PAIRS.filter(([a, b]) => CARS_BY_KEY[a] && CARS_BY_KEY[b]).map(([a, b]) => `/compare-cars/${a}-vs-${b}`),
    ...ARTICLES.map(articleUrl),
    ...Object.keys(TOPICS).map((t) => `/news/topic/${t}`),
    ...BRANDS.filter((b) => newsByBrand(b.slug).length > 0).map((b) => `/news/brand/${b.slug}`),
    ...COLLECTIONS.filter((c) => c.cars[0]).map((c) => `/car-collections/${c.slug}`),
    ...STORIES.filter((s) => s.cars[0]).map((s) => `/visual-stories/${s.slug}`),
  ];
  return paths.map((p) => ({ url: `${SITE.url}${p}` }));
}
