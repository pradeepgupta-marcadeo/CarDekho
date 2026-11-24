import Link from "next/link";
import { Pic } from "@/components/cards";
import { Guide, PageHead, Section } from "@/components/ui";
import { carPhoto } from "@/data/cars";
import { COLLECTIONS } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Curated car collections and shortlists",
    description: "Browse hand-picked car lists: best first cars, five-star safety picks, low running cost options and weekend adventure machines. A faster way to start your shortlist.",
    path: "/car-collections",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "Car collections" }]}
        title="Shortlists that do the hard work"
        intro="Start with the question you actually have, and see a focused list instead of the full catalogue."
      />
      <Section>
        <ul className="grid gap-5 md:grid-cols-2">
          {COLLECTIONS.filter((c) => c.cars[0]).map((c) => (
            <li key={c.slug}>
              <Link href={`/car-collections/${c.slug}`} className="group relative block aspect-video overflow-hidden rounded-3xl text-white">
                <Pic
                  photo={carPhoto(c.cars[0])}
                  alt={`${c.cars[0].full}, part of ${c.title}`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
                <span className="absolute inset-x-5 bottom-5">
                  <span className="font-display block text-2xl font-extrabold">{c.title}</span>
                  <span className="mt-1 block text-sm text-ink-200">
                    {c.blurb} {c.cars.length} cars.
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Guide
        white
        title="Why start with a shortlist?"
        paras={[
          "Too much choice can make a decision harder, and a catalogue of dozens of cars easily becomes overwhelming. Collections reduce the field to the handful of cars that answer one specific question, whether that is the safest choice in your budget or the cheapest car to run if you cover a lot of distance each month.",
          "Treat each list as a starting point rather than a final answer. A car can suit a list perfectly and still be wrong for you, perhaps since it does not fit your parking space or your family. Open the cars that interest you, read their pros and cons, and then compare your two favourites side by side.",
          "It also helps to look across lists. A car that appears in both the safety picks and the low running cost group is usually a very sensible all-rounder. If you find yourself drawn to the weekend adventure list, be honest about how often you would actually leave the tarmac compared with daily traffic.",
          "Each collection is picked automatically from current prices and specifications, so treat it as a starting point rather than a personal recommendation. In the live product, each list would explain its selection criteria clearly and be reviewed regularly, so that it stays current.",
        ]}
      />
    </>
  );
}
