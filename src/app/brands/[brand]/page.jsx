import { notFound } from "next/navigation";
import { CarCard } from "@/components/cards";
import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { BRANDS, byPopularity, carUrl, getBrand, lakh, priceRange } from "@/data/cars";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return BRANDS.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { brand } = await params;
  const b = getBrand(brand);
  if (!b) return {};
  const top = byPopularity(b.cars)[0];
  return pageMeta({
    title: `${b.name} cars in India: prices and models`,
    description: `See ${b.cars.length} ${b.name} cars with prices, mileage and ratings, including the ${top.name} from ${priceRange(top)}. Find ${b.name} showrooms and the latest offers.`,
    path: `/brands/${b.slug}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { brand } = await params;
  const b = getBrand(brand);
  if (!b) notFound();
  const cars = byPopularity(b.cars);
  const [top, second] = cars;
  const low = Math.min(...cars.map((c) => c.min));
  const high = Math.max(...cars.map((c) => c.max));
  return (
    <>
      <PageHead
        crumbs={[{ label: "Car brands", href: "/brands" }, { label: b.name }]}
        title={`${b.name} car range`}
        intro={`${cars.length} ${cars.length === 1 ? "model" : "models"} from ₹${lakh(low)} to ₹${lakh(high)}, with honest pros and cons for each.`}
      />
      <Section>
        <h2 className="mb-4 text-xl font-bold">{b.name} models</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((c, i) => (
            <li key={carUrl(c)}>
              <CarCard car={cardOf(c)} priority={i < 2} />
            </li>
          ))}
        </ul>
      </Section>
      <Guide
        white
        title={`Which ${b.name} car should you buy?`}
        paras={[
          `Most shoppers begin with the ${top.full}, which is ${top.angle}. It is listed at ${priceRange(top)}, and its main strength is that ${top.pros[0].toLowerCase()}. ${second ? `If that does not quite fit, the ${second.full} takes a different route as ${second.angle}, at ${priceRange(second)}.` : `It is the only ${b.name} in this catalogue right now, so compare it with close rivals from other makers.`}`,
          `When you compare within one brand, you avoid many of the usual uncertainties, because servicing, parts and dealer experience stay broadly the same. That makes the decision mostly about size, budget and equipment. Check the price of a higher trim of a smaller car against a lower trim of a bigger one, since the two often overlap.`,
          `Before you book, find the nearest ${b.name} showroom and workshop, and ask about waiting periods for your preferred variant and colour in your city. It is also worth asking what the warranty covers and whether an extended plan is good value. Prices and details are updated regularly but can change, so please confirm them with an authorised ${b.name} dealer.`,
          `Ownership matters as much as the purchase. Ask what a typical annual service costs, how far your nearest authorised workshop is and how quickly common parts arrive in your city. It also helps to speak with one or two current ${b.name} owners, because their everyday experience will tell you things that no brochure, advertisement or short test drive ever really can.`,
        ]}
      />
      <Section>
        <LinkPills title="Other car brands" links={BRANDS.filter((x) => x.slug !== b.slug).map((x) => ({ label: `${x.name} cars`, href: `/brands/${x.slug}` }))} />
      </Section>
    </>
  );
}
