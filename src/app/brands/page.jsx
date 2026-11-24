import Link from "next/link";
import { Pic } from "@/components/cards";
import { Guide, PageHead, Section } from "@/components/ui";
import { BRANDS, byPopularity, carPhoto, lakh } from "@/data/cars";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "All car brands in India: models and prices",
    description: "Browse every car brand in India, from Maruti Suzuki and Tata to Hyundai and BMW. See how many models each maker offers, starting prices and their most popular cars.",
    path: "/brands",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "New cars", href: "/new-cars" }, { label: "Car brands" }]}
        title="Every car maker, one simple list"
        intro="Pick a brand to see its full range, starting prices and most popular models."
      />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BRANDS.map((b) => {
            const top = byPopularity(b.cars)[0];
            return (
              <li key={b.slug}>
                <Link href={`/brands/${b.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                  <span className="block aspect-16/10 overflow-hidden">
                    <Pic
                      photo={carPhoto(top)}
                      alt={`${top.full}, a popular ${b.name} car`}
                      sizes="(max-width: 640px) 90vw, 25vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="block p-4">
                    <span className="font-display block text-lg font-bold">{b.name} cars</span>
                    <span className="text-sm text-ink-500">
                      {b.cars.length} {b.cars.length === 1 ? "model" : "models"} from ₹{lakh(Math.min(...b.cars.map((c) => c.min)))}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
      <Guide
        white
        title="Does the brand really matter?"
        paras={[
          "Brand affects much more than the badge on the bonnet. It shapes how near your closest workshop is, how quickly spare parts arrive, how the car will hold its resale value and how comfortable the servicing experience feels. For many buyers outside big cities, service reach is the most important of these and deserves a real check.",
          "Mass-market makers tend to offer wide networks and affordable parts, while newer entrants often compete with more equipment for the money. Premium brands bring refined engineering and cabin quality, but also higher maintenance costs, so it is worth asking for a sample service bill before you commit to any of them, rather than discovering it later.",
          "Use each brand page to look at the whole line-up, since the right car might be a different model than the one you first considered. Then check the nearest showrooms and workshops in your city. A slightly less exciting car with a dependable workshop close to home can make for a far happier ownership experience.",
          "Brand names and logos on this site are used only to identify cars, and they belong to their respective owners. Models, prices and counts are updated regularly but can change, so please confirm details with an authorised dealer of the brand you choose.",
        ]}
      />
    </>
  );
}
