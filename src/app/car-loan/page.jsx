import { SimpleForm } from "@/components/tools";
import { Guide, LinkPills, PageHead, Section } from "@/components/ui";
import { CITIES } from "@/data/site";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "New car loans: how to get a good deal",
    description: "Learn how new car loans work, what lenders look for and how to compare offers fairly. Register your interest and see what to prepare before you apply for one.",
    path: "/car-loan",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "Finance" }, { label: "Car loan" }]}
        title="Car finance, explained without jargon"
        intro="Understand what you can afford, and what to compare, before you speak to any lender."
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-xl font-bold">Tell us what you need</h2>
          <SimpleForm
            submitLabel="Register my interest"
            doneTitle="We have noted your interest"
            fields={[
              { label: "Preferred tenure", options: ["3 years", "5 years", "7 years"] },
              { label: "City", options: CITIES.map((c) => c.name) },
              { label: "Loan amount needed (₹)", type: "number" },
              { label: "Employment type", options: ["Salaried", "Self-employed", "Business owner"] },
            ]}
          />
          <p className="mt-3 text-xs text-ink-500">
            {"Wheelora is not a lender and does not offer loans. In the live product, any lender would be named clearly, and you would apply on the lender's own journey."}
          </p>
        </div>
      </Section>
      <Guide
        white
        title="What to know before applying for a car loan"
        paras={[
          "Lenders mainly look at your income, your existing loan commitments and your credit history. Checking your credit score before you apply gives you time to correct any errors, and it helps you understand the kind of rate you may be offered. Too many applications in a short period can also hurt your score, so choose carefully.",
          "When you compare offers, look past the headline interest rate. Processing fees, foreclosure charges and any insurance bundled with the loan can change the true cost considerably. Ask whether the rate is fixed or floating, and ask for a complete repayment schedule so you can see exactly how much you will pay in total.",
          "The loan is secured against the car, so the lender records its interest on the registration until you finish repaying. Ask how long it takes to remove that entry after the last instalment, and keep the closure letter safely. A clean record makes your insurance renewals simpler, and it avoids delays whenever you decide to change cars later on.",
          "Dealer finance is convenient, but it is not always the cheapest option. Get at least one quote directly from a bank and use it as a benchmark. Read every document carefully before you sign, and keep copies safely. This page provides general information only, and it is not financial advice or an offer of credit.",
        ]}
      />
      <Section>
        <LinkPills
          title="Helpful tools"
          links={[
            { label: "EMI calculator", href: "/emi-calculator" },
            { label: "Car insurance guide", href: "/car-insurance" },
          ]}
        />
      </Section>
    </>
  );
}
