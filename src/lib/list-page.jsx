import { CarCard } from "@/components/cards";
import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { carUrl } from "@/data/cars";
import { cardOf } from "@/lib/cards";

export function CarListPage({ crumb, title, intro, cars, guideTitle, guide, links }) {
  return (
    <>
      <PageHead crumbs={[{ label: "New cars", href: "/new-cars" }, { label: crumb }]} title={title} intro={intro} />
      <Section>
        <h2 className="mb-4 text-xl font-bold">{cars.length} cars in this list</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((c, i) => (
            <li key={carUrl(c)}>
              <CarCard car={cardOf(c)} priority={i < 2} />
            </li>
          ))}
        </ul>
      </Section>
      <Guide white title={guideTitle} paras={guide} />
      {links && (
        <Section>
          <LinkPills title="Keep exploring" links={links} />
        </Section>
      )}
    </>
  );
}

export const EXPLORE_LINKS = [
  { label: "All new cars", href: "/new-cars" },
  { label: "Popular cars", href: "/popular-cars" },
  { label: "Electric cars", href: "/electric-cars" },
  { label: "Upcoming cars", href: "/upcoming-cars" },
  { label: "New launches", href: "/latest-cars" },
  { label: "Compare cars", href: "/compare-cars" },
];
