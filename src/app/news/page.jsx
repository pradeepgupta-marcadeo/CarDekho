import { ArrowRight, Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Pic } from "@/components/cards";
import { Carousel } from "@/components/Carousel";
import { Reveal } from "@/components/motion";
import { ArticleCard, ArticleRow, Container, Guide, JsonLd, LinkPills, PageHead } from "@/components/ui";
import { BRANDS, brandLogo, carPhoto } from "@/data/cars";
import { STORIES, TOPICS, articlePhoto, articleUrl, articlesOf, newsByBrand, newsByTopic, newsViews, popularNews } from "@/data/content";
import { SITE } from "@/data/site";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Latest car news in India: launches and prices",
    description: "Read the latest car news in India by fuel, brand and topic, covering new launches, price changes, EV updates, mileage guides and spy shots, explained for car buyers.",
    path: "/news",
  });
}

function NewsBlock({ id, title, sub, href, linkLabel, items, layout = "grid", tone = "plain", logo }) {
  if (!items.length) return null;
  const dark = tone === "dark";
  const bg = dark ? "bg-ink-950 text-white" : tone === "white" ? "bg-white" : "";
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-32 py-9 lg:py-12 ${bg}`}>
      <Container>
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              {logo && brandLogo(logo) && (
                <Image
                  src={brandLogo(logo).src}
                  alt={`${title.replace(" News", "")} logo`}
                  width={brandLogo(logo).w}
                  height={brandLogo(logo).h}
                  unoptimized
                  className="h-10 w-auto max-w-24 object-contain"
                />
              )}
              <div>
                <h2 id={`${id}-title`} className="text-2xl font-extrabold sm:text-3xl">
                  {title}
                </h2>
                {sub && <p className={`mt-1 max-w-2xl text-sm ${dark ? "text-ink-300" : "text-ink-500"}`}>{sub}</p>}
              </div>
            </div>
            <Link href={href} className={`inline-flex items-center gap-1.5 text-sm font-bold hover:underline ${dark ? "text-lime-400" : ""}`}>
              {linkLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          {layout === "feature" && (
            <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
              <div className={dark ? "text-ink-900" : ""}>
                <ArticleCard a={items[0]} large />
              </div>
              <ul className="grid auto-rows-fr gap-3">
                {items.slice(1, 5).map((a) => (
                  <li key={a.slug} className="text-ink-900">
                    <ArticleRow a={a} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {layout === "grid" && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.slice(0, 4).map((a) => (
                <li key={a.slug} className="text-ink-900">
                  <ArticleCard a={a} />
                </li>
              ))}
            </ul>
          )}
          {layout === "carousel" && (
            <Carousel label={title}>
              {items.slice(0, 8).map((a) => (
                <div key={a.slug} className="h-full text-ink-900">
                  <ArticleCard a={a} />
                </div>
              ))}
            </Carousel>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

export default async function Page() {
  await ready();
  const all = articlesOf("news");
  const seen = new Set();
  // Show stories nobody has seen yet first, then repeat only if a section would run short.
  const pick = (list, n) => {
    const fresh = list.filter((a) => !seen.has(a.slug));
    const out = [...fresh, ...list.filter((a) => seen.has(a.slug))].slice(0, n);
    out.forEach((a) => seen.add(a.slug));
    return out;
  };
  const [lead, ...restLatest] = all;
  const latestSide = restLatest.slice(0, 4);
  const latestRow = restLatest.slice(4, 8);
  [lead, ...latestSide, ...latestRow].forEach((a) => seen.add(a.slug));
  const popular = popularNews().slice(0, 8);
  const jump = [
    ["latest", "Latest"],
    ["launches", "Launches"],
    ["popular", "Popular"],
    ["ev", "EV"],
    ["petrol", "Petrol"],
    ["diesel", "Diesel"],
    ["cng", "CNG"],
    ["hybrid", "Hybrid"],
    ["mileage", "Mileage"],
    ["comparisons", "Comparisons"],
    ["brands", "By brand"],
    ["reviews", "Reviews"],
    ["stories", "Visual stories"],
  ];
  const block = (key, sub, layout, tone = "plain") => (
    <NewsBlock
      key={key}
      id={key}
      title={TOPICS[key].label}
      sub={sub}
      href={`/news/topic/${key}`}
      linkLabel={`All ${/^(EV|CNG)/.test(TOPICS[key].navLabel) ? TOPICS[key].navLabel : TOPICS[key].navLabel.toLowerCase()}`}
      items={pick(newsByTopic(key), layout === "feature" ? 5 : layout === "carousel" ? 8 : 4)}
      layout={layout}
      tone={tone}
    />
  );
  // Picked before the launches block so that each section keeps the stories it already had.
  const fuelBlocks = [
    block("ev", "Launches, range and charging costs for electric cars.", "feature", "dark"),
    block("petrol", "Stories for the fuel most Indian families still choose.", "grid"),
    block("diesel", "What is changing for high-mileage and long-distance buyers.", "feature", "white"),
    block("cng", "Lower running costs, new variants and pump network updates.", "grid"),
    block("hybrid", "Strong and mild hybrids, with their real mileage and tax rules.", "carousel", "white"),
    block("mileage", "What your car will really return, and how to spend less on fuel.", "feature"),
    block("comparisons", "Close rivals, side by side, with a clear verdict.", "carousel", "white"),
  ];
  const launches = block("launches", "What is arriving in showrooms, and what is genuinely new.", "grid");
  const brandOrder = BRANDS.map((b) => ({ b, items: newsByBrand(b.slug) }))
    .filter((x) => x.items.length >= 2)
    .slice(0, 6);
  const reviews = articlesOf("review");
  const advice = articlesOf("advice");

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Car news", url: `${SITE.url}/news` }} />
      <PageHead crumbs={[{ label: "Car news" }]} title="Today's top car stories" intro="Launches, price moves and policy updates, each with a plain explanation of why it matters to you." />

      <nav aria-label="Jump to a news section" className="sticky top-16 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
        <ul className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 lg:px-6">
          {jump
            .filter(([id]) => id !== "reviews" || reviews.length > 0)
            .map(([id, label]) => (
              <li key={id} className="shrink-0">
                <a href={`#${id}`} className="block rounded-full px-3 py-3 text-sm font-bold text-ink-500 transition hover:text-ink-950">
                  {label}
                </a>
              </li>
            ))}
        </ul>
      </nav>

      <section id="latest" aria-labelledby="latest-title" className="scroll-mt-32 py-8 lg:py-10">
        <Container>
          <h2 id="latest-title" className="mb-4 text-2xl font-extrabold sm:text-3xl">
            Latest stories
          </h2>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <ArticleCard a={lead} large />
            <ul className="grid gap-5 sm:grid-cols-2">
              {latestSide.map((a) => (
                <li key={a.slug}>
                  <ArticleCard a={a} />
                </li>
              ))}
            </ul>
          </div>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestRow.map((a) => (
              <li key={a.slug}>
                <ArticleCard a={a} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {launches}

      <section id="popular" aria-labelledby="popular-title" className="scroll-mt-32 bg-white py-9 lg:py-12">
        <Container>
          <Reveal>
            <h2 id="popular-title" className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
              <Flame className="size-7 text-coral-500" />
              Most popular this week
            </h2>
            <ol className="mt-5 grid gap-x-8 gap-y-1 md:grid-cols-2">
              {popular.map((a, i) => (
                <li key={a.slug} className="border-b border-ink-100">
                  <Link href={articleUrl(a)} className="group flex items-center gap-4 py-3">
                    <span aria-hidden className="font-display w-9 shrink-0 text-3xl font-extrabold text-ink-200 transition group-hover:text-lime-500">
                      {i + 1}
                    </span>
                    <span className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                      <Pic photo={articlePhoto(a)} alt={a.image?.alt || `Photo for ${a.title}`} sizes="96px" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-bold leading-snug group-hover:underline">{a.title}</span>
                      <span className="text-xs text-ink-500">
                        {newsViews(a).toLocaleString("en-IN")} views · {a.date}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      {fuelBlocks}
      {block("prices", "Price changes, and what they mean for your on-road cost.", "feature", "white")}
      {block("spy", "Early test sightings, separated from pure speculation.", "grid")}
      {block("safety", "Crash ratings and driver assistance, in simple language.", "grid", "white")}
      {block("deals", "How current offers really work, and what to ask your dealer.", "grid")}
      {block("policy", "New rules on safety, tax and emissions, explained simply.", "grid", "white")}
      {block("sales", "Which cars are selling, and what the trends mean for you.", "grid")}

      <section id="brands" aria-labelledby="brands-title" className="scroll-mt-32 bg-white py-9 lg:py-12">
        <Container>
          <Reveal>
            <h2 id="brands-title" className="text-2xl font-extrabold sm:text-3xl">
              News by brand
            </h2>
            <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
              {BRANDS.filter((b) => newsByBrand(b.slug).length > 0).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/news/brand/${b.slug}`}
                    aria-label={`${b.name} news`}
                    title={`${b.name} news`}
                    className="flex h-20 items-center justify-center rounded-2xl border border-ink-100 p-3 transition hover:border-ink-900 hover:shadow-card"
                  >
                    {brandLogo(b.slug) ? (
                      <Image
                        src={brandLogo(b.slug).src}
                        alt={`${b.name} logo`}
                        width={brandLogo(b.slug).w}
                        height={brandLogo(b.slug).h}
                        unoptimized
                        className="h-auto max-h-12 w-full max-w-20 object-contain"
                      />
                    ) : (
                      <span className="font-display font-bold">{b.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>
      {brandOrder.map(({ b, items }, i) => (
        <NewsBlock
          key={b.slug}
          id={`brand-${b.slug}`}
          logo={b.slug}
          title={`${b.name} News`}
          href={`/news/brand/${b.slug}`}
          linkLabel={`All ${b.name} news`}
          items={pick(items, 4)}
          tone={i % 2 ? "white" : "plain"}
        />
      ))}

      <NewsBlock
        id="reviews"
        title="Expert Reviews"
        sub="Road tests that end with a clear verdict."
        href="/expert-reviews"
        linkLabel="All expert reviews"
        items={reviews}
        layout="carousel"
        tone="dark"
      />

      <section id="stories" aria-labelledby="stories-title" className="scroll-mt-32 py-9 lg:py-12">
        <Container>
          <Reveal>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 id="stories-title" className="text-2xl font-extrabold sm:text-3xl">
                Visual stories
              </h2>
              <Link href="/visual-stories" className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline">
                All visual stories
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div>
              <Carousel label="Visual stories" item="w-[46%] sm:w-[30%] lg:w-[18%]">
                {STORIES.filter((s) => s.cars[0]).map((s) => (
                  <Link key={s.slug} href={`/visual-stories/${s.slug}`} className="group relative block aspect-9/14 overflow-hidden rounded-2xl text-white">
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

      <NewsBlock
        id="tips"
        title="Buying Tips And Advice"
        sub="Short, practical guides for first-time buyers and owners."
        href="/tips-advice"
        linkLabel="All tips and advice"
        items={advice}
        tone="white"
      />

      <Guide
        title="Reading car news like a smart buyer"
        paras={[
          "Car news can be exciting, but it helps to separate confirmed facts from speculation. An official price announcement or launch date is something you can plan around, whereas spy shots and unnamed sources are only hints. Before you delay a purchase for a rumoured model, consider how long your current car can comfortably keep doing its job.",
          "Every story on this site links through to the related car, so that you can move from reading to comparing without searching again. Some stories here are sample articles written to show the format, and they should not be treated as actual reporting about any manufacturer or model.",
        ]}
      />
      <section className="bg-white py-9">
        <Container>
          <LinkPills title="Browse all news topics" links={Object.entries(TOPICS).map(([k, t]) => ({ label: t.label, href: `/news/topic/${k}` }))} />
        </Container>
      </section>
    </>
  );
}
