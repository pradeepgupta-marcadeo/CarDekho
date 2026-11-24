import Link from "next/link";
import { notFound } from "next/navigation";
import { Pic } from "@/components/cards";
import { NewsDetail } from "@/components/news-detail";
import { ArticleCard, Breadcrumbs, Container, FaqBlock, Guide, JsonLd, LinkPills, PageHead, Section, SourceLine } from "@/components/ui";
import { carUrl } from "@/data/cars";
import { ARTICLES, CARS_BY_KEY, articleHero, articleUrl, articlesOf, getArticle } from "@/data/content";
import { SITE } from "@/data/site";
import { pageMeta } from "@/lib/seo";

const CRUMB = { news: { label: "Car news", href: "/news" }, review: { label: "Expert reviews", href: "/expert-reviews" }, advice: { label: "Tips and advice", href: "/tips-advice" } };

export const articleMeta = (kind, slug) => {
  const a = getArticle(kind, slug);
  if (!a) return {};
  const lead = a.excerpt.length >= 120 ? a.excerpt : `${a.excerpt} Read our take on what it means for buyers and what to do next.`;
  let title = a.seoTitle
    ? a.seoTitle
    : a.rival && a.car
      ? `${a.car.name} vs ${a.rival.name}: which one to buy`
      : a.kind === "news"
        ? `${a.title.split(" ").slice(0, 6).join(" ")} news`
        : a.title.length > 58
          ? a.title.split(":")[0] + (a.kind === "review" ? " road test review" : "")
          : a.title;
  // The search title must differ from the page heading (H1): lead with the article's main keyword instead.
  const same = (x, y) => x.toLowerCase().replace(/[^a-z0-9]+/g, "") === y.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (same(title, a.title)) {
    const kw = a.keywords?.[0] ? a.keywords[0].replace(/\b\w/g, (c) => c.toUpperCase()) : CRUMB[a.kind]?.label ?? "Car news";
    title = `${kw}: ${a.title.split(":").slice(-1)[0].trim()}`;
    if (same(title, a.title) || title.length > 60) title = `${kw} | ${CRUMB[a.kind]?.label ?? "Car news"}`;
  }
  return pageMeta({
    title,
    description: a.seoDescription || lead,
    path: articleUrl(a),
    canonical: a.canonical,
    noindex: a.noindex,
    image: a.ogImage ?? articleHero(a).src,
  });
};

export function ArticleView({ kind, slug }) {
  const a = getArticle(kind, slug);
  if (!a) notFound();
  if (kind === "news") return <NewsDetail a={a} />;
  const car = CARS_BY_KEY[a.photo];
  const related = ARTICLES.filter((x) => x.kind === kind && x.slug !== slug).slice(0, 3);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          author: { "@type": "Person", name: a.author },
          publisher: { "@type": "Organization", name: SITE.name },
          datePublished: new Date(a.isoDate ?? `${a.date} UTC`).toISOString(),
          ...(a.updatedAt ? { dateModified: new Date(a.updatedAt).toISOString() } : {}),
          image: articleHero(a).src.startsWith("http") ? articleHero(a).src : `${SITE.url}${articleHero(a).src}`,
          mainEntityOfPage: `${SITE.url}${articleUrl(a)}`,
        }}
      />
      <article>
        <div className="bg-white">
          <Container className="py-6 lg:py-10">
            <div className="mx-auto max-w-3xl">
              <Breadcrumbs items={[CRUMB[kind], { label: a.title.length > 40 ? `${a.title.slice(0, 38).trim()}...` : a.title }]} />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-lime-700">{a.category}</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{a.title}</h1>
              <p className="mt-3 text-sm text-ink-500">
                By {a.author} · {a.date} · {a.minutes} min read
              </p>
            </div>
            <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-3xl">
              <Pic
                photo={articleHero(a)}
                alt={(a.cover ?? a.image)?.alt || (a.car ? `${a.car.full}, the car covered in this story` : `${car.full} pictured with this guide`)}
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
                className="aspect-video w-full object-cover"
              />
            </div>
            <div className="prose-site mx-auto mt-4 max-w-3xl">
              {a.html ? (
                <div className="rich" dangerouslySetInnerHTML={{ __html: a.html }} />
              ) : (
                a.body.map((s) => (
                  <section key={s.h}>
                    <h2>{s.h}</h2>
                    {s.p.filter(Boolean).map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                  </section>
                ))
              )}
              {!a.car && (
                <p>
                  Everyone&apos;s situation is different, so treat this guide as a starting point rather than a set of rules. Use the <Link href="/emi-calculator">EMI calculator</Link> to test your
                  budget, then <Link href="/compare-cars">compare cars side by side</Link> before you visit a showroom. Please confirm important details with a
                  qualified professional.
                </p>
              )}
              <FaqBlock title="Frequently asked questions" items={a.faqs} />
              <SourceLine source={a.source} />
              {a.car && (
                <p>
                  Want to dig deeper? See the <Link href={carUrl(a.car)}>{a.car.full} price and specifications</Link>, or check its{" "}
                  <Link href={`${carUrl(a.car)}/price`}>on-road price in your city</Link>.
                </p>
              )}
            </div>
          </Container>
        </div>
      </article>
      <Section>
        <h2 className="mb-4 text-2xl font-extrabold">Keep reading</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}>
              <ArticleCard a={r} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

export function ArticleHub({ kind, crumb, title, intro, guideTitle, guide }) {
  const list = articlesOf(kind);
  const [first, ...rest] = list;
  if (!first)
    return (
      <>
        <PageHead crumbs={[{ label: crumb }]} title={title} intro={intro} />
        <Guide white title={guideTitle} paras={guide} />
      </>
    );
  return (
    <>
      <PageHead crumbs={[{ label: crumb }]} title={title} intro={intro} />
      <Section>
        <h2 className="mb-4 text-xl font-bold">Latest stories</h2>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <ArticleCard a={first} large />
          <ul className="grid gap-5 sm:grid-cols-2">
            {rest.slice(0, 4).map((a) => (
              <li key={a.slug}>
                <ArticleCard a={a} />
              </li>
            ))}
          </ul>
        </div>
        {rest.length > 4 && (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rest.slice(4).map((a) => (
              <li key={a.slug}>
                <ArticleCard a={a} />
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Guide white title={guideTitle} paras={guide} />
      <Section>
        <LinkPills
          title="More to read"
          links={[
            { label: "Car news", href: "/news" },
            { label: "Expert reviews", href: "/expert-reviews" },
            { label: "Owner reviews", href: "/user-reviews" },
            { label: "Tips and advice", href: "/tips-advice" },
          ].filter((l) => l.href !== CRUMB[kind].href)}
        />
      </Section>
    </>
  );
}
