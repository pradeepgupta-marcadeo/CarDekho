import { ArticleHub } from "@/lib/article-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Expert car reviews and road tests in India",
    description: "Read expert car reviews and road tests covering design, comfort, performance and running costs. Clear verdicts help you judge whether a car truly suits how you drive.",
    path: "/expert-reviews",
  });
}

export default async function Page() {
  await ready();
  return (
    <ArticleHub
      kind="review"
      crumb="Expert reviews"
      title="Road tests with clear verdicts"
      intro="We focus on how a car fits real life in India, and we say plainly who should and should not buy it."
      guideTitle="How we approach a car review"
      guide={[
        "A useful review goes beyond the brochure. We look at how a car copes with broken roads, stop-and-go traffic and a full family on board, since these situations reveal far more than a smooth launch-event route ever could. The goal is to help you picture life with the car, including the parts that are not glamorous.",
        "Every review follows the same structure, so that you can compare easily: design and first impressions, then cabin and features, performance and running costs, and finally a clear verdict. We also try to name the specific trim that gives the best value, because the top version used for photographs is rarely the one that most people should buy.",
        "No car is perfect, so we always spell out the compromises. A firm ride might be a problem for one family and a pleasure for an enthusiast, while a modest engine may be fine in the city but tiring on highways. Read the downsides carefully and ask yourself whether they would really bother you on your usual routes.",
        "Use our reviews to build a shortlist, and then trust your own test drive for the final decision. Please note that these reviews are sample articles written to show the format, so they do not reflect actual road tests of these cars.",
      ]}
    />
  );
}
