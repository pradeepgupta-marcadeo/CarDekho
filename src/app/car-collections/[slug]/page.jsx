import { notFound } from "next/navigation";
import { CarCard } from "@/components/cards";
import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { carUrl, priceRange } from "@/data/cars";
import { COLLECTIONS } from "@/data/content";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

const valid = () => COLLECTIONS.filter((c) => c.cars[0]);

export async function generateStaticParams() {
  await ready();
  return valid().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  await ready();
  const c = valid().find((x) => x.slug === undefined || x.slug === "");
  const { slug } = await params;
  const col = valid().find((x) => x.slug === slug) ?? c;
  if (!col) return {};
  return pageMeta({
    title: `${col.title} in India`,
    description: `${col.blurb} Compare ${col.cars.length} cars, including the ${col.cars[0].full}, by price, mileage and safety, and see which suits you best.`,
    path: `/car-collections/${col.slug}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { slug } = await params;
  const col = valid().find((x) => x.slug === slug);
  if (!col) notFound();
  const [a, b, d] = col.cars;
  return (
    <>
      <PageHead crumbs={[{ label: "Car collections", href: "/car-collections" }, { label: col.title }]} title={`Our list: ${col.title.toLowerCase()}`} intro={col.blurb} />
      <Section>
        <h2 className="mb-4 text-xl font-bold">Cars on this list</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {col.cars.map((c, i) => (
            <li key={carUrl(c)}>
              <CarCard car={cardOf(c)} priority={i < 2} />
            </li>
          ))}
        </ol>
      </Section>
      <Guide
        white
        title="How to choose from this list"
        paras={[
          `${col.blurb} We have listed ${col.cars.length} options here, led by the ${a.full}, which is ${a.angle}. It is priced at ${priceRange(a)}, and its main strength is that ${a.pros[0].toLowerCase()}, although you should be aware that ${a.cons[0].toLowerCase()}.`,
          b
            ? `The ${b.full} offers a different balance, as ${b.angle}. It sits at ${priceRange(b)}, and buyers usually like it because ${b.pros[0].toLowerCase()}. If you are torn between these two, a side-by-side comparison will show you exactly where each one pulls ahead on space, safety and running cost.`
            : `Open this car's full page to see its variants, on-road price in your city and how it compares with close rivals in the same price band before you make a final decision.`,
          d
            ? `Do not overlook the ${d.full} either, which is ${d.angle}. The best choice depends on your own priorities, so rank what matters most to you, drive your top two on the same day and ask each dealer for a written quote, comparing the full on-road totals rather than just the discounts.`
            : `The best choice depends on your own priorities, so rank what matters most to you, take a test drive on familiar roads and ask each dealer for a written quote, comparing the on-road totals.`,
          `This list is picked automatically from current prices and specifications, so treat it as a starting point rather than a personal recommendation. Please confirm the latest specifications, safety ratings and prices with authorised dealers before you decide on any of the cars shown here.`,
        ]}
      />
      <Section>
        <LinkPills
          title="Other collections"
          links={valid()
            .filter((x) => x.slug !== slug)
            .map((x) => ({ label: x.title, href: `/car-collections/${x.slug}` }))}
        />
      </Section>
    </>
  );
}
