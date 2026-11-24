import { Camera, Check, Clock, Eye, Palette, Pencil, X } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { byPopularity, CARS, carPhoto, carUrl, hasMileage, onSale, priceRange, variantsOf } from "@/data/cars";
import { CARS_BY_KEY, articleHero, articlePhoto, articleUrl, articlesOf } from "@/data/content";
import { SITE } from "@/data/site";
import { cardOf } from "@/lib/cards";
import { buildStory, nearestRival, storyWords } from "@/lib/news-story";
import { BrandGrid } from "./brand-grid";
import { CarCard, Pic } from "./cards";
import { Carousel } from "./Carousel";
import { CommentBox, CompareSlider, Helpful, MobileOfferBar, ShareRail, SideTabs } from "./news-client";
import { Breadcrumbs, FaqBlock, JsonLd, SourceLine } from "./ui";

function Rich({ text }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/);
        return m ? (
          <Link key={i} href={m[2]} className="font-medium text-lime-700 underline-offset-2 hover:underline">
            {m[1]}
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        );
      })}
    </>
  );
}

function CellView({ cell }) {
  if (typeof cell === "string") return <>{cell}</>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {cell.yes ? (
        <span className="grid size-5 place-items-center rounded bg-lime-400 text-ink-950">
          <Check className="size-3.5" strokeWidth={3} />
          <span className="sr-only">Yes</span>
        </span>
      ) : (
        <span className="grid size-5 place-items-center rounded bg-coral-500 text-white">
          <X className="size-3.5" strokeWidth={3} />
          <span className="sr-only">No</span>
        </span>
      )}
      {cell.note && <span>({cell.note})</span>}
    </span>
  );
}

function BlockView({ b }) {
  switch (b.t) {
    case "p":
      return (
        <p className="mt-4 text-[17px] leading-[1.8] text-ink-800">
          <Rich text={b.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-3 pl-6 text-[17px] leading-[1.8] text-ink-800 marker:text-ink-900">
          {b.items.map((it) => (
            <li key={it.slice(0, 50)}>
              <Rich text={it} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="scrollbar-none relative mt-4 overflow-x-auto">
          <table className="w-full min-w-120 border-collapse border border-ink-200 text-sm">
            <caption className="sr-only">{b.caption}</caption>
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} scope="col" className="border border-ink-200 bg-white p-3 text-left font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, n) =>
                    n === 0 && b.head.length > 2 ? (
                      <th key={n} scope="row" className="border border-ink-200 p-3 text-left font-normal text-ink-800">
                        <CellView cell={cell} />
                      </th>
                    ) : (
                      <td key={n} className="border border-ink-200 p-3 text-ink-800">
                        <CellView cell={cell} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "pair":
      return (
        <div className="my-6 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
          {[b.left, b.right].map((s) => (
            <Pic key={s.alt} photo={s.photo} alt={s.alt} sizes="(max-width: 1024px) 50vw, 400px" className="aspect-4/3 h-full w-full object-cover" />
          ))}
        </div>
      );
    case "slider":
      return <CompareSlider left={b.left} right={b.right} />;
  }
}

function writtenStory(a, car) {
  const out = a.body.map((s) => ({ h: s.h || undefined, blocks: s.p.map((text) => ({ t: "p", text })) }));
  if (a.car) {
    const v = variantsOf(car);
    out.push({
      h: `${car.full} at a glance`,
      blocks: [
        {
          t: "table",
          caption: `${car.full} key facts`,
          head: ["Detail", car.name],
          rows: [
            ["Ex-showroom price", priceRange(car)],
            ["Variants", v.length ? `${v.length} (${v[0].name} to ${v[v.length - 1].name})` : "To be announced"],
            ["Fuel", car.fuels.join(", ")],
            [car.fuels.includes("Electric") && car.fuels.length === 1 ? "Battery" : "Engine", car.engine || "To be announced"],
            ["Power", car.power || "To be announced"],
            ...(hasMileage(car) ? [[car.fuels.includes("Electric") && car.fuels.length === 1 ? "Claimed range" : "Claimed mileage", car.mileage]] : []),
            ["Seats", String(car.seats)],
          ],
        },
      ],
    });
  }
  return out;
}

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

export function NewsDetail({ a }) {
  const car = a.car ?? CARS_BY_KEY[a.photo];
  const rival = a.rival ?? nearestRival(car);
  const sections = a.body.length ? writtenStory(a, car) : buildStory(a, car, rival);
  const minutes = Math.max(5, Math.round(storyWords(sections) / 200));
  const url = articleUrl(a);
  const views = `${((a.title.length * 37) % 900) + 120} views`;
  const news = articlesOf("news").filter((n) => n.slug !== a.slug);
  const newsItem = (n) => ({ href: articleUrl(n), title: n.title, photo: articlePhoto(n) });
  const related = news.filter((n) => n.car && (n.car.body === car.body || n.car.brand === car.brand)).slice(0, 5);
  const carItem = (c) => ({ href: carUrl(c), title: c.full, photo: carPhoto(c), meta: priceRange(c), badge: c.status === "new-launch" ? "New" : undefined });
  const trendSame = CARS.filter((c) => c.body === car.body);
  const similar = byPopularity(onSale().filter((c) => c.body === car.body && c.slug !== car.slug && c.slug !== rival.slug)).slice(0, 6);
  const bothCompare = !!a.rival;

  const hero = (
    <div className="relative -mx-4 overflow-hidden bg-ink-900 sm:mx-0 sm:rounded-2xl">
      {a.image?.credit && <span className="absolute right-2 top-2 z-10 rounded bg-ink-950/60 px-2 py-0.5 text-[10px] font-semibold text-white">Photo: {a.image.credit}</span>}
      {bothCompare && !(a.cover ?? a.image) ? (
        <div className="relative aspect-video">
          <Pic photo={carPhoto(rival)} alt={`${rival.full} front view`} sizes="(max-width: 1024px) 100vw, 820px" priority className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 54% 0, 46% 100%, 0 100%)" }}>
            <Pic photo={carPhoto(car)} alt={`${car.full} front view`} sizes="(max-width: 1024px) 100vw, 820px" priority className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rotate-[4.6deg] scale-y-110 bg-white/90" />
        </div>
      ) : (
        <Pic
          photo={articleHero(a)}
          alt={(a.cover ?? a.image)?.alt || `${car.full}, the car covered in this story`}
          sizes="(max-width: 1024px) 100vw, 820px"
          priority
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/85 via-ink-950/40 to-transparent p-4 pt-14 sm:p-6 sm:pt-20">
        <p className="border-l-4 border-lime-400 pl-3 font-display text-lg font-extrabold leading-tight text-white sm:text-3xl">
          <span className="block capitalize">{bothCompare ? "Compared" : a.category}</span>
          {bothCompare ? (
            <>
              {car.full} <span className="mx-1 inline-grid size-7 place-items-center rounded-full bg-lime-400 align-middle text-xs text-ink-950 sm:size-9">VS</span> {rival.full}
            </>
          ) : (
            car.full
          )}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: a.title,
          description: a.excerpt,
          author: { "@type": "Person", name: a.author },
          publisher: { "@type": "Organization", name: SITE.name },
          datePublished: new Date(`${a.date} UTC`).toISOString(),
          image: articleHero(a).src.startsWith("http") ? articleHero(a).src : `${SITE.url}${articleHero(a).src}`,
          mainEntityOfPage: `${SITE.url}${url}`,
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6 lg:py-8">
        <div className="min-w-0 space-y-5">
          <article className="rounded-2xl border-ink-100 bg-white sm:border sm:shadow-card">
            <div className="grid px-4 py-4 sm:px-6 lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-2 lg:py-6 lg:pl-3 lg:pr-8">
              <aside className="sticky top-24 hidden self-start lg:block">
                <ShareRail title={a.title} />
              </aside>
              <div className="min-w-0">
                <div className="flex flex-col">
                  <div className="order-2 lg:order-1">
                    <div className="mt-3 lg:mt-0">
                      <Breadcrumbs items={[{ label: "Car news", href: "/news" }, { label: a.title.length > 44 ? `${a.title.slice(0, 42).trim()}...` : a.title }]} />
                    </div>
                    <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-[34px]">{a.title}</h1>
                    <p className="mt-3 border-l-4 border-lime-500 pl-4 text-lg leading-relaxed text-ink-500">{a.excerpt}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span aria-hidden className="grid size-11 place-items-center rounded-full bg-ink-950 text-sm font-bold text-lime-400">
                          {initials(a.author)}
                        </span>
                        <p className="text-sm">
                          <span className="block font-semibold">{a.author}</span>
                          <span className="text-ink-500">Published on {a.date}</span>
                        </p>
                      </div>
                      <p className="flex items-center gap-3 text-xs text-ink-500">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {minutes} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3.5" />
                          {views}
                        </span>
                      </p>
                    </div>
                    <a href="#comment" className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
                      <Pencil className="size-3.5" />
                      Write a comment on this story
                    </a>
                  </div>
                  <div className="order-1 mt-0 lg:order-2 lg:mt-4">{hero}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href={`${carUrl(car)}/images`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-ink-900 py-3 text-sm font-semibold transition hover:bg-ink-950 hover:text-white"
                  >
                    <Camera className="size-4" />
                    {car.name} gallery
                  </Link>
                  <Link
                    href={`${carUrl(car)}/colours`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-ink-900 py-3 text-sm font-semibold transition hover:bg-ink-950 hover:text-white"
                  >
                    <Palette className="size-4" />
                    {car.name} colours
                  </Link>
                </div>

                {a.html ? (
                  <div className="prose-site rich mt-6" dangerouslySetInnerHTML={{ __html: a.html }} />
                ) : (
                  sections.map((s, i) => (
                    <section key={s.h ?? i} className="mt-6">
                      {s.h && <h2 className="text-2xl font-extrabold">{s.h}</h2>}
                      {s.blocks.map((b, n) => (
                        <BlockView key={n} b={b} />
                      ))}
                    </section>
                  ))
                )}

                <FaqBlock title="Frequently asked questions" items={a.faqs} />
                <SourceLine source={a.source} />
                <Helpful />
                <div className="mt-5 lg:hidden">
                  <ShareRail title={a.title} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 border-t border-ink-100 px-4 py-5 sm:px-6 lg:px-8">
              <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-full bg-ink-950 text-xl font-bold text-lime-400">
                {initials(a.author)}
              </span>
              <div>
                <p className="font-display text-lg font-bold">
                  {a.author}
                  {a.authorRole && <span className="ml-2 text-sm font-semibold text-ink-500">{a.authorRole}</span>}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{a.authorBio || `${a.author} writes about cars for Wheelora.`}</p>
              </div>
            </div>
          </article>

          <CommentBox carName={car.name} />

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-extrabold">Explore similar cars</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {[car, rival].map((c) => (
                <li key={carUrl(c)}>
                  <CarCard car={cardOf(c)} />
                </li>
              ))}
            </ul>
          </section>

          {similar.length > 0 && (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-xl font-extrabold">Similar cars to compare and consider</h2>
              <div className="mt-2">
                <Carousel label="Similar cars" item="w-[78%] sm:w-[44%] xl:w-[31%]">
                  {similar.map((c) => (
                    <CarCard key={carUrl(c)} car={cardOf(c)} />
                  ))}
                </Carousel>
              </div>
            </section>
          )}
        </div>

        <aside aria-label="More stories and cars" className="min-w-0 space-y-5">
          <SideTabs
            title="Car News"
            tabs={[
              { label: "Trending News", items: news.slice(0, 5).map(newsItem) },
              { label: "Recent News", items: [...news].reverse().slice(0, 5).map(newsItem) },
            ]}
            footer={{ label: "View all car news", href: "/news" }}
          />
          {related.length > 0 && <SideTabs title="Related News" tabs={[{ label: "Related", items: related.map(newsItem) }]} />}
          <SideTabs
            title={`Trending ${car.body} Cars`}
            tabs={[
              {
                label: "Latest",
                items: byPopularity(trendSame.filter((c) => c.status === "new-launch"))
                  .concat(byPopularity(trendSame.filter((c) => c.status === "on-sale")))
                  .slice(0, 5)
                  .map(carItem),
              },
              {
                label: "Upcoming",
                items: (trendSame.filter((c) => c.status === "upcoming").length ? trendSame.filter((c) => c.status === "upcoming") : CARS.filter((c) => c.status === "upcoming"))
                  .slice(0, 5)
                  .map(carItem),
              },
              { label: "Popular", items: byPopularity(trendSame).slice(0, 5).map(carItem) },
            ]}
            footer={{ label: `View all ${car.body === "SUV" || car.body === "MUV" ? car.body : car.body.toLowerCase()} cars`, href: `/new-cars/${car.body.toLowerCase()}` }}
          />
          <BrandGrid />
        </aside>
      </div>
      <MobileOfferBar title={`Best price for the ${car.full}`} label={`Get ${car.name} best price`} />
    </>
  );
}
