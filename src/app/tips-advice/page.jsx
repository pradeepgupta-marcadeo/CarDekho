import { ArticleHub } from "@/lib/article-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Car buying tips and ownership advice",
    description: "Practical guides on choosing a first car, comparing fuel types and looking after your car on Indian roads, along with simple tips, all written in clear, simple language.",
    path: "/tips-advice",
  });
}

export default async function Page() {
  await ready();
  return (
    <ArticleHub
      kind="advice"
      crumb="Tips and advice"
      title="Plain advice for buying and owning"
      intro="Short, practical guides for first-time buyers and everyday owners."
      guideTitle="Small decisions that save big money"
      guide={[
        "Most costly car mistakes happen before the purchase, not after. Buying a car that is too big for your parking space, choosing a fuel type that does not suit your monthly distance or stretching a loan to its limit can all create years of low-level regret. A little planning at the start protects you from all of these.",
        "After the purchase, simple habits make the biggest difference. Correct tyre pressure improves mileage and safety, servicing on time prevents small issues from growing, and keeping every invoice in one folder raises the resale value. None of this takes long, and it will quietly save you far more than almost any discount you could negotiate.",
        "When something does go wrong, a calm and documented approach works best. Note what happened, keep your receipts and put your complaint in writing to the dealer before you escalate it. For insurance claims, photographs and quick notification tend to make things simpler, so keep the claim number and the helpline saved on your phone.",
        "These guides are general information rather than professional advice, and local rules and costs can differ. Always check important details with an authorised dealer, a qualified mechanic or the relevant authority before you act on them.",
      ]}
    />
  );
}
