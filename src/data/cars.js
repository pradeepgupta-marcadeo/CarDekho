// Car catalogue. The data comes from the CMS snapshot (see store.ts); these
// arrays are filled in place by hydrateCars() before any page renders.

export const CARS = [];
export const BRANDS = [];
const photos = {};
const logos = {};

/**
 * Pages read three pros, two cons and an angle for every car. When the CMS has not written them yet,
 * they are filled from the car's own facts, so a page never fails on a gap and nothing is invented.
 */
// Words for running text: "SUV" and "CNG" stay in capitals, other words go lower case.
const ACRONYM = /^(SUV|MUV|MPV|CNG|LPG|EV)$/;
const bodyWord = (b) => String(b ?? "car").split(" ").map((w) => (ACRONYM.test(w) ? w : w.toLowerCase())).join(" ");
const fuelWord = (f) => (ACRONYM.test(f) ? f : String(f).toLowerCase());

function withCopy(c) {
  const facts = [
    c.min ? `Starts at ₹${lakh(c.min)} ex-showroom` : "",
    c.seats ? `${c.seats}-seat ${bodyWord(c.body)}` : "",
    c.fuels?.length ? `Available with ${c.fuels.map(fuelWord).join(", ")} power` : "",
    c.ncap > 0 ? `Listed with a ${c.ncap}-star safety rating` : "",
  ].filter(Boolean);
  const pros = [...(c.pros ?? [])];
  for (const f of facts) if (pros.length < 3 && !pros.includes(f)) pros.push(f);
  const cons = [...(c.cons ?? [])];
  for (const f of ["Check variant availability and waiting period with your dealer", "Prices and features can differ by city and variant"]) if (cons.length < 2 && !cons.includes(f)) cons.push(f);
  return { ...c, pros, cons, angle: c.angle || `${c.brand}'s ${bodyWord(c.body)} for Indian roads` };
}

// The photo that shows the whole car best, for cards and page tops: a studio three-quarter view first, then the
// other exterior angles, then a driving shot from those angles, then a colour photo (always the whole car).
// A close-up (a door handle, a headlamp) never leads; without any of these the first photo stays.
const HERO = [45, 315, 0, 270, 90, 135, 225, 180];
const heroRank = (p) => {
  if (typeof p.angle === "number" && HERO.includes(p.angle)) return (/^driving/i.test(p.title ?? "") ? 10 : 0) + HERO.indexOf(p.angle);
  if (p.colour) return 20;
  return null;
};
/** Whole-car photos first (best first), then every other photo in its own order. */
const heroFirst = (list = []) =>
  list
    .map((p, i) => ({ p, i, r: heroRank(p) ?? 100 }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .map((x) => x.p);
export function hydrateCars(input) {
  CARS.splice(0, CARS.length, ...input.cars.map((c) => withCopy({ ...c, full: c.full || `${c.brand} ${c.name}` })));
  for (const k of Object.keys(photos)) delete photos[k];
  Object.assign(photos, input.sitePhotos);
  for (const c of CARS) photos[c.key] = heroFirst(c.photos);
  for (const k of Object.keys(logos)) delete logos[k];
  for (const b of input.brands) if (b.logo) logos[b.slug] = b.logo;
  BRANDS.splice(0, BRANDS.length, ...input.brands.map((b) => ({ ...b, cars: CARS.filter((c) => c.brandSlug === b.slug) })).filter((b) => b.cars.length > 0));
}

export const carKey = (car) => car.key;
export const carPhotos = (car) => photos[car.key] ?? [];
export const carPhoto = (car) => carPhotos(car)[0];
export const carUrl = (car) => `/cars/${car.brandSlug}/${car.slug}`;
export const sitePhoto = (key) => photos[key]?.[0];
export const allPhotos = () => photos;
export const brandLogo = (slug) => logos[slug];
export const allLogos = () => logos;

export const getCar = (brand, model) => CARS.find((x) => x.brandSlug === brand && x.slug === model);
export const carById = (key) => CARS.find((x) => x.key === key);
export const onSale = () => CARS.filter((x) => x.status !== "upcoming");
export const byPopularity = (list = CARS) => [...list].sort((a, b) => b.popularity - a.popularity);
export const getBrand = (slug) => BRANDS.find((b) => b.slug === slug);

export const lakh = (n) => (n >= 100 ? `${(n / 100).toFixed(2)} Cr` : `${n.toFixed(2)} Lakh`);
/** Short form for tight spots: "6.50 L", "8.50 Cr". */
export const lakhShort = (n) => (n >= 100 ? `${(n / 100).toFixed(2)} Cr` : `${n.toFixed(2)} L`);
/** "₹6.50 Lakh" (one price), "₹6 - 9.75 Lakh", "₹8.50 - 9.15 Cr", "₹96.90 Lakh - 1.13 Cr". */
export const priceRange = (car) => {
  if (!car.min) return "Price to be announced";
  const max = Math.max(car.max || 0, car.min);
  if (max - car.min < 0.005) return `₹${lakh(car.min)}`;
  if (car.min >= 100) return `₹${(car.min / 100).toFixed(2)} - ${lakh(max)}`;
  if (max >= 100) return `₹${lakh(car.min)} - ${lakh(max)}`;
  return `₹${car.min.toFixed(2)} - ${lakh(max)}`;
};
export const rupees = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
export const isEv = (car) => car.fuels.length === 1 && car.fuels[0] === "Electric";
/** Mileage or range as shown to readers; the dataset leaves unverified figures blank. */
/**
 * A car name joined with a variant name without repeating words: "Urban Cruiser Hyryder" + "Hyryder G Opt" gives
 * "Urban Cruiser Hyryder G Opt", not "... Hyryder Hyryder G Opt".
 */
export function withVariant(name, variant) {
  const a = name.split(" ");
  const b = variant.split(" ");
  for (let n = Math.min(a.length, b.length); n > 0; n--) {
    if (a.slice(-n).join(" ").toLowerCase() === b.slice(0, n).join(" ").toLowerCase()) return [...a, ...b.slice(n)].join(" ");
  }
  return `${name} ${variant}`;
}

/** "5 star", or "Not rated" when no crash test result is listed. */
export const crashRating = (car) => (car.ncap > 0 ? `${car.ncap} star` : "Not rated");
/** True when the source lists a real mileage (or EV range) figure. Without one, mileage is simply not shown. */
export const hasMileage = (car) => /\d/.test(car?.mileage ?? "");
/** The claimed mileage text, or null when none is listed. */
export const mileageText = (car) => (hasMileage(car) ? car.mileage : null);

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const trims = ["Essential", "Smart", "Pure", "Creative", "Signature"];
const trimFeatures = [
  ["Six airbags", "Rear parking sensors", "Steel wheels"],
  ["8-inch touchscreen", "Android Auto and Apple CarPlay", "Steering controls"],
  ["Alloy wheels", "Rear camera", "Auto climate control"],
  ["Sunroof", "Wireless charging", "Connected car tech"],
  ["360-degree camera", "Ventilated front seats", "Premium sound system"],
];

/** Real variants from the CMS when it has them; otherwise an indicative ladder between the start and top prices. */
export function variantsOf(car) {
  if (car.variants?.length) return car.variants;
  if (!car.min) return [];
  const out = [];
  const steps = trims.length - 1;
  trims.forEach((trim, i) => {
    const price = car.min + ((car.max - car.min) * i) / steps;
    const fuel = car.fuels[i % car.fuels.length];
    const trans = i >= 3 && car.auto ? "Automatic" : "Manual";
    const shownTrans = fuel === "Electric" ? "Automatic" : trans;
    out.push({
      slug: slugify(`${trim} ${fuel} ${shownTrans}`),
      name: `${trim} ${fuel} ${shownTrans === "Automatic" ? "AT" : "MT"}`,
      fuel,
      trans: shownTrans,
      price: Math.round(price * 100) / 100,
      highlights: trimFeatures
        .slice(0, i + 1)
        .flat()
        .slice(-4),
    });
  });
  return out;
}

/** Road tax for one city: the state's real slab for this fuel and price when known, else the city's flat rate. */
export function roadTax(exShowroomRs, city, fuel = "Petrol") {
  const rules = city.taxRules ?? [];
  const rule = rules.find((r) => r.fuels.includes(fuel)) ?? rules.find((r) => r.fuels.includes("Petrol"));
  const slab = rule?.slabs.find((s) => s.uptoRs === null || exShowroomRs <= s.uptoRs);
  if (slab?.pct !== null && slab?.pct !== undefined) return (exShowroomRs * slab.pct) / 100;
  if (slab?.flatRs) return slab.flatRs;
  return exShowroomRs * city.rto;
}

export function onRoad(priceLakh, city, fuel = "Petrol") {
  const ex = priceLakh * 100000;
  const reg = roadTax(ex, city, fuel) + (city.taxRules?.length ? (fuel === "Electric" ? 0 : (city.registrationFeeRs ?? 600)) : 0);
  const insurance = ex * city.ins;
  const tcs = ex >= 1000000 ? ex * 0.01 : 0;
  return { ex, reg, insurance, tcs, total: ex + reg + insurance + tcs };
}

/**
 * On-road price of a variant in a city: the real price from the source when the CMS has it for that city
 * (variant.onRoad[citySlug]), else the estimate above. Returns the same fields as onRoad(), plus real: true.
 */
export function onRoadFor(variant, city, fallbackLakh = 0, fallbackFuel = "Petrol") {
  const est = onRoad(variant?.price ?? fallbackLakh, city, variant?.fuel ?? fallbackFuel);
  const real = city ? variant?.onRoad?.[city.slug] : null;
  if (!real?.total || real.total < est.ex) return est;
  const ex = est.ex;
  if (real.rto != null && real.insurance != null) {
    return { ex, reg: real.rto, insurance: real.insurance, tcs: Math.max(0, real.total - ex - real.rto - real.insurance), total: real.total, real: true };
  }
  // Only the total is known: keep the estimated insurance and TCS, and the rest is road tax and registration.
  const insurance = Math.min(est.insurance, real.total - ex);
  const tcs = Math.min(est.tcs, real.total - ex - insurance);
  return { ex, reg: real.total - ex - insurance - tcs, insurance, tcs, total: real.total, real: true };
}

export function emi(principal, ratePct, months) {
  const r = ratePct / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const yesNo = (v) => (v === true ? "Yes" : v === false ? "No" : v === "none" ? "No" : v ? String(v) : "Not listed");
const range = (f, k, fmt = yesNo) => {
  if (!f?.base && !f?.top) return null;
  const a = f.base?.[k];
  const b = f.top?.[k];
  if (a === undefined && b === undefined) return null;
  const [x, y] = [fmt(a), fmt(b)];
  return x === y ? x : `${x} (${f.baseTrim}) to ${y} (${f.topTrim})`;
};

export function specGroups(car) {
  const ev = isEv(car);
  const f = car.features;
  const d = car.dims;
  const rows = (list) => list.filter((r) => Boolean(r[1]));
  return [
    {
      title: ev ? "Battery and motor" : "Engine and transmission",
      rows: rows([
        [ev ? "Battery capacity" : "Engine displacement", car.engine],
        ["Maximum power", car.power],
        ["Maximum torque", car.torque],
        ["Transmission", ev ? "Single-speed automatic" : car.auto ? "Manual and automatic" : "Manual"],
        ["Fuel options", car.fuels.join(", ")],
        [ev ? "Claimed range" : "Claimed mileage", mileageText(car)],
        ...(f?.ev
          ? [
              ["DC fast charging", f.ev.dcKw ? `Up to ${f.ev.dcKw} kW` : null],
              ["AC charging", f.ev.acKw ? `${f.ev.acKw} kW` : null],
            ]
          : []),
      ]),
    },
    {
      title: "Dimensions and capacity",
      rows: rows([
        ["Length", d?.length ? `${d.length} mm` : null],
        ["Width", d?.width ? `${d.width} mm` : null],
        ["Height", d?.height ? `${d.height} mm` : null],
        ["Wheelbase", d?.wheelbase ? `${d.wheelbase} mm` : null],
        ["Seating capacity", `${car.seats} people`],
        ["Boot space", car.boot ? `${car.boot} litres` : null],
        ["Fuel tank", d?.tank ? `${d.tank} litres` : null],
        ["Body type", car.body],
      ]),
    },
    {
      title: "Safety",
      rows: rows(
        f
          ? [
              ["Airbags", range(f, "airbags", (v) => (v ? `${v}` : "Not listed"))],
              ["Electronic stability control", range(f, "esc")],
              ["ISOFIX child seat mounts", range(f, "isofix")],
              ["Tyre pressure monitor", range(f, "tpms")],
              ["Rear camera", range(f, "rearCamera")],
              ["360-degree camera", range(f, "camera360")],
              // The dataset writes ADAS as "l2-22" (level and feature count); show the level only.
              ["ADAS", range(f, "adas", (v) => (v && v !== "none" ? String(v).replace(/^l(\d)(-\d+)?$/i, "Level $1") : "No"))],
              ["Crash test rating", crashRating(car)],
            ]
          : [["Crash test rating", crashRating(car)]],
      ),
    },
    {
      title: "Comfort and technology",
      rows: rows(
        f
          ? [
              ["Touchscreen", range(f, "touchscreenIn", (v) => (v ? `${v} inch` : "No"))],
              ["Wireless Android Auto and Apple CarPlay", range(f, "wirelessCarPlayAndroidAuto")],
              ["Automatic climate control", range(f, "autoClimate")],
              ["Sunroof", range(f, "sunroof", (v) => (v && v !== "none" ? String(v).replace(/-/g, " ") : "No"))],
              ["Ventilated front seats", range(f, "ventilatedFrontSeats")],
              ["Wireless charger", range(f, "wirelessCharger")],
              ["Cruise control", range(f, "cruiseControl")],
              ["Connected car features", range(f, "connectedCarTech")],
            ]
          : [],
      ),
    },
  ].filter((g) => g.rows.length);
}

/** The complete specification and feature sheet of the top variant, section by section (empty when the CMS has none). */
export function fullSheet(car) {
  const sheet = car.features?.sheet;
  const sections = (obj) =>
    Object.entries(obj ?? {})
      .map(([title, items]) => ({ title, rows: Object.entries(items ?? {}).filter(([k, v]) => k && v && v !== "-") }))
      .filter((g) => g.rows.length);
  return { trim: car.features?.topTrim ?? null, specification: sections(sheet?.specification), features: sections(sheet?.features) };
}

/** Fuel of the cheapest variant: the one an "on-road price from" figure is for. */
export const baseFuel = (car) => variantsOf(car)[0]?.fuel ?? car.fuels[0] ?? "Petrol";
