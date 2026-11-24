// Articles, offers, places, lists and FAQs. Filled from the CMS snapshot by
// hydrateContent() (see store.ts); every array is replaced in place.
import { BRANDS, CARS, carKey, carPhoto, carUrl } from "./cars";
import { TOPICS } from "./topics";

/* ---------- Places ---------- */

const DEALERS = [];
export const showrooms = (brand) => DEALERS.filter((d) => d.brand === brand);
export const evStations = [];
export const fuelStations = [];
export const fuelPrices = [];

/* ---------- Offers ---------- */

export const OFFERS = [];

/* ---------- Articles ---------- */
/** The picture that belongs to a story itself (saved by the CMS, credited to its source). */

export const ARTICLES = [];
/** The story's own picture when it has one, otherwise the photo of its car. */
export const articlePhoto = (a) => (a.image ? { src: a.image.src, w: a.image.w, h: a.image.h } : carPhoto(CARS_BY_KEY[a.photo]));
/** The picture at the top of an article page: its banner, else its listing image, else its car's photo. */
export const articleHero = (a) => {
  const i = a.cover ?? a.image;
  return i ? { src: i.src, w: i.w, h: i.h } : carPhoto(CARS_BY_KEY[a.photo]);
};
export const articlesOf = (kind) => ARTICLES.filter((a) => a.kind === kind);
export const getArticle = (kind, slug) => ARTICLES.find((a) => a.kind === kind && a.slug === slug);
export const articleUrl = (a) => `${a.kind === "news" ? "/news" : a.kind === "review" ? "/expert-reviews" : "/tips-advice"}/${a.slug}`;
export const articlesForCar = (car) => ARTICLES.filter((a) => a.car && carKey(a.car) === carKey(car));

/* ---------- Owner reviews ---------- */

const REVIEWS = [];
export const ownerReviews = (car) => REVIEWS.filter((r) => r.car === carKey(car));

/* ---------- Lists built from rules ---------- */

/** Whether a car belongs in a list. Every key in the rule must hold; "any" needs one of its rules to hold. */
export function matchRule(c, r) {
  if (r.body && !r.body.includes(c.body)) return false;
  if (r.fuelsAny && !c.fuels.some((f) => r.fuelsAny.includes(f))) return false;
  if (r.minLt !== undefined && !(c.min > 0 && c.min < r.minLt)) return false;
  if (r.minGte !== undefined && !(c.min >= r.minGte)) return false;
  if (r.maxLt !== undefined && !(c.max > 0 && c.max < r.maxLt)) return false;
  if (r.seatsGte !== undefined && !(c.seats >= r.seatsGte)) return false;
  if (r.ncap !== undefined && c.ncap !== r.ncap) return false;
  if (r.notStatus && c.status === r.notStatus) return false;
  if (r.slugs && !r.slugs.includes(c.slug)) return false;
  if (r.any && !r.any.some((x) => matchRule(c, x))) return false;
  return true;
}
const pickCars = (rule, max) =>
  CARS.filter((c) => matchRule(c, rule))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, max);

export const STORIES = [];
export const COLLECTIONS = [];
export const FACETS = {};
export const COMPARE_PAIRS = [];
export const FAQS_HOME = [];
export const CARS_BY_KEY = {};

export { BRANDS, carUrl };

/* ---------- News sections ---------- */
export const newsViews = (a) => ((a.title.length * 37) % 900) + 120 + ((a.slug.charCodeAt(3) * 53) % 700);
export const popularNews = () => [...articlesOf("news")].sort((a, b) => newsViews(b) - newsViews(a));
export const newsByTopic = (key) => {
  const t = TOPICS[key];
  if (!t) return [];
  return articlesOf("news").filter((a) =>
    t.category ? a.category === t.category || (t.category === "pricing" && a.category === "price") : !!a.car?.fuels.includes(t.fuel) || (key === "ev" && a.category === "electric"),
  );
};
export const newsByBrand = (brandSlug) => articlesOf("news").filter((a) => a.car?.brandSlug === brandSlug || a.rival?.brandSlug === brandSlug);
export { TOPICS };

/* ---------- Hydration ---------- */

const replace = (target, items) => target.splice(0, target.length, ...items);
const clearObj = (o) => {
  for (const k of Object.keys(o)) delete o[k];
};

export function hydrateContent(input) {
  clearObj(CARS_BY_KEY);
  for (const c of CARS) CARS_BY_KEY[c.key] = c;
  replace(
    ARTICLES,
    input.articles
      .map((a) => ({ ...a, car: a.car ? CARS_BY_KEY[a.car] : undefined, rival: a.rival ? CARS_BY_KEY[a.rival] : undefined, faqs: a.faqs ?? [], source: a.source ?? null }))
      .filter((a) => CARS_BY_KEY[a.photo])
      .sort((x, y) => Number(Boolean(y.featured)) - Number(Boolean(x.featured))),
  );
  replace(
    OFFERS,
    input.offers.filter((o) => CARS_BY_KEY[o.car]).map((o) => ({ id: o.car, car: CARS_BY_KEY[o.car], amount: o.amount, type: o.type, daysLeft: o.daysLeft })),
  );
  replace(DEALERS, input.dealers);
  replace(evStations, input.evStations);
  replace(fuelStations, input.fuelStations);
  replace(fuelPrices, input.fuelPrices);
  replace(REVIEWS, input.ownerReviews);
  clearObj(FACETS);
  for (const [k, f] of Object.entries(input.facets)) FACETS[k] = { label: f.label, h1: f.h1, intro: f.intro, filter: (c) => matchRule(c, f.rule) };
  replace(
    COLLECTIONS,
    input.collections.map((c) => ({ slug: c.slug, title: c.title, blurb: c.blurb, cars: pickCars(c.rule, c.max) })),
  );
  replace(
    STORIES,
    input.stories.map((s) => ({ slug: s.slug, title: s.title, intro: s.intro, cars: pickCars(s.rule, s.max) })),
  );
  replace(
    COMPARE_PAIRS,
    input.comparePairs.filter(([a, b]) => CARS_BY_KEY[a] && CARS_BY_KEY[b]),
  );
  replace(FAQS_HOME, input.faqsHome);
}
