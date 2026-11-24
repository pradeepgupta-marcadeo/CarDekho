import { notFound } from "next/navigation";

import { ModelNav } from "@/components/ModelNav";
import { CARS, getCar, hasMileage } from "@/data/cars";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return CARS.map((c) => ({ brand: c.brandSlug, model: c.slug }));
}

export default async function ModelLayout({ children, params }) {
  await ready();
  const { brand, model } = await params;
  const car = getCar(brand, model);
  if (!car) notFound();
  return (
    <>
      <ModelNav base={`/cars/${brand}/${model}`} name={car.name} hide={hasMileage(car) ? [] : ["mileage"]} />
      {children}
    </>
  );
}
