import Image from "next/image";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/cards";
import { ArticleCard, Container, Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { BRANDS, brandLogo, byPopularity, carUrl, getBrand, priceRange } from "@/data/cars";
import { newsByBrand } from "@/data/content";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

// URL params are read before any Suspense boundary, so pages here render per URL (full HTML, good for SEO)
// rather than streaming into a shared shell; this lets them re-render after a CMS refresh.
export const instant = false;

const withNews = () => BRANDS.filter((b) => newsByBrand(b.slug).length > 0);

export async function generateStaticParams() {
  await ready();
  return withNews().map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }) {
  await ready();
  const { brand } = await params;
  const b = getBrand(brand);
  if (!b) return {};
  const top = byPopularity(b.cars)[0];
  return pageMeta({
    title: `${b.name} news: launches and updates`,
    description: `Read the latest ${b.name} news, including launches, price changes and comparisons for cars such as the ${top.name}, explained simply to help you decide what to buy next.`,
    path: `/news/brand/${b.slug}`,
  });
}

export default async function Page({ params }) {
  await ready();
  const { brand } = await params;
  const b = getBrand(brand);
  const list = newsByBrand(brand);
  if (!b || !list.length) notFound();
  const logo = brandLogo(b.slug);
  const cars = byPopularity(b.cars);
  const [top] = cars;
  return (
    <>
      <PageHead
        crumbs={[{ label: "Car news", href: "/news" }, { label: `${b.name} news` }]}
        title={`Latest stories from ${b.name}`}
        intro={`Launches, price updates and comparisons involving ${b.name} cars, with a plain explanation of what each one means for buyers.`}
      >
        {logo && <Image src={logo.src} alt={`${b.name} logo`} width={logo.w} height={logo.h} unoptimized className="mt-4 h-12 w-auto max-w-40 object-contain" />}
      </PageHead>
      <Section>
        <h2 className="mb-4 text-xl font-bold">
          {list.length} {b.name} {list.length === 1 ? "story" : "stories"}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((a) => (
            <li key={a.slug}>
              <ArticleCard a={a} />
            </li>
          ))}
        </ul>
      </Section>
      <section className="bg-white py-10 lg:py-14">
        <Container>
          <h2 className="mb-4 text-2xl font-extrabold">{b.name} cars in this catalogue</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cars.slice(0, 4).map((c) => (
              <li key={carUrl(c)}>
                <CarCard car={cardOf(c)} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <Guide
        title={`Following ${b.name} before you buy`}
        paras={[
          `Keeping an eye on ${b.name} news is useful if a car from this brand is on your shortlist. The ${top.full}, listed at ${priceRange(top)}, is ${top.angle}, so any change to it or to its closest rivals could affect whether now is a good time to book, and how much bargaining room you may have with a dealer.`,
          `It also helps to look beyond launches. Price revisions, new trims and changes to standard equipment often matter more to a buyer than a new model does. When you read about an update, check whether it applies to the exact variant you want, and ask your nearest ${b.name} dealer how it affects stock and delivery in your city.`,
          `A brand's service network matters as much as its headlines. Before you commit, find out how far your nearest authorised ${b.name} workshop is, what a routine service usually costs and how quickly common parts arrive in your area, because these details shape your ownership experience for years.`,
          `Remember that some stories here are sample articles written to show the format. They are not actual reports about ${b.name} or its products, so please confirm any details with an authorised dealer before you make a decision.`,
        ]}
      />
      <section className="bg-white py-9">
        <Container>
          <LinkPills
            title="News from other brands"
            links={withNews()
              .filter((x) => x.slug !== b.slug)
              .map((x) => ({ label: `${x.name} news`, href: `/news/brand/${x.slug}` }))}
          />
        </Container>
      </section>
    </>
  );
}
