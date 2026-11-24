import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCard, LeadButton, Pic } from "@/components/cards";
import { Carousel } from "@/components/Carousel";
import { CompareView } from "@/components/compare-view";
import { Breadcrumbs, Container, Faq, LinkPills, Section, SectionHead } from "@/components/ui";
import { CARS, byPopularity, carPhoto, carUrl, priceRange } from "@/data/cars";
import { CARS_BY_KEY, COMPARE_PAIRS } from "@/data/content";
import { cardOf } from "@/lib/cards";
import { compareCar } from "@/lib/compare-data";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

// The CMS pairs (from the source's "compare with" lists). While it has none, the two most popular cars of one body
// type stand in, so the page and the build never end up with an empty list.
const valid = () => {
  const pairs = COMPARE_PAIRS.filter(([a, b]) => CARS_BY_KEY[a] && CARS_BY_KEY[b]);
  if (pairs.length) return pairs;
  const [a, ...rest] = [...CARS].sort((x, y) => y.popularity - x.popularity);
  const b = rest.find((c) => c.body === a?.body) ?? rest[0];
  return a && b ? [[a.key, b.key]] : [];
};
const slugOf = ([a, b]) => `${a}-vs-${b}`;
const find = (pair) => valid().find((p) => slugOf(p) === pair);

export async function generateStaticParams() {
  await ready();
  return valid().map((p) => ({ pair: slugOf(p) }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { pair } = await params;
  const f = find(pair);
  if (!f) return {};
  const [x, y] = [CARS_BY_KEY[f[0]], CARS_BY_KEY[f[1]]];
  return pageMeta({
    title: `${x.name} vs ${y.name}: price and specs compared`,
    description: `${x.full} or ${y.full}? Compare price, power, mileage, safety, running cost and every feature side by side, then read which one suits your needs and your budget.`,
    path: `/compare-cars/${pair}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { pair } = await params;
  const f = find(pair);
  if (!f) notFound();
  const x = CARS_BY_KEY[f[0]];
  const y = CARS_BY_KEY[f[1]];
  const others = byPopularity(CARS.filter((c) => c.body === x.body && c.slug !== x.slug && c.slug !== y.slug && c.status !== "upcoming")).slice(0, 6);
  const morePairs = valid()
    .filter((p) => slugOf(p) !== pair)
    .slice(0, 8);
  const faqs = [
    {
      q: `Which is cheaper, the ${x.name} or the ${y.name}?`,
      a: `The ${x.name} is listed at ${priceRange(x)} and the ${y.name} at ${priceRange(y)}. Compare the on-road price of the variants you would actually buy, because road tax and insurance can change the gap.`,
    },
    {
      q: `Which has more boot space?`,
      a: `The ${x.name} offers ${x.boot} litres and the ${y.name} offers ${y.boot} litres. The shape of the boot and the loading height matter too, so try your usual luggage in both cars.`,
    },
    {
      q: `Which is safer?`,
      a: `${[x, y].map((c) => (c.ncap > 0 ? `The ${c.name} carries a ${c.ncap}-star rating.` : `The ${c.name} has no crash test rating listed yet.`)).join(" ")} Equipment changes by trim, so check the official crash test report for the exact variant you plan to buy.`,
    },
    {
      q: `Which is better for long highway trips?`,
      a: `With ${x.power} against ${y.power}, the stronger car will overtake more easily, though comfort and rear-seat space matter as much on long drives. A test drive on an open road is the best way to decide.`,
    },
  ];
  return (
    <>
      <div className="bg-ink-950 text-white">
        <Container className="py-6 lg:py-9">
          <div className="[&_a]:text-ink-300 [&_nav]:text-ink-300 [&_span]:text-ink-200">
            <Breadcrumbs items={[{ label: "Compare cars", href: "/compare-cars" }, { label: `${x.name} vs ${y.name}` }]} />
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">
            {x.full} <span className="text-lime-400">vs</span> {y.full}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-300 sm:text-base">
            The {x.name} is {x.angle}, while the {y.name} is {y.angle}. Here is how they compare on everything that matters.
          </p>
          <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
            {[x, y].map((c, i) => (
              <article key={c.slug} className="overflow-hidden rounded-3xl bg-white text-ink-900 shadow-lift">
                <div className="aspect-video overflow-hidden">
                  <Pic photo={carPhoto(c)} alt={`${c.full} front view`} sizes="(max-width: 640px) 100vw, 50vw" priority={i === 0} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <h2 className="text-xl font-extrabold">
                      <Link href={carUrl(c)} className="hover:underline">
                        {c.full}
                      </Link>
                    </h2>
                    <p className="font-bold">{priceRange(c)}</p>
                  </div>
                  <LeadButton title={`Best price for the ${c.full}`} intent="Best price" label="Get best price" variant="lime" />
                </div>
              </article>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[38%] hidden size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 font-display text-xl font-extrabold text-ink-950 ring-8 ring-ink-950 sm:grid"
            >
              VS
            </span>
          </div>
        </Container>
      </div>
      <Container>
        <CompareView cars={[compareCar(x), compareCar(y)]} />
      </Container>
      <Section>
        <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold">Our take on this comparison</h2>
          <div className="prose-site max-w-3xl">
            <p>
              On paper, the {x.name} and {y.name} attract many of the same buyers, yet they feel like quite different propositions once you spend time with them. The {x.name} is {x.angle}, whereas the{" "}
              {y.name} is {y.angle}. Your choice should depend on which of those descriptions sounds more like your own daily routine.
            </p>
            <p>
              Budget is a sensible tie-breaker, but compare the on-road price of the specific variants you would actually buy, in your own city. Check the service network and likely resale value too,
              as they often matter more over five years than small differences in equipment. Drive both on the same day, on a route you know well, with the people who will usually travel with you.
            </p>
            <p>Figures on this page are updated regularly but can change, so confirm them against the official brochures and ask each dealer for a written quote before you decide.</p>
          </div>
        </div>
      </Section>
      <Section>
        <h2 className="mb-4 text-2xl font-extrabold">
          {x.name} vs {y.name} questions
        </h2>
        <Faq items={faqs} />
      </Section>
      {others.length > 0 && (
        <section className="bg-white py-10 lg:py-14">
          <Container>
            <SectionHead
              title="Other cars you could consider"
              sub={`More ${x.body === "SUV" || x.body === "MUV" ? x.body : x.body.toLowerCase()} options in the catalogue.`}
              href="/new-cars"
              linkLabel="See all new cars"
            />
            <Carousel label="Other cars to consider">
              {others.map((c) => (
                <CarCard key={carUrl(c)} car={cardOf(c)} />
              ))}
            </Carousel>
          </Container>
        </section>
      )}
      <Section>
        <LinkPills
          title="More comparisons"
          links={[
            ...morePairs.map((p) => ({ label: `${CARS_BY_KEY[p[0]].name} vs ${CARS_BY_KEY[p[1]].name}`, href: `/compare-cars/${slugOf(p)}` })),
            { label: "Compare any other cars", href: "/compare-cars" },
          ]}
        />
      </Section>
    </>
  );
}
