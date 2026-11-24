import { BRANDS, CARS, byPopularity, carUrl, priceRange } from "@/data/cars";

/** Cars (most popular first), brands and tools for the header search. */
export function searchList() {
  return [
    ...byPopularity(CARS).map((c) => ({ label: c.full, href: carUrl(c), meta: priceRange(c) })),
    ...BRANDS.map((b) => ({ label: `${b.name} cars`, href: `/brands/${b.slug}`, meta: "Brand" })),
    { label: "Compare cars", href: "/compare-cars", meta: "Tool" },
    { label: "EMI calculator", href: "/emi-calculator", meta: "Tool" },
    { label: "Today's fuel prices", href: "/fuel-prices", meta: "Tool" },
  ];
}
