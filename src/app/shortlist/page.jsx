import { ShortlistView } from "@/components/tools";
import { PageHead, Section } from "@/components/ui";
import { CARS } from "@/data/cars";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Your saved car shortlist",
    description: "See every new car you have saved in one place, so that you can compare your favourites, check prices and decide on the car that fits you best when you are ready.",
    path: "/shortlist",
    noindex: true,
  });
}

export default async function Page() {
  await ready();
  return (
    <>
      <PageHead crumbs={[{ label: "Your shortlist" }]} title="Cars you have saved" intro="Saved on this device. Tap the heart on any car to add or remove it." />
      <Section>
        <ShortlistView cars={CARS.map(cardOf)} />
      </Section>
    </>
  );
}
