import { articlesOf } from "@/data/content";
import { ArticleView, articleMeta } from "@/lib/article-page";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  const list = articlesOf("review").map((a) => ({ slug: a.slug }));
  // The build needs at least one path; with no reviews yet, this one simply renders the 404 page.
  return list.length ? list : [{ slug: "no-reviews-yet" }];
}
export async function generateMetadata({ params }) {
  await ready();
  return articleMeta("review", (await params).slug);
}
export default async function Page({ params }) {
  await ready();
  return <ArticleView kind="review" slug={(await params).slug} />;
}
