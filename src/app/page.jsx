import { CalendarClock, Calculator, Fuel, Scale, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CarCard, Pic } from "@/components/cards";
import { Carousel } from "@/components/Carousel";
import { Hero, TabbedCars } from "@/components/home-client";
import { Reveal } from "@/components/motion";
import { ArticleCard, Container, Faq, JsonLd, Section, SectionHead } from "@/components/ui";
import { BRANDS, CARS, brandLogo, byPopularity, carPhoto, carUrl, onSale, priceRange } from "@/data/cars";
import { ARTICLES, CARS_BY_KEY, COMPARE_PAIRS, FACETS, FAQS_HOME, STORIES, articlesOf } from "@/data/content";
import { SITE, block } from "@/data/site";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "New cars in India: prices, reviews and offers",
    description: "Compare new cars in India with clear on-road prices, honest reviews, EMI tools and local dealers, and shortlist the right car in just a few minutes on Wheelora.",
    path: "/",
  });
}

// Hero: the three most popular cars on sale (raise a car's popularity in the CMS to feature it).
function heroSlides() {
  return byPopularity(onSale())
    .slice(0, 3)
    .map((c, i) => {
      const p = carPhoto(c);
      return {
        eyebrow: ["Most wanted", "Family favourite", "Safety first"][i],
        title: c.full,
        text: `${c.angle ? `${c.angle.charAt(0).toUpperCase()}${c.angle.slice(1)}, from` : "From"} ${priceRange(c).split(" - ")[0]} Lakh.`,
        href: carUrl(c),
        cta: `Explore the ${c.name}`,
        photo: { src: p.src, w: p.w, h: p.h },
        alt: `${c.full} on the road`,
        short: c.name,
      };
    });
}

const quick = [
  { href: "/compare-cars", label: "Compare cars", sub: "Side by side, spec by spec", Icon: Scale },
  { href: "/emi-calculator", label: "EMI calculator", sub: "Plan your monthly cost", Icon: Calculator },
  { href: "/latest-cars", label: "New launches", sub: "Just arrived in India", Icon: Sparkles },
  { href: "/electric-cars", label: "Electric", sub: "Range and charging", Icon: Zap },
  { href: "/upcoming-cars", label: "Upcoming", sub: "Launches to watch", Icon: CalendarClock },
  { href: "/fuel-prices", label: "Fuel prices", sub: "Today in your city", Icon: Fuel },
];

export default async function HomePage() {
  await ready();
  const top = byPopularity(onSale());
  const tab = (slug, label, linkLabel) => ({ label, href: `/new-cars/${slug}`, linkLabel, cars: top.filter(FACETS[slug].filter).slice(0, 8).map(cardOf) });
  const evs = byPopularity(CARS.filter((c) => c.fuels.includes("Electric")));
  const heroEv = evs[0];
  const upcoming = byPopularity(CARS.filter((c) => c.status === "upcoming"));
  const latest = byPopularity(CARS.filter((c) => c.status === "new-launch"));
  const newsList = articlesOf("news");
  const reviews = articlesOf("review");
  const advice = articlesOf("advice");
  // Each story in this section shows a different car, so no photo repeats side by side.
  const usedPhotos = new Set([newsList[0].photo]);
  const readMore = [newsList[1], reviews[0], reviews[1], advice[0], ...advice.slice(1), ...reviews.slice(2), ...newsList.slice(2)]
    .filter((a) => {
      if (!a || usedPhotos.has(a.photo)) return false;
      usedPhotos.add(a.photo);
      return true;
    })
    .slice(0, 4);
  const pairs = COMPARE_PAIRS.slice(0, 6).filter(([a, b]) => CARS_BY_KEY[a] && CARS_BY_KEY[b]);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }} />
      <Hero
        slides={heroSlides()}
        heading={[
          { text: block("home.hero.before", "Find the car that ") },
          { text: block("home.hero.highlight", "fits your life"), lime: true },
          { text: block("home.hero.after", ", not just your budget") },
        ]}
      />

      <Container className="relative z-10 -mt-1 lg:-mt-6">
        <Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quick.map(({ href, label, sub, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group mt-4 flex h-full items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card transition hover:-translate-y-0.5 hover:bg-lime-400 lg:mt-0 lg:flex-col lg:items-start"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 transition group-hover:bg-ink-950 group-hover:text-lime-400">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="hidden text-xs text-ink-500 group-hover:text-ink-800 sm:block">{sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <Section>
        <SectionHead
          title={block("home.shortlist.title", "The cars India is shortlisting")}
          sub={block("home.shortlist.sub", "Pick a body style and see what buyers like you are comparing right now.")}
        />
        <TabbedCars
          id="body"
          tabs={[
            tab("suv", "SUV", "See all SUV cars"),
            tab("hatchback", "Hatchback", "See all hatchback cars"),
            tab("sedan", "Sedan", "See all sedan cars"),
            tab("muv", "MUV", "See all MUV cars"),
            tab("luxury", "Luxury", "See all luxury cars"),
          ]}
        />
      </Section>

      <section className="bg-white py-10 lg:py-14">
        <Container>
          <Reveal>
            <SectionHead
              title={block("home.budget.title", "Shop by what you can spend")}
              sub={block("home.budget.sub", "We start from the budget, because that is where every good decision starts.")}
            />
            <TabbedCars
              id="budget"
              tabs={[
                tab("under-10-lakh", "Under ₹10 lakh", "See all cars under 10 lakh"),
                tab("under-15-lakh", "Under ₹15 lakh", "See all cars under 15 lakh"),
                tab("under-25-lakh", "Under ₹25 lakh", "See all cars under 25 lakh"),
                tab("above-25-lakh", "Above ₹25 lakh", "See all cars above 25 lakh"),
              ]}
            />
          </Reveal>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-ink-950 py-12 text-white lg:py-16">
        <Container className="relative">
          <Reveal>
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div className="overflow-hidden rounded-3xl">
                <Pic photo={carPhoto(heroEv)} alt={`${heroEv.full} electric car`} sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-16/10 h-full w-full object-cover" />
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-lime-400">
                  <Zap className="size-4" /> Electric spotlight
                </p>
                <h2 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">Going electric is finally a simple decision</h2>
                <p className="mt-3 leading-relaxed text-ink-300">
                  See real range, charging time and running cost side by side, then check how many fast chargers sit along your daily route before you commit.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/electric-cars" className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-ink-950 hover:bg-lime-300">
                    Explore electric cars
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Carousel label="Electric cars">
                {evs.map((c) => (
                  <div key={carUrl(c)} className="text-ink-900">
                    <CarCard car={cardOf(c)} />
                  </div>
                ))}
              </Carousel>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-10 lg:py-14">
        <Container>
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <SectionHead title={block("home.upcoming.title", "Coming soon")} href="/upcoming-cars" linkLabel="All upcoming cars" />
                <ol className="space-y-3">
                  {upcoming.slice(0, 4).map((c) => (
                    <li key={carUrl(c)}>
                      <Link href={carUrl(c)} className="group flex items-center gap-4 rounded-2xl border border-ink-100 p-3 transition hover:border-ink-900">
                        <span className="h-20 w-32 shrink-0 overflow-hidden rounded-xl">
                          <Pic photo={carPhoto(c)} alt={`${c.full} expected soon`} sizes="128px" className="h-full w-full object-cover transition group-hover:scale-105" />
                        </span>
                        <span>
                          <span className="block font-bold">{c.full}</span>
                          <span className="block text-sm text-ink-500">Expected {c.launch}</span>
                          <span className="block text-sm font-semibold">{priceRange(c)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <SectionHead title={block("home.launched.title", "Just launched")} href="/latest-cars" linkLabel="All new launches" />
                <ol className="space-y-3">
                  {latest.slice(0, 4).map((c) => (
                    <li key={carUrl(c)}>
                      <Link href={carUrl(c)} className="group flex items-center gap-4 rounded-2xl border border-ink-100 p-3 transition hover:border-ink-900">
                        <span className="h-20 w-32 shrink-0 overflow-hidden rounded-xl">
                          <Pic photo={carPhoto(c)} alt={`${c.full} recently launched`} sizes="128px" className="h-full w-full object-cover transition group-hover:scale-105" />
                        </span>
                        <span>
                          <span className="block font-bold">{c.full}</span>
                          <span className="block text-sm text-ink-500">{c.launch}</span>
                          <span className="block text-sm font-semibold">{priceRange(c)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section>
        <SectionHead title={block("home.brands.title", "Browse by brand")} href="/brands" linkLabel="All car brands" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {BRANDS.slice(0, 12).map((b) => {
            const logo = brandLogo(b.slug);
            return (
              <li key={b.slug}>
                <Link
                  href={`/brands/${b.slug}`}
                  aria-label={`${b.name} cars`}
                  title={`${b.name} cars`}
                  className="flex h-24 items-center justify-center rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:bg-lime-300/60 hover:shadow-lift"
                >
                  {logo ? (
                    <Image
                      src={logo.src}
                      alt={`${b.name} logo`}
                      width={logo.w}
                      height={logo.h}
                      unoptimized
                      className="h-auto max-h-16 w-full max-w-30 object-contain [filter:contrast(1.3)_saturate(1.3)_drop-shadow(0_0_0.5px_rgba(0,0,0,0.65))]"
                    />
                  ) : (
                    <span className="font-display font-bold">{b.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {BRANDS.length > 12 && (
          // Every brand is one click from the home page, so every car is two clicks away.
          <p className="mt-5 text-sm leading-7 text-ink-700">
            <span className="font-bold">More brands: </span>
            {BRANDS.slice(12).map((b, i) => (
              <span key={b.slug}>
                {i > 0 && ", "}
                <Link href={`/brands/${b.slug}`} className="font-semibold hover:text-lime-700 hover:underline">
                  {b.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </Section>

      <section className="bg-white py-10 lg:py-14">
        <Container>
          <Reveal>
            <SectionHead
              title={block("home.compare.title", "Close calls, settled")}
              sub={block("home.compare.sub", "The comparisons buyers ask about the most.")}
              href="/compare-cars"
              linkLabel="Compare any two cars"
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pairs.map(([a, b]) => {
                const x = CARS_BY_KEY[a];
                const y = CARS_BY_KEY[b];
                return (
                  <li key={a + b}>
                    <Link href={`/compare-cars/${a}-vs-${b}`} className="group block h-full overflow-hidden rounded-2xl border border-ink-100 transition hover:border-ink-900 hover:shadow-card">
                      <span className="relative grid grid-cols-2">
                        <Pic photo={carPhoto(x)} alt={`${x.full} in comparison`} sizes="(max-width: 640px) 45vw, 16vw" className="aspect-4/3 h-full w-full object-cover" />
                        <Pic photo={carPhoto(y)} alt={`${y.full} in comparison`} sizes="(max-width: 640px) 45vw, 16vw" className="aspect-4/3 h-full w-full object-cover" />
                        <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 text-xs font-extrabold text-ink-950 transition group-hover:scale-110">
                          VS
                        </span>
                      </span>
                      <span className="block p-3 text-sm font-bold">
                        {x.name} vs {y.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </Container>
      </section>

      <Section>
        <SectionHead title={block("home.read.title", "Read before you decide")} href="/news" linkLabel="All car news" />
        <div className="grid gap-5 lg:grid-cols-2">
          <ArticleCard a={newsList[0]} large />
          <div className="grid gap-5 sm:grid-cols-2">
            {readMore.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </div>
      </Section>

      <section className="bg-ink-950 py-10 text-white lg:py-14">
        <Container>
          <Reveal>
            <SectionHead
              dark
              title={block("home.stories.title", "Visual stories")}
              sub={block("home.stories.sub", "Quick swipeable picks, from family SUVs to city hatchbacks.")}
              href="/visual-stories"
              linkLabel="All visual stories"
            />
            <div>
              <Carousel label="Visual stories" item="w-[46%] sm:w-[30%] lg:w-[18%]">
                {STORIES.filter((s) => s.cars[0]).map((s) => (
                  <Link key={s.slug} href={`/visual-stories/${s.slug}`} className="group relative block aspect-9/14 overflow-hidden rounded-2xl">
                    <Pic
                      photo={carPhoto(s.cars[0])}
                      alt={`Cover image for ${s.title}`}
                      sizes="(max-width: 640px) 46vw, 18vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/20 to-transparent" />
                    <span className="absolute inset-x-3 bottom-3 text-sm font-bold leading-snug">{s.title}</span>
                  </Link>
                ))}
              </Carousel>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">A calmer way to buy a car</h2>
            <div className="prose-site">
              <p>
                {SITE.name} brings the full car-buying journey into one place. You can explore {CARS.length} models, filter them by budget, body type, fuel and seating, and see how each one compares
                on the things that affect daily life, from boot space and safety to real running costs.
              </p>
              <p>
                On-road prices stay visible without a form, because knowing the number should never require giving away your phone number. You only share your details when you decide that you want a
                dealer to call you with an offer, and you stay in control of who receives them.
              </p>
              <p>
                Before you decide, browse {ARTICLES.length} guides, reviews and news stories to see how each car suits the way you actually drive. Please confirm the final price with an authorised
                dealer.
              </p>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-extrabold sm:text-3xl">Questions buyers ask</h2>
            <Faq items={FAQS_HOME} />
          </div>
        </div>
      </Section>
    </>
  );
}
