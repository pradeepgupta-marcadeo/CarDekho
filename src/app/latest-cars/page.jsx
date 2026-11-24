import { byPopularity, CARS } from "@/data/cars";
import { CarListPage, EXPLORE_LINKS } from "@/lib/list-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Latest car launches in India this year",
    description: "Discover the latest cars launched in India, with prices, key features and first impressions. See what is new, and how each one compares with established rivals.",
    path: "/latest-cars",
  });
}

export default async function Page() {
  await ready();
  const cars = byPopularity(CARS.filter((c) => c.status === "new-launch"));
  const rest = byPopularity(CARS.filter((c) => c.status === "on-sale")).slice(0, 4);
  return (
    <CarListPage
      crumb="New launches"
      title="Fresh on the road: the newest cars"
      intro="Recently launched models and the most talked-about current cars, ready for a test drive."
      cars={[...cars, ...rest]}
      guideTitle="Buying a car soon after launch"
      links={EXPLORE_LINKS.filter((l) => l.href !== "/latest-cars")}
      guide={[
        "A newly launched car brings the latest design, equipment and safety features, along with the simple pleasure of owning something fresh. It also holds its value well during the early years, because it will not look dated on the road for quite some time, which matters a lot if you like to change cars often.",
        "On the other hand, introductory prices may not last, and discounts are rare during the first months. Early waiting periods can be long, and the first production batches sometimes need small software updates or minor fixes. Reading early owner feedback is helpful if you are not in a hurry, since real ownership reveals things a launch event cannot.",
        "Before booking, compare the new arrival with an established rival. Established cars usually have a wider service network, more certain resale values and sometimes better offers, while the newcomer may bring far more features for the same price. Line both up on our comparison tool to see exactly where the differences are.",
        "Lastly, confirm which features belong to which trim, since launch coverage often focuses on the fully loaded version. A lower variant may look quite different once the alloy wheels and big screens are removed. Launch details can change, so check them against the official brochure.",
      ]}
    />
  );
}
