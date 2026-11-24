import Link from "next/link";
import { Guide, PageHead, Section } from "@/components/ui";
import { byPopularity, carUrl, onSale } from "@/data/cars";
import { ownerReviews } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Car owner reviews and ratings in India",
    description: "Read what owners say about their cars, from comfort and mileage to service experience. Learn how to spot patterns in reviews, and share your own experience with others.",
    path: "/user-reviews",
  });
}

export default async function Page() {
  await ready();
  const cars = byPopularity(onSale())
    .filter((c) => c.reviews > 0)
    .slice(0, 12);
  return (
    <>
      <PageHead crumbs={[{ label: "Owner reviews" }]} title="What owners really think" intro="Sample opinions from people living with these cars, covering daily comfort, costs and service.">
        <Link href="/write-review" className="mt-4 inline-block rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-ink-950 hover:bg-lime-300">
          Write a car review
        </Link>
      </PageHead>
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => {
            const r = ownerReviews(c)[0];
            return (
              <li key={c.slug}>
                <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-card">
                  <p className="text-lime-700" aria-label={`Rated ${r.rating} out of 5`}>
                    {"★".repeat(r.rating)}
                    <span className="text-ink-200">{"★".repeat(5 - r.rating)}</span>
                  </p>
                  <h2 className="mt-1 text-lg font-bold">{r.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-700">{r.text}</p>
                  <p className="mt-3 text-xs text-ink-500">
                    {r.author} · {r.date}
                  </p>
                  <Link href={`${carUrl(c)}/reviews`} className="mt-2 text-sm font-bold underline">
                    All {c.full} reviews
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>
      <Guide
        white
        title="Why owner reviews are worth your time"
        paras={[
          "Experts spend a week with a car, while owners live with it for years. That long view reveals things no road test can: how well the air conditioning copes in the peak of summer, how helpful the local workshop is, and whether the seats still feel comfortable after a long journey with the whole family on board.",
          "Look for patterns instead of extremes. One furious review may just reflect a bad experience with a single dealer, but if many people mention the same rattle or the same mileage figure, then it is probably true. Also consider the reviewer's situation, since a highway commuter and a city driver will naturally judge the same car quite differently.",
          "If you own a car, sharing your experience is genuinely useful to the next buyer. Be specific about how long you have owned the car, how you use it and what surprised you, whether in a good way or a bad one. Honest details, including small complaints, are far more helpful than general praise or blame.",
          "Owner reviews appear here once our editors have checked them. In the live product, reviews would be moderated, any incentives would be clearly disclosed, and verified ownership would be labelled, so that you could easily tell how much weight to give each one.",
        ]}
      />
    </>
  );
}
