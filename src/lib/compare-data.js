import { carKey, carPhoto, carPhotos, carUrl, priceRange, specGroups, variantsOf } from "@/data/cars";
import { articleUrl, articlesForCar, fuelPrices, ownerReviews } from "@/data/content";
import { dimsOf, featureRows } from "@/lib/news-story";

/** Highest number in a text: "81.8 to 118 bhp" -> 118. 0 when there is none. */
const top = (s) => Math.max(0, ...(String(s ?? "").match(/\d+(\.\d+)?/g) ?? []).map(Number));
/** First number in a text: "17.5 to 20.4 kmpl" -> 17.5. 0 when there is none. */
const first = (s) => parseFloat(String(s ?? "").match(/\d+(\.\d+)?/)?.[0] ?? "") || 0;
const isEv = (c) => c.fuels.length === 1 && c.fuels[0] === "Electric";
const HOME_CHARGING = 8; // rupees per unit (kWh) of electricity, a typical home tariff

/** Today's fuel rate in New Delhi for the car's main fuel, from the fuel price page's data. */
const fuelRate = (fuel) => {
  const delhi = fuelPrices.find((p) => p.slug === "new-delhi") ?? fuelPrices[0];
  const key = { Petrol: "petrol", Hybrid: "petrol", Diesel: "diesel", CNG: "cng" }[fuel];
  return key && delhi?.[key] ? { rate: delhi[key], city: delhi.city } : null;
};

/**
 * Energy cost per kilometre from the car's claimed mileage (or battery size and range for an EV) and today's fuel
 * price. { perKm: null } when the car's figures are not listed, so nothing is made up.
 */
const runningCost = (c) => {
  if (isEv(c)) {
    const kwh = c.features?.ev?.batteryKwh;
    const range = c.features?.ev?.rangeKm || first(c.mileage);
    return kwh && range ? { perKm: (kwh / range) * HOME_CHARGING, basis: `${kwh} kWh battery, ${range} km range, ₹${HOME_CHARGING} per unit home charging` } : { perKm: null };
  }
  const fuel = c.fuels[0];
  const m = first(c.mileage);
  const r = fuelRate(fuel);
  if (!m || !r) return { perKm: null };
  const unit = fuel === "CNG" ? "km/kg" : "kmpl";
  return { perKm: r.rate / m, basis: `${m} ${unit} claimed, ${fuel === "CNG" ? "CNG" : fuel.toLowerCase()} at ₹${r.rate} in ${r.city}` };
};

export const compareCar = (c) => {
  const p = carPhoto(c);
  return {
    key: carKey(c),
    model3d: c.model3d,
    spin: c.spin,
    url: carUrl(c),
    full: c.full,
    name: c.name,
    brand: c.brand,
    body: c.body,
    priceText: priceRange(c),
    min: c.min,
    max: c.max,
    status: c.status,
    launch: c.launch,
    photo: { src: p.src, w: p.w, h: p.h },
    photos: carPhotos(c).map((x) => ({ photo: { src: x.src, w: x.w, h: x.h }, kind: x.kind })),
    colors: c.colors,
    seats: c.seats,
    boot: c.boot,
    ncap: c.ncap,
    rating: c.rating,
    reviews: c.reviews,
    power: c.power,
    powerN: top(c.power),
    torque: c.torque,
    torqueN: top(c.torque),
    mileage: c.mileage,
    mileageN: first(c.mileage),
    mileageUnit: isEv(c) ? "km" : /km\/kg/.test(c.mileage) && !/kmpl/.test(c.mileage) ? "km/kg" : "kmpl",
    engine: c.engine,
    fuels: c.fuels,
    auto: c.auto,
    angle: c.angle,
    pros: c.pros,
    cons: c.cons,
    dims: dimsOf(c),
    costPerKm: runningCost(c).perKm,
    costBasis: runningCost(c).basis ?? null,
    variants: variantsOf(c).map((v) => ({ name: v.name, slug: v.slug, price: v.price, fuel: v.fuel, trans: v.trans, highlights: v.highlights, onRoad: v.onRoad })),
    groups: [
      {
        title: "Price",
        rows: [
          ["Ex-showroom range", priceRange(c)],
          ["Base variant", variantsOf(c)[0]?.name ?? "Not listed"],
          ["Top variant", variantsOf(c).slice(-1)[0]?.name ?? "Not listed"],
        ],
      },
      // Safety and comfort items are listed once, in the features table below; only the crash rating stays here.
      ...specGroups(c)
        .filter((g) => g.title !== "Comfort and technology")
        .map((g) => (g.title === "Safety" ? { title: g.title, rows: g.rows.filter(([label]) => label === "Crash test rating") } : { title: g.title, rows: g.rows })),
    ],
    features: featureRows(c),
    ownerReviews: c.reviews
      ? ownerReviews(c)
          .slice(0, 2)
          .map((r) => ({ id: r.id, author: r.author, rating: r.rating, title: r.title, text: r.text, date: r.date }))
      : [],
    stories: articlesForCar(c)
      .slice(0, 2)
      .map((a) => ({ title: a.title, url: articleUrl(a), date: a.date })),
  };
};
