import { ArrowRight, BadgeIndianRupee, Fuel, Gauge, MapPin, Ruler, ShieldCheck, Star, ThumbsDown, ThumbsUp, Users, Zap } from "lucide-react";
import Link from "next/link";

import { baseFuel, byPopularity, carKey, carPhoto, carPhotos, CARS, carUrl, emi, hasMileage, lakh, mileageText, onRoad, onRoadFor, onSale, priceRange, rupees, variantsOf } from "@/data/cars";
import { CARS_BY_KEY, COMPARE_PAIRS, articlePhoto, articleUrl, articlesForCar, articlesOf, ownerReviews, popularNews } from "@/data/content";
import { CITIES, SITE } from "@/data/site";
import { dimsOf } from "@/lib/news-story";
import { BrandGrid } from "./brand-grid";
import { HeartButton, LeadButton, Pic } from "./cards";
import { EmiPlanner, ExpandText, RateCard, VariantExplorer } from "./car-overview-client";
import { ColourBrowser, ColourGallery, ColourPriceNote, ColourScope } from "./colour-gallery";
import { Carousel } from "./Carousel";
import { SideTabs } from "./news-client";
import { GalleryLauncher, View360Button } from "./view360-button";
import { ArticleCard, Breadcrumbs, Container, Faq, JsonLd } from "./ui";

const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const bodyWord = (c) => (c.body === "SUV" || c.body === "MUV" ? c.body : c.body.toLowerCase());
const fuelWords = (c) => c.fuels.map((f) => (f === "CNG" ? f : f.toLowerCase())).join(", ");

function Block({ id, title, children, more }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-32 rounded-2xl bg-white p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id={`${id}-h`} className="text-xl font-extrabold sm:text-2xl">
          {title}
        </h2>
        {more && (
          <Link href={more.href} className="inline-flex items-center gap-1 text-sm font-bold hover:underline">
            {more.label}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function SpecCard({ Icon, title, figure, text, points }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-ink-200 p-4">
      <span className="grid size-10 place-items-center rounded-xl bg-lime-300/60">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="font-display mt-1 text-2xl font-extrabold">{figure}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-900" />
            {p}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function CarOverview({ car, faqs, related }) {
  const url = carUrl(car);
  const photos = carPhotos(car).map((p) => ({
    photo: { src: p.src, w: p.w, h: p.h },
    kind: p.kind,
    colour: p.colour ?? null,
    title: p.title ?? null,
    angle: p.angle ?? null,
    group: p.group ?? null,
  }));
  // The overview shows a handful of photos; the full gallery is on the images page.
  const preview = photos.filter((p) => !p.colour).slice(0, 9);
  const variants = variantsOf(car);
  const upcoming = car.status === "upcoming";
  const ev = car.fuels.length === 1 && car.fuels[0] === "Electric";
  const stories = articlesForCar(car).filter((a) => a.kind === "news");
  const expert = articlesOf("review").find((a) => a.car && carKey(a.car) === carKey(car));
  const reviews = ownerReviews(car);
  const d = dimsOf(car);
  const rated = car.ncap > 0;
  const [base, top] = [car.features?.base ?? {}, car.features?.top ?? {}];
  const airbags =
    base.airbags && top.airbags && base.airbags !== top.airbags ? `${base.airbags} to ${top.airbags} airbags` : base.airbags || top.airbags ? `${base.airbags || top.airbags} airbags` : null;
  // Real safety kit from the scraped trims; nothing is assumed.
  const safetyPoints = [airbags, top.esc && "Electronic stability control", top.isofix && "ISOFIX child seat mounts", top.adas && top.adas !== "none" && "ADAS on top trims"].filter(Boolean);
  const standardKit = [
    base.airbags > 0 && `${base.airbags} airbags`,
    base.esc && "Electronic stability control",
    base.isofix && "ISOFIX mounts",
    base.tpms && "Tyre pressure monitor",
    base.rearCamera && "Rear parking camera",
    base.autoClimate && "Automatic climate control",
  ].filter(Boolean);
  const delhi = onRoadFor(variantsOf(car)[0], CITIES[0], car.min, baseFuel(car));
  const monthly = emi(delhi.total * 0.8, 9.5, 48);
  const cityPages = new Set(byPopularity(onSale()).slice(0, 8).map(carKey));
  const variantCards = variants.map((v, i) => ({
    ...v,
    base: i === 0,
    extra: i ? Math.round((v.price - variants[i - 1].price) * 100) / 100 : undefined,
    prev: i ? variants[i - 1].name : undefined,
  }));
  const fuelLabel = ev ? "Electric" : car.fuels.includes("CNG") ? "CNG" : car.fuels.includes("Hybrid") ? "Hybrid" : car.fuels[0];
  const fuelRows = (
    ev
      ? [
          ["Battery capacity", car.engine],
          ["Claimed range", mileageText(car)],
          ["Maximum power", car.power],
          ["Maximum torque", car.torque],
          ["Gearbox", "Single-speed automatic"],
          ["DC fast charging", car.features?.ev?.dcKw ? `Up to ${car.features.ev.dcKw} kW` : null],
          ["Boot space", car.boot ? `${car.boot} litres` : null],
        ]
      : [
          ["Engine", car.engine],
          ["Claimed mileage", mileageText(car)],
          ["Maximum power", car.power],
          ["Maximum torque", car.torque],
          ["Gearbox", car.auto ? "Manual and automatic" : "Manual"],
          ["Fuel options", car.fuels.join(", ")],
          ["Seating", `${car.seats} people`],
          ["Boot space", car.boot ? `${car.boot} litres` : null],
        ]
  ).filter(([, v]) => v);
  const sameBody = CARS.filter((c) => c.body === car.body && c.slug !== car.slug);
  const sideCar = (c) => ({
    href: carUrl(c),
    title: c.full,
    photo: carPhoto(c),
    meta: priceRange(c),
    badge: c.status === "new-launch" ? "New" : undefined,
  });
  const sideNews = (a) => ({
    href: articleUrl(a),
    title: a.title,
    photo: articlePhoto(a),
  });
  const pairs = COMPARE_PAIRS.filter(([a, b]) => CARS_BY_KEY[a] && CARS_BY_KEY[b] && (CARS_BY_KEY[a].body === car.body || CARS_BY_KEY[b].body === car.body)).slice(0, 5);
  const highlights = [
    { title: car.pros[0], href: `${url}/reviews` },
    {
      title: `Is the ${car.name} worth ${priceRange(car).split(" - ")[0]} lakh?`,
      href: `${url}/price`,
    },
    { title: car.pros[1], href: `${url}/specs` },
    { title: `Which ${car.name} variant to buy`, href: `${url}/variants` },
    { title: car.pros[2], href: `${url}/images` },
  ];

  return (
    <ColourScope>
      {/* Google needs a price, rating or review for car (product) markup, so cars not yet on sale get none. */}
      {!upcoming && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Car",
            name: car.full,
            brand: { "@type": "Brand", name: car.brand },
            bodyType: car.body,
            image: carPhoto(car).src.startsWith("http") ? carPhoto(car).src : `${SITE.url}${carPhoto(car).src}`,
            vehicleSeatingCapacity: car.seats,
            url: `${SITE.url}${url}`,
            ...(upcoming
              ? {}
              : {
                  offers: {
                    "@type": "AggregateOffer",
                    priceCurrency: "INR",
                    lowPrice: Math.round(car.min * 100000),
                    highPrice: Math.round(car.max * 100000),
                    offerCount: variants.length,
                  },
                }),
            ...(car.reviews
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: car.rating,
                    reviewCount: car.reviews,
                    bestRating: 5,
                  },
                }
              : {}),
          }}
        />
      )}

      <div className="bg-white">
        <Container className="py-5 lg:py-7">
          <Breadcrumbs items={[{ label: "New cars", href: "/new-cars" }, { label: car.brand, href: `/brands/${car.brandSlug}` }, { label: car.name }]} />
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
            <div className="relative min-w-0">
              <ColourGallery photos={photos} colours={car.colors} name={car.full} limit={5} moreHref={`${url}/images`} />
              <View360Button model={car.model3d} spin={car.spin} name={car.full} photos={photos} colors={car.colors} className="absolute right-3 top-3 z-10" />
              <GalleryLauncher model={car.model3d} spin={car.spin} name={car.full} photos={photos} colors={car.colors} className="mt-3" />
            </div>
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-500">
                    {car.brand} · {car.body}
                  </p>
                  <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{car.full}</h1>
                </div>
                <HeartButton id={carKey(car)} name={car.full} />
              </div>
              {car.reviews > 0 && (
                <Link href={`${url}/reviews`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
                  <Star className="size-4 fill-lime-500 text-lime-500" />
                  {car.rating} from {car.reviews} {car.name} reviews
                </Link>
              )}
              <p className="mt-4 text-3xl font-extrabold">{priceRange(car)}</p>
              <p className="text-xs text-ink-500">
                {upcoming ? "Expected price" : "Ex-showroom price, Delhi"} ·{" "}
                <Link href={`${url}/price`} className="font-semibold underline">
                  See {car.name} on-road price
                </Link>
              </p>
              <ColourPriceNote colours={car.colors} minLakh={car.min} maxLakh={car.max} />
              <p className="mt-3 text-sm">
                EMI from <strong>{rupees(monthly)}/month</strong> ·{" "}
                <Link href={`${url}/emi`} className="font-semibold underline">
                  Edit {car.name} EMI
                </Link>
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  {
                    l: ev ? "Range" : "Mileage",
                    v: mileageText(car),
                    I: Gauge,
                  },
                  { l: ev ? "Battery" : "Engine", v: car.engine, I: Fuel },
                  { l: "Power", v: car.power, I: Zap },
                  { l: "Seats", v: String(car.seats), I: Users },
                ]
                  .filter((x) => x.v)
                  .map(({ l, v, I }) => (
                    <div key={l} className="rounded-2xl bg-paper p-3">
                      <I className="size-4 text-ink-500" />
                      <p className="mt-1 text-xs text-ink-500">{l}</p>
                      <p className="text-sm font-bold">{v}</p>
                    </div>
                  ))}
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <LeadButton
                  title={upcoming ? `Alert me about the ${car.full}` : `Best price for the ${car.full}`}
                  intent={upcoming ? "Launch alert" : "Best price"}
                  label={upcoming ? "Alert me at launch" : "Get best price"}
                  variant="lime"
                  className="py-3.5"
                />
                <LeadButton title={`Test drive the ${car.full}`} intent="Book a test drive" label="Book a test drive" variant="dark" className="py-3.5" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-8">
        <div className="min-w-0 space-y-5">
          <Block id="summary" title={`${car.name} quick summary`}>
{car.summary ? (
              <ExpandText text={car.summary} />
            ) : (
              <ExpandText
              text={`The ${car.full} is a ${car.seats}-seat ${bodyWord(car)} priced between ${priceRange(car)} ex-showroom, and it is ${car.angle}. It offers ${fuelWords(car)} power with ${car.power} and ${car.torque}, ${[hasMileage(car) && `a claimed ${car.mileage}`, car.boot && `${car.boot} litres of boot space`].filter(Boolean).reduce((t, x, i) => `${t}${i ? " and " : ", along with "}${x}`, "")}.`}
              more={`It comes in ${variants.length} variants, from the ${variants[0].name} to the ${variants[variants.length - 1].name}, and ${rated ? `it carries a ${car.ncap}-star safety rating` : "no crash test rating is listed for it yet"}. Its main strengths are these: ${lc(car.pros[0])} and ${lc(car.pros[1])}. The trade-off to check on your test drive is this: ${lc(car.cons[0])}. Figures are updated regularly but can change, so please confirm them with an authorised ${car.brand} dealer.`}
            />
            )}
          </Block>

          {car.overview.length > 0 && (
            <Block id="buying-guide" title={`${car.name} buying guide`}>
              <div className="prose-site mt-2">
                {car.overview.map((sec) => (
                  <section key={sec.h || sec.p[0].slice(0, 30)}>
                    {sec.h && <h3>{sec.h}</h3>}
                    {sec.p.map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                  </section>
                ))}
              </div>
            </Block>
          )}

          <Block id="highlights" title={`${car.name} highlights`}>
            <div className="mt-2">
              <Carousel label={`${car.name} highlights`} item="w-[46%] sm:w-[31%] xl:w-[23%]">
                {highlights.map((h, i) => {
                  const p = photos[i % photos.length];
                  return (
                    <Link key={h.title} href={h.href} className="group relative block aspect-3/4 overflow-hidden rounded-2xl text-white">
                      <Pic
                        photo={p.photo}
                        alt={`${car.full}: ${h.title}`}
                        sizes="(max-width: 640px) 46vw, 200px"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                      <span className="absolute inset-x-3 bottom-3 text-sm font-bold leading-snug">{h.title}</span>
                    </Link>
                  );
                })}
              </Carousel>
            </div>
          </Block>

          <Block id="pros-cons" title={`${car.name} pros, cons and ratings`}>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-ink-200 p-4">
                <h3 className="font-bold">Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  The {car.name} is {car.angle}.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-700">
                  <li className="flex gap-2">
                    <Fuel className="size-4 shrink-0" />
                    {car.engine} {ev ? "battery" : "engine"}
                  </li>
                  {hasMileage(car) && (
                    <li className="flex gap-2">
                      <Gauge className="size-4 shrink-0" />
                      {car.mileage}
                    </li>
                  )}
                  <li className="flex gap-2">
                    <ShieldCheck className="size-4 shrink-0" />
                    {rated ? `${car.ncap}-star safety rating` : "Crash test rating not listed"}
                  </li>
                  <li className="flex gap-2">
                    <Users className="size-4 shrink-0" />
                    {car.seats} seats, {car.boot}-litre boot
                  </li>
                  <li className="flex gap-2">
                    <BadgeIndianRupee className="size-4 shrink-0" />
                    EMI from {rupees(monthly)}
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-lime-500 bg-lime-300/10 p-4">
                <h3 className="font-bold">Pros and trade-offs</h3>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-lime-700">
                  <ThumbsUp className="size-4" />
                  What we like
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-700">
                  {car.pros.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-coral-700">
                  <ThumbsDown className="size-4" />
                  Worth knowing
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-700">
                  {car.cons.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Block>

          <Block id="specs" title={`${car.name} specs and features`} more={{ href: `${url}/specs`, label: `All ${car.name} specs` }}>
            <p className="mt-2 text-[15px] leading-7 text-ink-700">
              The {car.name} uses a {car.engine} {ev ? "battery pack" : "powertrain"} that makes {car.power} and {car.torque}, with{" "}
              {car.auto ? "both manual and automatic options" : "a manual gearbox"}. Here is what matters most in everyday use.
            </p>
            <div className="mt-2">
              <Carousel label={`${car.name} key specifications`} item="w-[80%] sm:w-[46%] xl:w-[32%]">
                <SpecCard
                  Icon={Zap}
                  title="Engine and performance"
                  figure={car.engine}
                  text={`Tuned to suit ${parseInt(car.power) > 150 ? "quick highway overtakes" : "easy city and steady highway use"}.`}
                  points={[`${car.power} of power`, `${car.torque} of torque`, car.fuels.join(", ")]}
                />
                <SpecCard
                  Icon={Ruler}
                  title="Dimensions and boot"
                  figure={d.length ? `${d.length} mm` : "Not listed"}
                  text={d.length ? `Overall length${d.wheelbase ? `, with a ${d.wheelbase} mm wheelbase for cabin space` : ""}.` : "Dimensions are not listed for this car yet."}
                  points={[d.width && `${d.width} mm wide`, d.height && `${d.height} mm tall`, car.boot && `${car.boot}-litre boot`].filter(Boolean)}
                />
                <SpecCard
                  Icon={BadgeIndianRupee}
                  title="Price and variants"
                  figure={priceRange(car)}
                  text="Ex-showroom range. On-road cost changes by city."
                  points={[`${variants.length} variants listed`, `Starts with ${variants[0].name}`, `EMI from ${rupees(monthly)}`]}
                />
                {hasMileage(car) && (
                  <SpecCard
                    Icon={Gauge}
                    title={ev ? "Range and charging" : "Mileage"}
                    figure={car.mileage}
                    text="Claimed figure. Real-world results depend on traffic and load."
                    points={[`${car.fuels[0]} is the main option`, "Check tyre pressure for best results", "See today's fuel prices"]}
                  />
                )}
                <SpecCard
                  Icon={ShieldCheck}
                  title="Safety"
                  figure={rated ? `${car.ncap}-star` : "Not rated"}
                  text={rated ? "Crash test rating. Equipment differs by trim." : "No crash test result is listed yet. Equipment differs by trim."}
                  points={safetyPoints}
                />
              </Carousel>
            </div>
          </Block>

          <Block
            id="variants"
            title={`${car.name} variants`}
            more={{
              href: `${url}/variants`,
              label: `${car.name} variant guide`,
            }}
          >
            <p className="mt-2 text-[15px] leading-7 text-ink-700">
              The {car.name} is listed in {variants.length} variants:{" "}
              {variants.map((v, i) => (
                <span key={v.slug}>
                  {i > 0 && ", "}
                  <Link href={`${url}/variants/${v.slug}`} className="font-medium text-lime-700 hover:underline">
                    {v.name}
                  </Link>
                </span>
              ))}
              . Our value pick is the {variants[Math.min(2, variants.length - 1)].name}.
            </p>
            {standardKit.length > 0 && (
              <div className="my-4 rounded-xl bg-lime-300/25 p-3">
                <p className="text-xs font-bold">All {car.name} variants have</p>
                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700">
                  {standardKit.map((x) => (
                    <li key={x}>✓ {x}</li>
                  ))}
                </ul>
              </div>
            )}
            <VariantExplorer variants={variantCards} baseUrl={url} carName={car.name} />
          </Block>

          <Block id="emi" title={`${car.name} EMI`} more={{ href: `${url}/emi`, label: "Full EMI calculator" }}>
            <div className="mt-4">
              <EmiPlanner
                variants={variants.map((v) => ({
                  name: v.name,
                  price: v.price,
                  fuel: v.fuel,
                  onRoad: v.onRoad,
                }))}
                carName={car.name}
              />
            </div>
          </Block>

          <div className="grid gap-5 md:grid-cols-2">
            <Block id="colours" title={`${car.name} colours`} more={{ href: `${url}/colours`, label: "All colours" }}>
              <p className="mb-3 mt-2 text-sm text-ink-700">
                Available in {car.colors.length} shades, including {car.colors[0].name}.
              </p>
              <ColourBrowser photos={photos} colours={car.colors} name={car.full} />
            </Block>
            <Block id="fuel" title={`${car.name} ${fuelLabel}`}>
              <p className="mt-2 text-sm text-ink-700">Key {fuelLabel === "CNG" ? fuelLabel : fuelLabel.toLowerCase()} specifications at a glance.</p>
              <dl className="mt-3 divide-y divide-ink-100 text-sm">
                {fuelRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`${url}/price`} className="mt-3 inline-block text-sm font-bold text-lime-700 hover:underline">
                Check {car.name} price in your city
              </Link>
            </Block>
          </div>

          <Block id="images" title={`${car.name} images`} more={{ href: `${url}/images`, label: `All ${car.name} images` }}>
            <GalleryLauncher model={car.model3d} spin={car.spin} name={car.full} photos={photos} colors={car.colors} className="mt-3" />
            <ul className={`mt-4 grid gap-3 ${preview.length === 1 ? "grid-cols-1" : preview.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {preview.map((p) => (
                <li key={p.photo.src}>
                  <Link href={`${url}/images`} className="group block">
                    <span className="block aspect-4/3 overflow-hidden rounded-xl">
                      <Pic
                        photo={p.photo}
                        alt={`${car.full} ${(p.title ?? `${p.kind} view`).toLowerCase()}`}
                        sizes="(max-width: 640px) 45vw, 240px"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium text-ink-700">
                      {car.name} {(p.title ?? `${p.kind} view`).toLowerCase()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Block>

          {(car.verdict || expert) && (
            <Block id="expert" title={`Is the ${car.name} worth buying?`}>
              {car.verdict && <p className="mt-2 text-[15px] leading-7 text-ink-700">{car.verdict}</p>}
              {expert && (
                <Link
                  href={articleUrl(expert)}
                  className="mt-4 inline-block rounded-xl border border-ink-900 px-5 py-2.5 text-sm font-bold transition hover:bg-ink-950 hover:text-white"
                >
                  Read the full {car.name} review
                </Link>
              )}
            </Block>
          )}

          {car.reviews > 0 && (
            <Block
              id="user-reviews"
              title={`${car.name} user reviews`}
              more={{
                href: `${url}/reviews`,
                label: `All ${car.reviews} reviews`,
              }}
            >
              <p className="mt-2 flex items-center gap-1 text-2xl font-extrabold">
                <Star className="size-6 fill-lime-500 text-lime-500" />
                {car.rating}
                <span className="text-sm font-medium text-ink-500">/5</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {["Looks", "Comfort", "Mileage", "Interior", "Space", "Price", "Power"].map((t, i) => (
                  <li key={t} className="rounded-full border border-ink-200 px-3 py-1">
                    {t} ({Math.round(car.reviews / (i + 2))})
                  </li>
                ))}
              </ul>
              <div className="mt-2">
                <Carousel label={`${car.name} owner reviews`} item="w-[80%] sm:w-[46%] xl:w-[32%]">
                  {reviews.map((r) => (
                    <article key={r.id} className="flex h-full flex-col rounded-2xl border border-ink-200 p-4">
                      <p aria-label={`Rated ${r.rating} out of 5`} className="text-sm font-bold">
                        ★ {r.rating}
                      </p>
                      <h3 className="mt-1 text-sm font-bold">{r.title}</h3>
                      <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-ink-700">{r.text}</p>
                      <p className="mt-3 text-xs text-ink-500">
                        {r.author} · {r.date}
                      </p>
                    </article>
                  ))}
                </Carousel>
              </div>
            </Block>
          )}

          {stories.length > 0 && (
            <Block id="news" title={`${car.name} news`} more={{ href: `${url}/news`, label: `All ${car.name} news` }}>
              <div className="mt-2">
                <Carousel label={`${car.name} news`} item="w-[80%] sm:w-[46%] xl:w-[32%]">
                  {stories.map((a) => (
                    <div key={a.slug} className="h-full">
                      <ArticleCard a={a} />
                    </div>
                  ))}
                </Carousel>
              </div>
            </Block>
          )}
        </div>

        <aside aria-label={`More about the ${car.name}`} className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="text-lg font-extrabold">{car.name} on-road price in India</h2>
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">{car.full} starting on-road price by city</caption>
              <thead>
                <tr className="text-left text-xs text-ink-500">
                  <th scope="col" className="pb-2 font-medium">
                    City
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    On-road from
                  </th>
                </tr>
              </thead>
              <tbody>
                {CITIES.slice(0, 6).map((c) => {
                  const t = onRoadFor(variantsOf(car)[0], c, car.min, baseFuel(car)).total;
                  return (
                    <tr key={c.slug} className="border-t border-ink-100">
                      <th scope="row" className="py-2 text-left font-medium">
                        {cityPages.has(carKey(car)) ? (
                          <Link href={`${url}/price-in-${c.slug}`} className="text-lime-700 hover:underline">
                            {c.name}
                          </Link>
                        ) : (
                          c.name
                        )}
                      </th>
                      <td className="py-2 text-right font-semibold">₹{lakh(t / 100000)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Link href={`${url}/price`} className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-ink-200 py-2 text-sm font-bold transition hover:border-ink-900">
              <MapPin className="size-4" />
              See price in more cities
            </Link>
          </section>

          {hasMileage(car) && (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="text-lg font-extrabold">
                {car.name} {ev ? "range" : "mileage"}
              </h2>
              <p className="mt-1 text-sm text-ink-500">Claimed figures for the {car.name}. Real-world results will vary.</p>
              <dl className="mt-3 divide-y divide-ink-100 text-sm">
                {car.fuels.map((f, i) => (
                  <div key={f} className="flex justify-between gap-3 py-2">
                    <dt className="text-ink-500">{f}</dt>
                    <dd className="font-semibold">{i === 0 ? car.mileage : "See specs"}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`${url}/mileage`} className="mt-2 inline-block text-sm font-bold text-lime-700 hover:underline">
                {car.name} {ev ? "range" : "mileage"} guide
              </Link>
            </section>
          )}

          <RateCard name={car.name} />

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="text-lg font-extrabold">{car.name} latest updates</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {stories.slice(0, 3).map((a) => (
                <li key={a.slug} className="border-l-2 border-lime-500 pl-3">
                  <Link href={articleUrl(a)} className="font-medium hover:underline">
                    {a.title}
                  </Link>
                  <span className="block text-xs text-ink-500">{a.date}</span>
                </li>
              ))}
              {stories.length === 0 && (
                <li className="border-l-2 border-lime-500 pl-3 text-ink-700">
                  No new updates for the {car.name} right now.{" "}
                  <Link href="/news" className="font-bold underline">
                    Read the latest car news
                  </Link>
                  .
                </li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-extrabold">{car.name} FAQs</h2>
            <Faq items={faqs} />
            <Link href={`${url}/faqs`} className="mt-3 block rounded-xl border border-ink-900 bg-white py-2.5 text-center text-sm font-bold transition hover:bg-ink-950 hover:text-white">
              View all {car.name} questions
            </Link>
          </section>

          <SideTabs
            title={`Trending ${car.body === "SUV" || car.body === "MUV" ? car.body : car.body.toLowerCase()} cars`}
            tabs={[
              {
                label: "Popular",
                items: byPopularity(sameBody.filter((c) => c.status !== "upcoming"))
                  .slice(0, 5)
                  .map(sideCar),
              },
              {
                label: "Latest",
                items: byPopularity(sameBody.filter((c) => c.status === "new-launch"))
                  .concat(byPopularity(sameBody.filter((c) => c.status === "on-sale")))
                  .slice(0, 5)
                  .map(sideCar),
              },
            ]}
            footer={{
              label: `View all ${bodyWord(car)} cars`,
              href: `/new-cars/${car.body.toLowerCase()}`,
            }}
          />

          {pairs.length > 0 && (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="text-lg font-extrabold">Popular comparisons</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {pairs.map(([a, b]) => (
                  <li key={a + b}>
                    <Link href={`/compare-cars/${a}-vs-${b}`} className="block rounded-lg border border-ink-100 px-3 py-2.5 font-semibold transition hover:border-ink-900 hover:bg-lime-300/40">
                      {CARS_BY_KEY[a].name} vs {CARS_BY_KEY[b].name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <SideTabs
            title="Car news"
            tabs={[
              {
                label: "Trending",
                items: popularNews().slice(0, 5).map(sideNews),
              },
              {
                label: "Recent",
                items: articlesOf("news").slice(0, 5).map(sideNews),
              },
            ]}
            footer={{ label: "View all car news", href: "/news" }}
          />

          <BrandGrid />
        </aside>
      </Container>
      {related}
    </ColourScope>
  );
}
