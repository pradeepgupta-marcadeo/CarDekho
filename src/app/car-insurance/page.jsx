import { Faq, Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Car insurance explained: cover and add-ons",
    description: "Understand third-party and comprehensive car insurance, useful add-ons, IDV and no-claim bonus. Learn how to compare policies and avoid paying for cover you do not need.",
    path: "/car-insurance",
  });
}

export default async function Page() {
  await ready();
  const plans = [
    { t: "Third-party", d: "The legal minimum. It covers damage you cause to other people or their property, but not to your own car.", best: "Older, low-value cars" },
    { t: "Comprehensive", d: "Third-party cover plus damage to your own car from accidents, theft, fire and natural events.", best: "Most car owners" },
    { t: "Comprehensive with add-ons", d: "Adds options such as zero depreciation, engine protection and roadside assistance.", best: "New cars and heavy users" },
  ];
  return (
    <>
      <PageHead
        crumbs={[{ label: "Finance" }, { label: "Car insurance" }]}
        title="Understand your car cover in five minutes"
        intro="A clear guide to what insurance covers and how to compare it. Wheelora does not sell or quote policies."
      />
      <Section>
        <ul className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <li key={p.t} className="rounded-2xl bg-white p-5 shadow-card">
              <h2 className="text-lg font-bold">{p.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{p.d}</p>
              <p className="mt-3 inline-block rounded-full bg-lime-400 px-2.5 py-1 text-xs font-bold">Suits: {p.best}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Guide
        white
        title="How to compare car insurance fairly"
        paras={[
          "Insured Declared Value, or IDV, is the amount that the insurer would pay if your car were stolen or written off. A very low premium often hides a low IDV, which means a smaller payout when you need it the most. Always compare policies at a similar IDV, so that you are comparing like with like.",
          "Your no-claim bonus rewards each claim-free year with a discount on your own-damage premium, and it belongs to you rather than to the car. You can usually transfer it when you change cars or insurers. For this reason, it is often better not to claim for small scratches, as you could lose a much larger discount later on.",
          "Add-ons can be valuable, but choose them according to your own situation. Zero depreciation is well worth considering for a new car, and engine protection makes sense if your area floods often. Roadside assistance is handy if you travel frequently. Check for overlaps too, as your car's warranty or your credit card may already provide some of these.",
          "You are generally free to buy from any licensed insurer, including at the time of purchasing a new car, so get an outside quote before accepting the dealer's offer. Read the exclusions carefully. This page gives general information only, and insurance products should be bought from licensed insurers or intermediaries.",
        ]}
      />
      <Section>
        <h2 className="mb-4 text-2xl font-extrabold">Insurance questions</h2>
        <Faq
          items={[
            {
              q: "Is third-party insurance enough?",
              a: "It meets the legal minimum, but it will not pay for damage to your own car. Most owners of newer cars choose comprehensive cover for that reason.",
            },
            {
              q: "What happens if my policy lapses?",
              a: "Driving without valid third-party cover is against the law. You may also lose your no-claim bonus if the gap is long, so renew your policy on time.",
            },
          ]}
        />
        <div className="mt-6">
          <LinkPills
            title="Plan your total cost"
            links={[
              { label: "EMI calculator", href: "/emi-calculator" },
              { label: "Car loan guide", href: "/car-loan" },
              { label: "Maintenance tips", href: "/tips-advice/car-maintenance-tips-for-indian-roads" },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
