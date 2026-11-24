import { notFound } from "next/navigation";
import { LeadButton } from "@/components/cards";
import { OnRoadTable, PlaceLocator } from "@/components/tools";
import { Breadcrumbs, Container, LinkPills, Section } from "@/components/ui";
import { baseFuel, byPopularity, CARS, carUrl, getCar, hasMileage, onRoadFor, onSale, priceRange, rupees, variantsOf } from "@/data/cars";
import { fuelPrices, showrooms } from "@/data/content";
import { CITIES } from "@/data/site";
import { ModelTab, tabsFor, modelMeta } from "@/lib/model-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

const citySlugOf = (tab) => (tab.startsWith("price-in-") ? tab.slice("price-in-".length) : null);
const isTab = (car, t) => tabsFor(car).includes(t) || t === "variants";

export async function generateStaticParams() {
  await ready();
  const out = CARS.flatMap((c) => [...tabsFor(c), "variants"].map((tab) => ({ brand: c.brandSlug, model: c.slug, tab })));
  const cityPages = byPopularity(onSale())
    .slice(0, 8)
    .flatMap((c) => CITIES.map((city) => ({ brand: c.brandSlug, model: c.slug, tab: `price-in-${city.slug}` })));
  return [...out, ...cityPages];
}

export async function generateMetadata({ params }) {
  await ready();
  const { brand, model, tab } = await params;
  const car = getCar(brand, model);
  if (!car) return {};
  const slug = citySlugOf(tab);
  if (slug) {
    const city = CITIES.find((c) => c.slug === slug);
    if (!city) return {};
    const t = onRoadFor(variantsOf(car)[0], city, car.min, baseFuel(car)).total;
    return pageMeta({
      title: `${car.full} on-road price in ${city.name}`,
      description: `The ${car.full} on-road price in ${city.name} starts near ${rupees(t)}. See road tax in ${city.state}, insurance, showrooms and fuel costs for this city.`,
      path: `${carUrl(car)}/price-in-${city.slug}`,
    });
  }
  return isTab(car, tab) ? modelMeta(car, tab) : {};
}

export default async function Page({ params }) {
  await ready();
  const { brand, model, tab } = await params;
  const car = getCar(brand, model);
  if (!car) notFound();
  const slug = citySlugOf(tab);
  if (slug) {
    const city = CITIES.find((c) => c.slug === slug);
    if (!city) notFound();
    const variants = variantsOf(car);
    const low = onRoadFor(variantsOf(car)[0], city, car.min, baseFuel(car));
    const fp = fuelPrices.find((f) => f.slug === city.slug); // missing when no fuel prices are loaded
    const list = showrooms(car.brand)
      .filter((s) => s.citySlug === city.slug)
      .map((s) => ({ id: s.id, citySlug: s.citySlug, name: s.name, address: s.address, call: true, lines: [`Open ${s.hours}`, s.phone] }));
    const others = CITIES.filter((c) => c.slug !== city.slug);
    return (
      <>
        <div className="border-b border-ink-200 bg-white">
          <Container className="py-6">
            <Breadcrumbs
              items={[{ label: "New cars", href: "/new-cars" }, { label: car.brand, href: `/brands/${car.brandSlug}` }, { label: car.name, href: carUrl(car) }, { label: `Price in ${city.name}` }]}
            />
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              {car.name} price in {city.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500 sm:text-base">
              From about <strong className="text-ink-900">{rupees(low.total)}</strong> on the road in {city.name}, with {city.state} road tax and first-year insurance included.
            </p>
            <LeadButton title={`${car.full} offers in ${city.name}`} intent={`Best price in ${city.name}`} label={`Get a ${city.name} quote`} variant="lime" className="mt-4" />
          </Container>
        </div>
        <Section>
          <OnRoadTable carName={car.full} initialCity={city.name} variants={variants.map((v) => ({ name: v.name, price: v.price }))} />
        </Section>
        <Section className="bg-white">
          <h2 className="text-2xl font-extrabold">
            What the {car.name} costs in {city.name}
          </h2>
          <div className="prose-site max-w-3xl">
            <p>
              The ex-showroom price of the {car.full} is {priceRange(car)}. In {city.state}, road tax and registration add about {Math.round(city.rto * 100)} percent to the entry variant, which comes
              to roughly {rupees(low.reg)}. First-year insurance adds about {rupees(low.insurance)}, depending on the insurer and the add-ons you choose for your car.
            </p>
            <p>
              {low.tcs > 0
                ? `As the invoice value crosses ten lakh rupees, a one percent tax collected at source of about ${rupees(low.tcs)} also applies, and you can claim it against your income tax later. `
                : "The entry variant stays under the ten lakh rupee mark, so tax collected at source does not apply to it. "}
              Taken together, this brings the {variants[0].name} to approximately {rupees(low.total)} on the road in {city.name}. Treat these as estimates until a dealer gives you a written
              quote.
            </p>
            <p>
              Running costs matter too.{" "}
              {fp ? (
                <>
                  Petrol is listed at about ₹{fp.petrol.toFixed(2)} a litre and diesel at ₹{fp.diesel.toFixed(2)} in {city.name}
                  , so with
                </>
              ) : (
                <>Check today&apos;s fuel price in {city.name}; with</>
              )}{" "}
              {hasMileage(car) ? <>a claimed {car.mileage}</> : <>the mileage you get</>} you can work out a realistic monthly budget. Remember to add parking, cleaning and an annual service to arrive at the true cost of owning a car here.
            </p>
          </div>
        </Section>
        {list.length > 0 && (
          <Section>
            <h2 className="mb-4 text-2xl font-extrabold">
              {car.brand} showrooms in {city.name}
            </h2>
            <PlaceLocator items={list} />
          </Section>
        )}
        <Section className="bg-white">
          <LinkPills title={`${car.name} price in other cities`} links={others.map((c) => ({ label: `${car.name} price in ${c.name}`, href: `${carUrl(car)}/price-in-${c.slug}` }))} />
        </Section>
      </>
    );
  }
  if (!isTab(car, tab)) notFound();
  return <ModelTab car={car} tab={tab} />;
}
