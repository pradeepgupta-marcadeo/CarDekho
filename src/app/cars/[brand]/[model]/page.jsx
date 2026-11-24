import { notFound } from "next/navigation";
import { CARS, getCar } from "@/data/cars";
import { ModelTab, modelMeta } from "@/lib/model-page";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return CARS.map((c) => ({ brand: c.brandSlug, model: c.slug }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { brand, model } = await params;
  const car = getCar(brand, model);
  return car ? modelMeta(car, "overview") : {};
}

export default async function Page({ params }) {
  await ready();
  const { brand, model } = await params;
  const car = getCar(brand, model);
  if (!car) notFound();
  return <ModelTab car={car} tab="overview" />;
}
