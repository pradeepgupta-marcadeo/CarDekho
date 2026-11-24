import { ReviewForm } from "@/components/tools";
import { Guide, PageHead, Section } from "@/components/ui";
import { byPopularity, onSale } from "@/data/cars";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Write a car review and help other buyers",
    description: "Share your experience of owning a car. Rate it, tell others what you like and dislike, and help the next buyer decide. Here is how to write a review that truly helps.",
    path: "/write-review",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead
        crumbs={[{ label: "Owner reviews", href: "/user-reviews" }, { label: "Write a review" }]}
        title="Tell the next buyer the truth"
        intro="It takes about three minutes. Honest details help more than perfect writing does."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <ReviewForm cars={byPopularity(onSale()).map((c) => c.full)} />
        </div>
      </Section>
      <Guide
        white
        title="What makes a review really useful"
        paras={[
          "Begin with context. Mention how long you have owned the car, how many kilometres you have driven and what kind of roads you usually use. A sentence like this helps readers decide how closely your experience matches theirs, and it gives far more weight to everything else that you go on to say in your review.",
          "Be specific about the good and the bad. Rather than saying the mileage is great, share the actual figure you see in the city and on the highway. Rather than calling the seats comfortable, mention how you feel after a three-hour drive. Small and concrete details are what people remember, and what they can test for themselves.",
          "Include your service experience if you have one, as this is something few expert reviews can cover. Was the workshop organised? Were the costs close to the estimate? Did the problem get fixed the first time? Readers often value this information the most, especially those buying a brand that is new to them or their family.",
          "Please keep your review fair and respectful, and leave out personal information like phone numbers and registration numbers. Reviews in the live product would be moderated before publication. This form is not connected yet, so nothing that you write here is saved.",
        ]}
      />
    </>
  );
}
