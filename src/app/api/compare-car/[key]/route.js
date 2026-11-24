import { carById, CARS } from "@/data/cars";
import { ready } from "@/data/store";
import { compareCar } from "@/lib/compare-data";

// Full comparison data for one car, loaded by the compare tool only when someone picks that car.
// Every car is prepared at build time and refreshed with the rest of the site when the CMS saves.
export async function generateStaticParams() {
  await ready();
  return CARS.map((c) => ({ key: c.key }));
}

export async function GET(_req, { params }) {
  await ready();
  const { key } = await params;
  const car = carById(key);
  if (!car) return Response.json({ error: "Car not found" }, { status: 404 });
  return Response.json(compareCar(car));
}
