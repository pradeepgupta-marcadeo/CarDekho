import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { LeadButton, Pic } from "@/components/cards";
import { OnRoadTable } from "@/components/tools";
import { Breadcrumbs, Container, LinkPills, Section } from "@/components/ui";
import { carPhoto, CARS, carUrl, getCar, lakh, specGroups, variantsOf, withVariant } from "@/data/cars";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return CARS.flatMap((c) => variantsOf(c).map((v) => ({ brand: c.brandSlug, model: c.slug, variant: v.slug })));
}

export async function generateMetadata({ params }) {
  await ready();
  const { brand, model, variant } = await params;
  const car = getCar(brand, model);
  const v = car && variantsOf(car).find((x) => x.slug === variant);
  if (!car || !v) return {};
  const label = withVariant(car.name, v.name);
  // Longest wording that still fits the title length; the variant name itself is never cut, so titles stay unique.
  const title = [`${label} price and features`, `${label} price`, label].find((t) => t.length <= 60) ?? label;
  return pageMeta({
    title,
    description: `The ${withVariant(car.full, v.name)} costs ₹${lakh(v.price)} ex-showroom. See its features, on-road price, specifications and how it compares with other ${car.name} trims.`,
    path: `${carUrl(car)}/variants/${v.slug}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { brand, model, variant } = await params;
  const car = getCar(brand, model);
  const all = car ? variantsOf(car) : [];
  const idx = all.findIndex((x) => x.slug === variant);
  if (!car) notFound();
  // A variant that is no longer sold (or an old URL) goes to the car's variant list: one 301 hop.
  if (idx < 0) permanentRedirect(`${carUrl(car)}/variants`);
  const v = all[idx];
  const next = all[idx + 1];
  const prev = all[idx - 1];
  return (
    <>
      <div className="bg-white">
        <Container className="py-6">
          <Breadcrumbs items={[{ label: "New cars", href: "/new-cars" }, { label: car.name, href: carUrl(car) }, { label: "Variants", href: `${carUrl(car)}/variants` }, { label: v.name }]} />
          <div className="mt-4 grid items-center gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl">
              <Pic photo={carPhoto(car)} alt={`${car.full} ${v.name} exterior`} sizes="(max-width: 1024px) 100vw, 50vw" priority className="aspect-16/10 w-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                {withVariant(car.full, v.name)}
              </h1>
              <p className="mt-3 text-3xl font-extrabold">
                ₹{lakh(v.price)} <span className="text-sm font-medium text-ink-500">ex-showroom</span>
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {v.highlights.map((h) => (
                  <li key={h} className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold">
                    {h}
                  </li>
                ))}
              </ul>
              <LeadButton title={`${car.full} ${v.name} best price`} intent="Best price on this variant" label="Get best price on this trim" variant="lime" className="mt-5" />
            </div>
          </div>
        </Container>
      </div>
      <Section>
        <OnRoadTable carName={`${car.full} ${v.name}`} variants={[{ name: v.name, price: v.price, fuel: v.fuel, onRoad: v.onRoad }]} />
      </Section>
      <Section className="bg-white">
        <h2 className="text-2xl font-extrabold">
          Is the {v.name} the right {car.name} trim?
        </h2>
        <div className="prose-site max-w-3xl">
          <p>
            This {v.fuel.toLowerCase()} {v.trans.toLowerCase()} variant sits at position {idx + 1} of {all.length} in the {car.name} line-up. Its most useful equipment includes{" "}
            {v.highlights.join(", ").toLowerCase()}, and every {car.name} shares the same basic strengths: {car.pros[0].toLowerCase()} and {car.pros[1].toLowerCase()}.
          </p>
          <p>
            {prev
              ? `Compared with the ${prev.name}, you pay about ₹${lakh(v.price - prev.price)} more. Ask yourself whether the additional equipment will really be used every week, since that is the fairest test of an upgrade.`
              : `As the entry point to the range, this is the most affordable way to own a ${car.name}, and it suits buyers who care most about the monthly instalment and running costs.`}{" "}
            {next
              ? `Stepping up to the ${next.name} costs a further ₹${lakh(next.price - v.price)}, so compare both on the same day if you can.`
              : `As the top of the range, it includes everything on offer, though it is wise to compare it with larger cars at a similar price.`}
          </p>
          <p>
            Before booking, take a test drive in this exact fuel and gearbox combination, because showroom cars can differ. Also check the waiting period for this trim in your city, as popular
            variants can take longer to arrive. Prices and features are updated regularly but can change, so please confirm the final details with an authorised {car.brand} dealer.
          </p>
        </div>
      </Section>
      <Section>
        <h2 className="text-2xl font-extrabold">Key specifications</h2>
        <dl className="mt-4 grid gap-x-8 rounded-2xl bg-white p-5 text-sm shadow-card sm:grid-cols-2">
          {specGroups(car)
            .slice(0, 2)
            .flatMap((g) => g.rows)
            .map(([k, val]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-ink-100 py-2.5">
                <dt className="text-ink-500">{k}</dt>
                <dd className="text-right font-semibold">{val}</dd>
              </div>
            ))}
        </dl>
        <p className="mt-3 text-sm">
          <Link href={`${carUrl(car)}/specs`} className="font-bold underline">
            See the full {car.name} specifications
          </Link>
        </p>
        <div className="mt-6">
          <LinkPills title={`Other ${car.name} variants`} links={all.filter((x) => x.slug !== v.slug).map((x) => ({ label: `${car.name} ${x.name}`, href: `${carUrl(car)}/variants/${x.slug}` }))} />
        </div>
      </Section>
    </>
  );
}
