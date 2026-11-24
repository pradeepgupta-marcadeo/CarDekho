import Link from "next/link";
import { Pic } from "@/components/cards";
import { Guide, PageHead, Section } from "@/components/ui";
import { carPhoto } from "@/data/cars";
import { STORIES } from "@/data/content";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Visual car stories: quick swipeable guides",
    description: "Swipe through short visual stories on family SUVs, electric cars, city hatchbacks, sedans and luxury picks. Get the key points on each car in under a minute or two.",
    path: "/visual-stories",
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead crumbs={[{ label: "Visual stories" }]} title="Car ideas in under a minute" intro="Tap a story for a quick, visual run through the cars worth knowing about in each category." />
      <Section>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STORIES.filter((s) => s.cars[0]).map((s) => (
            <li key={s.slug}>
              <Link href={`/visual-stories/${s.slug}`} className="group relative block aspect-9/14 overflow-hidden rounded-2xl text-white">
                <Pic
                  photo={carPhoto(s.cars[0])}
                  alt={`Cover image for ${s.title}`}
                  sizes="(max-width: 640px) 46vw, 20vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/20 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 font-display font-bold leading-snug">{s.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Guide
        white
        title="Why quick stories help"
        paras={[
          "Visual stories are designed for the moments when you have a minute or two rather than half an hour. Each one takes a simple theme, shows you a few cars worth knowing about and gives you the single most useful fact about each. They are an easy way to discover models that you might never have searched for by name.",
          "They work best at the very start of your search, when you are still working out what kind of car you want. A quick look at family SUVs or city hatchbacks can show you how much space or how many features your budget buys today, and this often changes your expectations in helpful and surprising ways.",
          "When a car catches your eye, follow the link at the end of the story to its full page. There you will find the on-road price for your city, the variants and an honest list of pros and cons. Use stories for inspiration, and then switch over to comparisons and test drives when it is time to decide.",
          "Stories are built from current prices and specifications, so please confirm the details with an authorised dealer. In the live product they would be regularly refreshed, and each slide would use properly licensed images, with prices confirmed at the time of publication.",
          "If a story leaves you curious, save the cars you like to your shortlist by tapping the heart, so that you can return to them later and compare them properly when you have more time.",
        ]}
      />
    </>
  );
}
