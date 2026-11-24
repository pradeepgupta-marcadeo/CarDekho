import Link from "next/link";
import { Pic } from "@/components/cards";
import { CompareHub } from "@/components/compare-view";
import { Breadcrumbs, Container, Faq, Guide, LinkPills, Section, SectionHead } from "@/components/ui";
import { BRANDS, byPopularity, carPhoto, CARS, priceRange } from "@/data/cars";
import { CARS_BY_KEY, COMPARE_PAIRS } from "@/data/content";
import { compareCar } from "@/lib/compare-data";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Compare cars side by side: specs and price",
    description: "Compare up to three cars on price, power, mileage, safety, running cost and features. See who wins each category, and read a clear verdict before you decide what to buy.",
    path: "/compare-cars",
  });
}

const validPairs = () => COMPARE_PAIRS.filter(([a, b]) => CARS_BY_KEY[a] && CARS_BY_KEY[b]);

function PairCard({ a, b }) {
  const x = CARS_BY_KEY[a];
  const y = CARS_BY_KEY[b];
  return (
    <Link href={`/compare-cars/${a}-vs-${b}`} className="group block h-full overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="relative grid grid-cols-2">
        {[x, y].map((c) => (
          <span key={c.slug} className="block aspect-4/3 overflow-hidden">
            <Pic photo={carPhoto(c)} alt={`${c.full} in this comparison`} sizes="(max-width: 640px) 45vw, 16vw" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </span>
        ))}
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 font-display text-xs font-extrabold text-ink-950 ring-4 ring-white transition group-hover:scale-110">
          VS
        </span>
      </span>
      <span className="block p-3 text-sm font-bold">
        {x.name} vs {y.name}
        <span className="mt-0.5 block text-xs font-normal text-ink-500">
          {x.brand} and {y.brand}
        </span>
      </span>
    </Link>
  );
}

const FAQS = [
  {
    q: "How many cars can I compare at once?",
    a: "You can compare up to three cars at the same time. Two is usually best for a final decision, while three helps when you are still narrowing down a shortlist.",
  },
  {
    q: "Are the winners in the comparison final?",
    a: "No. The count only shows which car leads on each number. Comfort, service access and how the car suits your family matter just as much, so take a test drive.",
  },
  {
    q: "Why does the on-road price change when I pick a city?",
    a: "Road tax and registration are set by each state, so the same variant can cost more in one city than in another. Insurance can also vary, which is why it helps to compare final totals.",
  },
  {
    q: "How accurate is the running cost figure?",
    a: "It is a simple estimate from claimed mileage or range and an assumed energy price. Real-world costs are usually higher, especially in traffic, so treat it as a way to compare cars rather than a prediction.",
  },
];

export default async function Page() {
  await ready();
  const ranked = byPopularity(CARS);
  // Only what the pickers need; full data for the first two, the rest loads when picked.
  const cars = ranked.map((c) => {
    const p = carPhoto(c);
    return { key: c.key, brand: c.brand, full: c.full, priceText: priceRange(c), photo: { src: p.src, w: p.w, h: p.h } };
  });
  const initial = ranked.slice(0, 2).map(compareCar);
  const groups = [
    ["SUV comparisons", "The most searched match-ups in the most popular segment.", (c) => c.body === "SUV"],
    ["Hatchback and sedan comparisons", "Close calls for city drivers and long-distance commuters.", (c) => c.body === "Hatchback" || c.body === "Sedan"],
    ["Family and luxury comparisons", "Seven-seaters and premium cars, side by side.", (c) => c.body === "MUV" || c.body === "Luxury"],
  ];
  return (
    <>
      <CompareHub
        cars={cars}
        initial={initial}
        title="Put any cars head to head"
        intro="Pick up to three cars. We show who wins each category, what each one costs to own, and every specification side by side."
        crumbs={<Breadcrumbs items={[{ label: "New cars", href: "/new-cars" }, { label: "Compare cars" }]} />}
      />
      {groups.map(([title, sub, test]) => {
        const list = validPairs().filter(([a]) => test(CARS_BY_KEY[a]));
        return (
          list.length > 0 && (
            <Section key={title}>
              <SectionHead title={title} sub={sub} />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {list.map(([a, b]) => (
                  <li key={a + b}>
                    <PairCard a={a} b={b} />
                  </li>
                ))}
              </ul>
            </Section>
          )
        );
      })}
      <Guide
        white
        title="How to compare two cars properly"
        paras={[
          "Start by comparing the variants you can actually afford, not the top trims. Two cars can look evenly matched at the top of their ranges, yet feel very different at your price, where one may have far more safety equipment or a better engine. Always compare on-road totals for your city too, since taxes can change the gap.",
          "Then separate what you will feel every day from what simply looks good on paper. A difference of a few horsepower rarely matters, but rear-seat space, ride comfort and visibility affect every journey. If two cars are close on the spec sheet, the one that feels easier and calmer on your own test route is usually the right choice.",
          "Do not forget ownership costs. Compare the service network in your area, the likely resale value and insurance premiums, along with fuel consumption. A car that costs slightly more to buy can work out cheaper over five years if it holds its value and has lower maintenance bills, so try to look at the entire period.",
          "Use this page as a checklist, and take notes during your test drives. Comparison values are updated regularly but can change, so please verify them against the official brochures of each car before making your final decision.",
        ]}
      />
      <Section>
        <h2 className="mb-4 text-2xl font-extrabold">Comparison questions</h2>
        <Faq items={FAQS} />
      </Section>
      <section className="bg-white py-9">
        <Container>
          <LinkPills title="Browse cars by brand" links={BRANDS.map((b) => ({ label: `${b.name} cars`, href: `/brands/${b.slug}` }))} />
        </Container>
      </section>
    </>
  );
}
