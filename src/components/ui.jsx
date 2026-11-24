import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { carPhoto, sitePhoto } from "@/data/cars";
import { articlePhoto, articleUrl, CARS_BY_KEY } from "@/data/content";
import { SITE } from "@/data/site";
import { Reveal } from "./motion";

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Container({ children, className = "" }) {
  return <div className={`mx-auto max-w-7xl px-4 lg:px-6 ${className}`}>{children}</div>;
}

export function Breadcrumbs({ items }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-ink-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="hover:text-ink-900 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-ink-700">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${SITE.url}${c.href === "/" ? "" : c.href}` } : {}) })),
        }}
      />
    </>
  );
}

export function PageHead({ crumbs, title, intro, children }) {
  return (
    <div className="border-b border-ink-200 bg-white">
      <Container className="py-6 lg:py-9">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-500 sm:text-base">{intro}</p>}
        {children}
      </Container>
    </div>
  );
}

export function SectionHead({ title, sub, href, linkLabel, dark }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {sub && <p className={`mt-1 max-w-2xl text-sm ${dark ? "text-ink-300" : "text-ink-500"}`}>{sub}</p>}
      </div>
      {href && (
        <Link href={href} className={`inline-flex items-center gap-1.5 text-sm font-bold hover:underline ${dark ? "text-lime-400" : ""}`}>
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function Section({ children, className = "" }) {
  return (
    <section className={`py-10 lg:py-14 ${className}`}>
      <Container>
        <Reveal>{children}</Reveal>
      </Container>
    </section>
  );
}

export function Faq({ items }) {
  return (
    <>
      <div className="divide-y divide-ink-200 rounded-2xl bg-white px-5 shadow-card">
        {items.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </>
  );
}

export function SitePic({ name, alt, sizes, className, priority }) {
  const p = sitePhoto(name) ?? carPhoto(CARS_BY_KEY[name]);
  return (
    <Image src={p.src} alt={alt} width={p.w} height={p.h} sizes={sizes} className={className} preload={priority} fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : undefined} quality={80} unoptimized={p.src.startsWith("http") && !p.src.includes("/uploads/")} />
  );
}

export function ArticleCard({ a, large }) {
  const photo = articlePhoto(a);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className={`relative shrink-0 overflow-hidden bg-ink-100 ${large ? "aspect-video lg:aspect-auto lg:min-h-64 lg:flex-1 lg:shrink" : "aspect-16/10"}`}>
        <Image
          src={photo.src}
          alt={a.image ? a.image.alt : a.car ? `${a.car.full} pictured with this story` : `Car pictured with ${a.title}`}
          width={photo.w}
          height={photo.h}
          sizes={large ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 90vw, 25vw"}
          quality={70}
          unoptimized={photo.src.startsWith("http") && !photo.src.includes("/uploads/")}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {a.breaking && <span className="absolute left-2.5 top-2.5 rounded-full bg-coral-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Breaking</span>}
      </div>
      <div className={`flex flex-col p-4 ${large ? "shrink-0" : "flex-1"}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-lime-700">{a.category}</p>
        <h3 className={`mt-1 font-bold leading-snug ${large ? "text-xl sm:text-2xl" : "line-clamp-3 min-h-[3lh] text-base"}`}>
          <Link href={articleUrl(a)} className="hover:underline after:absolute after:inset-0">
            {a.title}
          </Link>
        </h3>
        {large && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{a.excerpt}</p>}
        <p className="mt-auto pt-2 text-xs text-ink-500">
          {a.author} · {a.date} · {a.minutes} min
        </p>
      </div>
    </article>
  );
}

export function LinkPills({ title, links }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block rounded-full border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold transition hover:border-ink-900 hover:bg-lime-300">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Prose({ children }) {
  return <div className="prose-site max-w-3xl">{children}</div>;
}

export function Guide({ title, paras, white }) {
  return (
    <Section className={white ? "bg-white" : ""}>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <div className="prose-site max-w-3xl">
        {paras.map((p) => (
          <p key={p.slice(0, 50)}>{p}</p>
        ))}
      </div>
    </Section>
  );
}

export function ArticleRow({ a }) {
  const photo = articlePhoto(a);
  return (
    <article className="group relative flex h-full items-center gap-4 rounded-2xl bg-white p-3 shadow-card transition hover:shadow-lift">
      <span className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:w-32">
        <Image
          src={photo.src}
          alt={a.image?.alt || `Photo for ${a.title}`}
          width={photo.w}
          height={photo.h}
          sizes="128px"
          quality={70}
          unoptimized={photo.src.startsWith("http") && !photo.src.includes("/uploads/")}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-lime-700">{a.category}</p>
        <h3 className="line-clamp-2 min-h-[2lh] text-sm font-bold leading-snug">
          <Link href={articleUrl(a)} className="hover:underline after:absolute after:inset-0">
            {a.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-ink-500">
          {a.date} · {a.minutes} min
        </p>
      </div>
    </article>
  );
}

/** FAQs with their FAQPage schema, for articles and car pages written in the CMS. */
export function FaqBlock({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-2xl font-extrabold">{title}</h2>
      <Faq items={items} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </section>
  );
}

export function SourceLine({ source }) {
  if (!source) return null;
  return (
    <p className="mt-6 border-t border-ink-100 pt-4 text-sm text-ink-500">
      Source:{" "}
      <a href={source.url} rel="noopener nofollow" target="_blank" className="font-semibold underline">
        {source.name}
      </a>
      . Facts were checked and rewritten by our team.
    </p>
  );
}
