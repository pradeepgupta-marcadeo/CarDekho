import { notFound } from "next/navigation";
import { NewCarFilters } from "@/components/filters";
import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { byPopularity, CARS, priceRange } from "@/data/cars";
import { FACETS } from "@/data/content";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return Object.keys(FACETS).map((facet) => ({ facet }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { facet } = await params;
  const f = FACETS[facet];
  if (!f) return {};
  const n = CARS.filter(f.filter).length;
  return pageMeta({
    title: `${f.label} in India: prices and top picks`,
    description: `Compare ${n} ${f.label.toLowerCase()} in India by price, fuel, seats and safety. See our top picks, on-road costs and buying advice to find the right one for you.`,
    path: `/new-cars/${facet}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { facet } = await params;
  const f = FACETS[facet];
  if (!f) notFound();
  const list = byPopularity(CARS.filter(f.filter));
  const [a, b, c] = list;
  const label = f.label.toLowerCase();
  return (
    <>
      <PageHead crumbs={[{ label: "New cars", href: "/new-cars" }, { label: f.label }]} title={f.h1} intro={f.intro} />
      <Section>
        <NewCarFilters cars={list.map(cardOf)} />
      </Section>
      <Guide
        white
        title={`Choosing between ${label}`}
        paras={[
          `${f.intro} On this page you can compare ${list.length} options, with ${a?.full ?? "our top pick"} currently the most popular choice in this list.`,
          a && b
            ? `${a.full} is ${a.angle}, and it sits at ${priceRange(a)}. ${b.full} takes a different approach as ${b.angle}, priced at ${priceRange(b)}. If these two are already on your shortlist, open a comparison to see exactly where each one pulls ahead, particularly on boot space, safety and running cost.`
            : `Use the filters above to narrow down the list by fuel type, seats and safety rating, and open any model to see its on-road price in your city along with honest pros and cons.`,
          c
            ? `Also worth a look is the ${c.full}, which is ${c.angle}. A useful way to choose among ${label} is to rank what matters most to you first, whether that is price, comfort, features or resale, and to resist being swayed by a single headline feature in an advertisement.`
            : `A useful way to choose is to rank what matters most to you first, whether that is price, comfort, features or resale, and to resist being swayed by any single headline feature you see in an advertisement.`,
          `Once you have two favourites, book test drives on the same day, and take along the people who will ride with you most often. Ask for written quotes and compare the on-road totals rather than the discounts alone. Prices change from time to time, so confirm the current figures with an authorised dealer.`,
        ]}
      />
      <Section>
        <LinkPills
          title="Explore related categories"
          links={Object.entries(FACETS)
            .filter(([s]) => s !== facet)
            .map(([s, x]) => ({ label: x.label, href: `/new-cars/${s}` }))}
        />
      </Section>
    </>
  );
}
