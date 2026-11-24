import { byPopularity, CARS } from "@/data/cars";
import { CarListPage, EXPLORE_LINKS } from "@/lib/list-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Electric cars in India: price and range",
    description: "Compare electric cars in India by price, claimed range and battery size. Learn about charging at home, running costs and what to check before you switch to an EV.",
    path: "/electric-cars",
  });
}

export default async function Page() {
  await ready();
  const cars = byPopularity(CARS.filter((c) => c.fuels.includes("Electric")));
  return (
    <CarListPage
      crumb="Electric cars"
      title="Electric cars, explained simply"
      intro="Claimed range, battery size and price for every EV in our catalogue, with straight advice on charging."
      cars={cars}
      guideTitle="Is an electric car right for you?"
      links={EXPLORE_LINKS.filter((l) => l.href !== "/electric-cars")}
      guide={[
        "The strongest case for an electric car is simple: if you can charge at home and you drive a reasonable distance each month, the cost per kilometre is far lower than petrol. There is also no clutch, gearbox or engine oil to think about, and the quiet, instant response makes city traffic much less tiring than it is in most other cars.",
        "Charging is the part to plan carefully. A home charger that tops up overnight covers most daily needs, so you rarely think about public stations at all. If you have no dedicated parking spot, check the chargers along your regular routes first, and read recent user comments, because uptime and speed vary quite widely between locations.",
        "Claimed range is measured under test conditions, so expect a lower figure in practice, especially at highway speeds or with the air conditioning running hard. A practical approach is to take your longest regular trip and make sure that the car can comfortably complete it with a margin to spare, without relying on a fast charger halfway.",
        "Finally, look at the battery warranty, the resale outlook and the insurance premium along with the price. Electric cars cost more up front, so work out how many years it takes for your running-cost savings to balance that out. Figures are updated regularly but can change, so please confirm them with an authorised dealer.",
      ]}
    />
  );
}
