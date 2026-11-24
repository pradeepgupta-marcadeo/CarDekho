import Link from "next/link";
import { notFound } from "next/navigation";
import { Pic } from "@/components/cards";
import { Reveal } from "@/components/motion";
import { LinkPills, PageHead, Section } from "@/components/ui";
import { carPhoto, carUrl, priceRange } from "@/data/cars";
import { STORIES } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

const valid = () => STORIES.filter((s) => s.cars[0]);

export async function generateStaticParams() {
  await ready();
  return valid().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { slug } = await params;
  const s = valid().find((x) => x.slug === slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.title}: a quick visual guide`,
    description: `${s.intro}. See ${s.cars
      .map((c) => c.name)
      .slice(0, 3)
      .join(", ")} and more, with prices and the most useful fact about each car in this quick visual guide.`,
    path: `/visual-stories/${s.slug}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { slug } = await params;
  const s = valid().find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <>
      <PageHead crumbs={[{ label: "Visual stories", href: "/visual-stories" }, { label: s.title }]} title={s.title} intro={s.intro} />
      <Section>
        <ol className="mx-auto grid max-w-3xl gap-6">
          {s.cars.map((c, i) => (
            <li key={carUrl(c)}>
              <Reveal>
                <article className="relative overflow-hidden rounded-3xl bg-ink-950 text-white">
                  <Pic photo={carPhoto(c)} alt={`${c.full} in this visual story`} sizes="(max-width: 768px) 100vw, 768px" priority={i === 0} className="aspect-16/10 w-full object-cover" />
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-lime-400">
                      Number {i + 1} of {s.cars.length}
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold">
                      <Link href={carUrl(c)} className="hover:underline">
                        {c.full}
                      </Link>
                    </h2>
                    <p className="mt-2 leading-relaxed text-ink-200">
                      This one is {c.angle}. {c.pros[0]}, and {c.pros[1].charAt(0).toLowerCase() + c.pros[1].slice(1)}. On the other hand, {c.cons[0].charAt(0).toLowerCase() + c.cons[0].slice(1)}, so
                      make sure you check that during a test drive. With seating for {c.seats}
                      {/\d/.test(c.mileage ?? "") && <> and a claimed {c.mileage}</>}, it asks {priceRange(c)}.
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>
      <Section className="bg-white">
        <h2 className="text-2xl font-extrabold">Turning a quick look into a real shortlist</h2>
        <div className="prose-site max-w-3xl">
          <p>
            A visual story is only the first step, so pick the one or two cars that stood out and open their full pages. There you can see the on-road price in your city, read the honest pros and cons
            and compare them with close rivals. Details in this story are updated regularly but can change, so please confirm them with an authorised dealer before you decide.
          </p>
        </div>
        <div className="mt-6">
          <LinkPills
            title="More visual stories"
            links={valid()
              .filter((x) => x.slug !== slug)
              .map((x) => ({ label: x.title, href: `/visual-stories/${x.slug}` }))}
          />
        </div>
      </Section>
    </>
  );
}
