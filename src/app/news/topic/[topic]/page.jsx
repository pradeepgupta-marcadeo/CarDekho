import { notFound } from "next/navigation";
import { ArticleCard, ArticleRow, Container, Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { TOPICS, newsByTopic, popularNews } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

export async function generateStaticParams() {
  await ready();
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { topic } = await params;
  const t = TOPICS[topic];
  if (!t) return {};
  return pageMeta({
    title: `${t.label} in India: latest stories`,
    description: `${t.intro} Browse ${newsByTopic(topic).length} stories on ${/^(EV|CNG)/.test(t.navLabel) ? t.navLabel : t.navLabel.toLowerCase()}, written to help you decide.`,
    path: `/news/topic/${topic}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { topic } = await params;
  const t = TOPICS[topic];
  if (!t) notFound();
  const name = /^(EV|CNG)/.test(t.navLabel) ? t.navLabel : t.navLabel.toLowerCase();
  const list = newsByTopic(topic);
  const [lead, ...rest] = list;
  const popular = popularNews()
    .filter((a) => !list.includes(a))
    .slice(0, 4);
  return (
    <>
      <PageHead crumbs={[{ label: "Car news", href: "/news" }, { label: t.label }]} title={t.h1} intro={t.intro} />
      <Section>
        <h2 className="mb-4 text-xl font-bold">{list.length} stories in this section</h2>
        {lead && (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <ArticleCard a={lead} large />
            <ul className="grid gap-5 sm:grid-cols-2">
              {rest.slice(0, 4).map((a) => (
                <li key={a.slug}>
                  <ArticleCard a={a} />
                </li>
              ))}
            </ul>
          </div>
        )}
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
      <section className="bg-white py-10 lg:py-14">
        <Container>
          <h2 className="mb-4 text-2xl font-extrabold">Popular across all car news</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {popular.map((a) => (
              <li key={a.slug}>
                <ArticleRow a={a} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <Guide
        title={`How to read ${name}`}
        paras={[
          t.guide,
          "Whatever the headline says, the most useful next step is the same: open the car's page, check the on-road price for your own city and compare it with one or two rivals. A short test drive will tell you more than any article can, particularly about comfort and visibility. Some stories here are sample articles written to show the format, so please confirm all details with an authorised dealer.",
        ]}
      />
      <section className="bg-white py-9">
        <Container>
          <LinkPills
            title="Other news topics"
            links={Object.entries(TOPICS)
              .filter(([k]) => k !== topic)
              .map(([k, x]) => ({ label: x.label, href: `/news/topic/${k}` }))}
          />
        </Container>
      </section>
    </>
  );
}
