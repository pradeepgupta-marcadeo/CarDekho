import { byPopularity, onSale } from "@/data/cars";
import { CarListPage, EXPLORE_LINKS } from "@/lib/list-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Most popular cars in India right now",
    description: "See the most popular cars in India this month, ranked by shopper interest. Check prices, mileage, ratings and variants, and quickly build a sensible shortlist.",
    path: "/popular-cars",
  });
}

export default async function Page() {
  await ready();
  const cars = byPopularity(onSale()).slice(0, 16);
  return (
    <CarListPage
      crumb="Popular cars"
      title="The cars everyone is shortlisting"
      intro="A simple starting point: the models attracting the most attention from shoppers right now."
      cars={cars}
      guideTitle="What popularity can and cannot tell you"
      links={EXPLORE_LINKS.filter((l) => l.href !== "/popular-cars")}
      guide={[
        `Popular cars earn their place for practical reasons. The ${cars[0].full} and ${cars[1].full} are near the top of this list because they meet the needs of many families at a sensible price, and strong demand tends to bring wide service coverage, easy availability of parts and healthy resale value later on.`,
        "Still, being popular does not make a car right for you. High demand can also mean longer waiting periods and smaller discounts, and a car that suits a family of five may be far too large for one person commuting through tight city lanes. Treat this list as a starting point, then filter it down according to your own priorities.",
        "A sensible approach is to take two popular models and one less obvious alternative to your test drives. The lesser-known option often comes with better equipment for the money or a shorter waiting list, and it gives you helpful bargaining context when you sit down with a dealer to discuss the final price.",
        "This ranking uses our own popularity score, not official sales data. In the live product it would draw on real shopper activity, and we would explain the method clearly. Until then, use it to explore how the page works, and confirm details with an authorised dealer.",
      ]}
    />
  );
}
