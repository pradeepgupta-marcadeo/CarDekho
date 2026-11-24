import { PageHead, Section } from "@/components/ui";
import { CARS, allLogos } from "@/data/cars";
import { credits, ready } from "@/data/store";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Image credits and photo rights",
    description: "Who owns the car photos, brand logos and 3D models on Wheelora, how we use them, and how to contact us if an image needs to be corrected or removed.",
    path: "/image-credits",
  });
}

export default async function Page() {
  await ready();
  const sources = credits();
  return (
    <>
      <PageHead crumbs={[{ label: "Image credits" }]} title="Image credits and photo rights" intro="Who owns the pictures on this site, and how we use them." />
      <Section>
        <h2 className="mb-3 text-xl font-bold">Car photos</h2>
        <div className="prose-site mb-8 max-w-3xl">
          <p>
            The car photos on this site are product and press images of each model, including its colour options. They remain the property of the car makers and the photographers who took them,
            and we show them only to help you identify the car, its variants and its colours. We resize them and convert them to a web format so that pages load quickly.
          </p>
          <p>
            A photo can show a different trim, model year or market version than the one described on a page, so please treat it as a visual reference only. If you own the rights to an image and
            want it credited differently or removed, tell us through the contact page and we will act on it quickly.
          </p>
        </div>
        <h2 className="mb-3 text-xl font-bold">Brand logos</h2>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink-700">
          Logo files come from Wikimedia Commons. A free copyright status does not remove trademark rights, and every logo remains a trademark of its owner.
        </p>
        <ul className="mb-8 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(allLogos()).map(([slug, l]) => (
            <li key={slug}>
              {l.page ? (
                <a href={l.page} rel="noopener" className="font-semibold underline">
                  Logo file for {slug.replace(/-/g, " ")}
                </a>
              ) : (
                <span className="font-semibold">Logo for {slug.replace(/-/g, " ")}</span>
              )}
              {l.license ? ` (${l.license})` : ""}
            </li>
          ))}
        </ul>
        {CARS.some((c) => c.model3d) && (
          <>
            <h2 className="mb-3 text-xl font-bold">360 degree 3D models</h2>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink-700">
              The 360 degree views load 3D models through the Sketchfab embed player. The models are made by independent artists, not by the car makers, so details can differ from the showroom
              car. The licence shown is the one listed on Sketchfab.
            </p>
            <ul className="mb-8 grid gap-2 text-sm sm:grid-cols-2">
              {CARS.filter((c) => c.model3d).map((c) => (
                <li key={c.key}>
                  <a href={c.model3d.url} rel="noopener" className="font-semibold underline">
                    3D model for the {c.full}: {c.model3d.name}
                  </a>{" "}
                  by {c.model3d.author} ({c.model3d.license})
                </li>
              ))}
            </ul>
          </>
        )}
        {sources.length > 0 && (
          <>
            <h2 className="mb-3 text-xl font-bold">Data sources</h2>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink-700">Some facts on this site come from these open sources, used under their licences.</p>
            <ul className="mb-8 grid gap-2 text-sm sm:grid-cols-2">
              {sources.map((c) => (
                <li key={c.name}>
                  <a href={c.url} rel="noopener" className="font-semibold underline">
                    {c.name}
                  </a>
                  : {c.what} ({c.license})
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </>
  );
}
