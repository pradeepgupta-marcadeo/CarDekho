import { SITE } from "@/data/site";
import { seoFor } from "@/data/store";

/** Keep titles inside the guardrail range of roughly 30 to 60 characters. */
export function fitTitle(title) {
  if (title.toLowerCase().includes(SITE.name.toLowerCase())) return title.length <= 60 ? title : title.slice(0, 57).replace(/\s+\S*$/, "") + "...";
  const withBrand = `${title} | ${SITE.name}`;
  if (withBrand.length <= 60) return withBrand;
  if (title.length <= 60) return title;
  return title.slice(0, 57).replace(/\s+\S*$/, "") + "...";
}

/** Keep descriptions inside the guardrail range of roughly 120 to 160 characters. */
export function fitDescription(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 158) return clean;
  // Never end mid-sentence: cut after the last full sentence, else after the last clause, else at a word.
  const head = clean.slice(0, 158);
  const sentence = head.lastIndexOf(". ");
  if (sentence >= 120) return head.slice(0, sentence + 1);
  const clause = head.lastIndexOf(", ");
  if (clause >= 120) return `${head.slice(0, clause)}.`;
  return `${clean.slice(0, 155).replace(/\s+\S*$/, "").replace(/[,;:.]$/, "")}…`;
}

export function pageMeta(opts) {
  // An editor's title or description from CMS "Pages & SEO" wins over the page's own text.
  const custom = seoFor(opts.path);
  const title = custom?.title ? custom.title : fitTitle(opts.title);
  const description = custom?.description ? custom.description : fitDescription(opts.description);
  const noindex = opts.noindex || custom?.noindex;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: opts.canonical || opts.path },
    robots: noindex ? { index: false, follow: true } : undefined,
    keywords: custom?.keywords?.length ? custom.keywords : undefined,
    openGraph: {
      title,
      description,
      url: opts.path,
      siteName: SITE.name,
      type: "website",
      locale: "en_IN",
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
