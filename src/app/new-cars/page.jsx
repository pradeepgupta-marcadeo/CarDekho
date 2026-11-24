import { NewCarFilters } from "@/components/filters";
import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { BRANDS, byPopularity, CARS } from "@/data/cars";
import { FACETS } from "@/data/content";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "New cars in India: prices and filters",
    description: "Explore every new car in India with live filters for budget, body type, fuel, seats and safety. Compare prices and shortlist the right car in a few minutes.",
    path: "/new-cars",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "New cars" }]}
        title="Explore every new car in one place"
        intro={`Narrow down ${CARS.length} models by the things that actually matter to you, and watch the list update instantly.`}
      />
      <Section>
        <NewCarFilters cars={byPopularity(CARS).map(cardOf)} />
      </Section>
      <Section className="bg-white">
        <div className="grid gap-6 lg:grid-cols-2">
          <LinkPills title="Popular ways to browse" links={Object.entries(FACETS).map(([slug, f]) => ({ label: f.label, href: `/new-cars/${slug}` }))} />
          <LinkPills title="Browse by brand" links={BRANDS.map((b) => ({ label: `${b.name} cars`, href: `/brands/${b.slug}` }))} />
        </div>
      </Section>
      <Guide
        title="How to shortlist a new car without the stress"
        paras={[
          "Start with a monthly number rather than a sticker price. Work out what EMI you can comfortably carry along with fuel, insurance and servicing, and then convert that into an on-road budget. This stops the common trap of falling for a car that looks affordable in a showroom but feels tight once every bill has arrived.",
          "Next, be honest about how the car will be used. If most of your driving is in the city, a compact car with an automatic gearbox will make daily life much easier than a large SUV. If you regularly carry parents and luggage on long trips, then rear-seat comfort, boot space and highway stability should rise to the top of your list.",
          "Use the filters above to get down to three or four cars, and then open their price pages for your own city, since road tax can shift the final number by a surprising amount. From there, compare two cars side by side and look closely at the variants you can actually afford, not just the top trims used in advertising.",
          "Finally, take test drives on the same day if you can, because differences are easiest to feel back to back. Prices and specifications are updated regularly but can change, so please confirm them with an authorised dealer before you pay a booking amount.",
        ]}
      />
    </>
  );
}
