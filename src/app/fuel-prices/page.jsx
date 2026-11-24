import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { fuelPrices } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Petrol, diesel and CNG prices by city",
    description: "Check petrol, diesel and CNG prices across major Indian cities in one simple table. Learn why fuel prices differ by state and how to work out your monthly fuel bill.",
    path: "/fuel-prices",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "New cars", href: "/new-cars" }, { label: "Fuel prices" }]}
        title="Fuel prices across major cities"
        intro="Petrol, diesel and CNG rates for major cities, updated every morning."
      />
      <Section>
        {fuelPrices[0]?.date && <p className="mb-3 text-sm text-ink-500">Prices as of {fuelPrices[0].date}</p>}
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-130 text-sm">
            <caption className="sr-only">Fuel prices by city in rupees</caption>
            <thead>
              <tr className="bg-ink-950 text-left text-white">
                <th scope="col" className="p-4">
                  City
                </th>
                <th scope="col" className="p-4 text-right">
                  Petrol (₹/L)
                </th>
                <th scope="col" className="p-4 text-right">
                  Diesel (₹/L)
                </th>
                <th scope="col" className="p-4 text-right">
                  CNG (₹/kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {fuelPrices.map((f) => (
                <tr key={f.slug} className="border-t border-ink-100">
                  <th scope="row" className="p-4 text-left font-semibold">
                    {f.city}
                    <span className="block text-xs font-normal text-ink-500">{f.state}</span>
                  </th>
                  <td className="p-4 text-right">{f.petrol.toFixed(2)}</td>
                  <td className="p-4 text-right">{f.diesel.toFixed(2)}</td>
                  <td className="p-4 text-right">{f.cng.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Guide
        white
        title="Why fuel costs differ between cities"
        paras={[
          "Fuel prices in India depend on the base price, central excise duty, state taxes and the dealer's commission. Because each state sets its own tax, the same litre of petrol can cost noticeably more on one side of a state border than on the other, which is why highway drivers often plan their refuelling stops with care.",
          "To estimate your monthly fuel bill, divide your typical monthly distance by your car's real-world mileage, and then multiply the result by the local price. For example, driving 1,000 kilometres at 15 kilometres per litre uses about 67 litres. That quick calculation is worth doing before you buy, as it may affect which fuel type you should choose.",
          "The savings from CNG or electric power grow with distance. If you only cover a few hundred kilometres a month, the higher purchase price may take many years to recover, but heavy users can recover it much sooner. Comparing a few realistic scenarios on paper makes this decision far clearer than general advice on the internet.",
          "Rates are updated every morning, and the date above the table shows the day they apply to, so you always know how fresh each number is. Prices at individual pumps can differ slightly, so treat these figures as a guide when you plan your budget.",
        ]}
      />
      <Section>
        <LinkPills
          title="Plan your running costs"
          links={[
            { label: "EMI calculator", href: "/emi-calculator" },
            { label: "Petrol, CNG or electric guide", href: "/tips-advice/petrol-cng-or-electric" },
            { label: "Electric cars", href: "/electric-cars" },
          ]}
        />
      </Section>
    </>
  );
}
