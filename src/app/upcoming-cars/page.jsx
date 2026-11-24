import { byPopularity, CARS } from "@/data/cars";
import { CarListPage, EXPLORE_LINKS } from "@/lib/list-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Upcoming cars in India: launch dates",
    description: "See upcoming cars in India with expected launch dates and estimated prices. Decide whether to wait for a new model, and set a launch alert for the ones you like.",
    path: "/upcoming-cars",
  });
}

export default async function Page() {
  await ready();
  const cars = byPopularity(CARS.filter((c) => c.status === "upcoming"));
  return (
    <CarListPage
      crumb="Upcoming cars"
      title="Cars arriving in the coming months"
      intro="Expected launch windows and estimated prices. Everything here is an estimate until the maker confirms it."
      cars={cars}
      guideTitle="Should you wait for a new model?"
      links={EXPLORE_LINKS.filter((l) => l.href !== "/upcoming-cars")}
      guide={[
        "Waiting makes sense when a launch is close and the new car would genuinely change your decision, for example when a major safety upgrade or a much better powertrain is expected soon. It makes less sense if your current car has become unreliable or expensive to run, or if the launch you are waiting for keeps being moved further out.",
        "Launch dates and prices in this section are expectations rather than promises. Manufacturers often adjust their plans, and first-batch waiting periods can stretch for months after the launch itself. Keep in mind that an early buyer may also encounter small first-year glitches that are usually ironed out within a few production batches.",
        "There is a useful flip side to every launch. When a new generation arrives, dealers often offer good discounts on the outgoing stock, so a car that is already proven can become a very smart purchase. If value matters most to you, ask about these deals, though remember that the older model may resell for a little less.",
        "Set a launch alert on any car you like, and we would let you know once prices are confirmed in the live product. The alert form is not connected yet, so it does not store your details. Expected dates and prices are estimates and can change before launch.",
      ]}
    />
  );
}
