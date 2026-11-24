import { EmiCalculator } from "@/components/tools";
import { Faq, Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Car loan EMI calculator: plan your payment",
    description: "Use this car loan EMI calculator to adjust price, down payment, interest rate and tenure. See your monthly instalment, total interest and overall cost right away.",
    path: "/emi-calculator",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "Finance", href: "/car-loan" }, { label: "EMI calculator" }]}
        title="Find a monthly payment you can live with"
        intro="Move the sliders and watch the instalment, total interest and overall cost change in real time."
      />
      <Section>
        <EmiCalculator />
      </Section>
      <Guide
        white
        title="How your car EMI is worked out"
        paras={[
          "An EMI depends on three things: the amount you borrow, the interest rate and the number of months you take to repay. Each instalment covers part interest and part principal. Early payments are mostly interest, and the balance shifts towards principal over time, which is why closing a loan early saves the most money in its first half.",
          "A bigger down payment is the most powerful lever you have, as it reduces both the EMI and the total interest. Many buyers aim for around twenty percent of the on-road price. Paying more upfront also reduces the chance of owing more on the loan than the car is worth during those early years when depreciation is steepest.",
          "Longer tenures reduce the monthly payment, but they increase the overall cost. Try the calculator with five years and then seven years to see how much extra interest you would pay for that lower instalment. A useful target is to keep all your loan payments well below a comfortable share of your monthly take-home income.",
          "Do not forget the costs that come on top: fuel, insurance renewal, servicing, parking and tyres. The figures from this calculator are illustrative estimates and are not a loan offer. Actual interest rates and eligibility depend on the lender, the car and your credit profile.",
        ]}
      />
      <Section>
        <h2 className="mb-4 text-2xl font-extrabold">EMI questions</h2>
        <Faq
          items={[
            {
              q: "Does a lower EMI always mean a better loan?",
              a: "No. A lower EMI usually means a longer tenure, which increases the total interest you pay. Compare the total payable amount as well as the monthly figure.",
            },
            {
              q: "Can I repay my car loan early?",
              a: "Most lenders allow this, but some charge a foreclosure fee. Check the terms before you sign, because the fee can affect whether early repayment is worthwhile.",
            },
          ]}
        />
        <div className="mt-6">
          <LinkPills
            title="Related"
            links={[
              { label: "Car loan guide", href: "/car-loan" },
              { label: "Car insurance guide", href: "/car-insurance" },
              { label: "Cars under 10 lakh", href: "/new-cars/under-10-lakh" },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
