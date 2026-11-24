import { articlesOf } from "@/data/content";
import { ArticleView, articleMeta } from "@/lib/article-page";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return articlesOf("advice").map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({ params }) {
  await ready();
  return articleMeta("advice", (await params).slug);
}
export default async function Page({ params }) {
  await ready();
  return <ArticleView kind="advice" slug={(await params).slug} />;
}
