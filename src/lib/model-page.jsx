import Link from "next/link";
import { CarOverview } from "@/components/car-overview";
import { CarCard } from "@/components/cards";
import { Carousel } from "@/components/Carousel";
import { View360Button } from "@/components/view360-button";
import { ColourPage, ColourScope } from "@/components/colour-gallery";
import { PhotoGallery } from "@/components/photo-gallery";
import { Studio360Lazy } from "@/components/studio360-lazy";
import { EmiCalculator, OnRoadTable, PlaceLocator } from "@/components/tools";
import { ArticleCard, Breadcrumbs, Container, Faq, LinkPills, Section, SectionHead } from "@/components/ui";
import { baseFuel, carKey, carPhoto, carPhotos, CARS, carUrl, emi, fullSheet, hasMileage, lakh, lakhShort, onRoadFor, priceRange, specGroups, variantsOf } from "@/data/cars";
import { CARS_BY_KEY, COMPARE_PAIRS, articlesForCar, ownerReviews, showrooms } from "@/data/content";
import { CITIES } from "@/data/site";
import { cardOf } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { contentYear, keywordsFor } from "@/data/store";

export const TAB_SLUGS = ["price", "specs", "images", "colours", "mileage", "reviews", "emi", "dealers", "news", "faqs"];
/** The tabs this car has: the mileage tab only once a real mileage figure is listed. */
export const tabsFor = (car) => TAB_SLUGS.filter((t) => t !== "mileage" || hasMileage(car));

const alternatives = (car) =>
  CARS.filter((c) => c.slug !== car.slug && c.body === car.body)
    .sort((a, b) => Math.abs(a.min - car.min) - Math.abs(b.min - car.min))
    .slice(0, 6);

const isEvCar = (car) => car.fuels.length === 1 && car.fuels[0] === "Electric";
const rs = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
/** On-road price of the base variant in the first city (New Delhi), from the city's real price list when there is one. */
const firstCityOnRoad = (car) => {
  const v = variantsOf(car)[0];
  return v && CITIES[0] ? { city: CITIES[0].name, total: onRoadFor(v, CITIES[0], car.min, baseFuel(car)).total } : null;
};

/**
 * Questions people search for, answered from the car's real data. Each question carries a search phrase from the
 * keyword bank ("creta top model price", "creta on road price in new delhi"); a question without data is left out.
 */
const qWords = (q) => new Set(q.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length > 3));
const sameQuestion = (a, b) => {
  const [x, y] = [qWords(a), qWords(b)];
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / Math.max(1, Math.min(x.size, y.size)) >= 0.7;
};

/** The data questions below, then the car's own written FAQs (CarScrapper > Car pages) that ask something new. */
export const carFaqs = (car) => {
  const data = dataFaqs(car);
  const written = (car.faqs ?? []).filter((f) => f?.q && f?.a && !data.some((d) => sameQuestion(d.q, f.q)));
  return [...data, ...written].slice(0, 14);
};

const dataFaqs = (car) => {
  const v = variantsOf(car);
  const ev = isEvCar(car);
  const n = car.name;
  const first = v[0];
  const top = v[v.length - 1];
  const road = firstCityOnRoad(car);
  const autos = v.filter((x) => x.trans && !/manual/i.test(x.trans));
  const colours = car.colors ?? [];
  const rivals = alternatives(car).slice(0, 3);
  const f = car.features ?? {};
  const airbags = f.base?.airbags && f.top?.airbags ? (f.base.airbags === f.top.airbags ? `${f.top.airbags} airbags` : `${f.base.airbags} to ${f.top.airbags} airbags`) : null;
  const upcoming = car.status === "upcoming";
  return [
    upcoming
      ? { q: `What is the ${n} launch date and expected price?`, a: `The ${car.full} is expected ${car.launch ? `in ${car.launch}` : "soon"}${car.min ? `, with an expected price of ${priceRange(car)}` : ""}. Prices and dates are confirmed only at the official launch.` }
      : { q: `What is the ${n} price in India?`, a: `The ${car.full} price in India is ${priceRange(car)} (ex-showroom)${first && top && v.length > 1 ? `, from the ${first.name} to the ${top.name}` : ""}. The on-road price adds road tax, registration and insurance, which differ by state.` },
    !upcoming && road && { q: `What is the ${n} on road price in ${road.city}?`, a: `The ${n} on road price in ${road.city} starts at about ${rs(road.total)} for the ${first.name}, including road tax, registration and insurance. Open the ${n} price page for every variant and other cities.` },
    !upcoming && v.length > 1 && { q: `What is the price of the ${n} top model?`, a: `The ${n} top model is the ${top.name}, priced at ₹${lakh(top.price)} ex-showroom. The base model, the ${first.name}, costs ₹${lakh(first.price)}.` },
    !upcoming && v.length > 1 && { q: `How many variants does the ${n} have?`, a: `The ${n} is sold in ${v.length} variants, from the ${first.name} (₹${lakh(first.price)}) to the ${top.name} (₹${lakh(top.price)}). Most buyers find the best balance of price and features in the middle of the range.` },
    hasMileage(car) && { q: `What is the ${n} ${ev ? "range" : "mileage"}?`, a: `The claimed ${n} ${ev ? "range" : "mileage"} is ${car.mileage}. Real-world figures are lower and depend on traffic, load, tyre pressure and driving style.` },
    autos.length > 0 && { q: `Is the ${n} available in automatic?`, a: `Yes. ${autos.length} ${n} variant${autos.length > 1 ? "s come" : " comes"} with an automatic gearbox, starting with the ${autos[0].name} at ₹${lakh(autos[0].price)} ex-showroom.` },
    colours.length > 0 && { q: `How many colours does the ${n} come in?`, a: `The ${n} comes in ${colours.length} colour${colours.length > 1 ? "s" : ""}: ${colours.slice(0, 6).map((c) => c.name).join(", ")}${colours.length > 6 ? " and more" : ""}.` },
    car.seats && { q: `What is the ${n} seating capacity${car.boot ? " and boot space" : ""}?`, a: `The ${n} seats ${car.seats} people${car.boot ? ` and has ${car.boot} litres of boot space` : ""}. Check the space with your own family and luggage during a test drive.` },
    (car.ncap > 0 || airbags) && { q: `Is the ${n} a safe car?`, a: `${car.ncap > 0 ? `The ${n} has a ${car.ncap}-star crash test rating.` : `No crash test rating is listed for the ${n} yet.`}${airbags ? ` It comes with ${airbags}.` : ""} Check the exact safety kit of the variant you plan to buy.` },
    rivals.length > 0 && { q: `Which cars are rivals of the ${n}?`, a: `The main rivals of the ${n} are the ${rivals.map((c) => c.full).join(", ")}, at a similar price. Compare them side by side before you decide.` },
  ].filter(Boolean);
};

const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/** The first title that fits the 60-character limit, so the main keyword always leads and nothing is cut. */
const fit = (...titles) => titles.find((t) => t.length <= 60) ?? titles[titles.length - 1];
const parts = (...p) => p.filter(Boolean).join(", ");

// Each tab's title and description lead with its main search phrase and carry related ones, filled with real data.
const META = {
  overview: (c, Y) =>
    c.status === "upcoming"
      ? {
          title: fit(`${c.full} Launch Date, Expected Price & Specs`, `${c.name} Launch Date, Expected Price & Specs`, `${c.name} Launch Date & Expected Price`),
          description: `${c.full} launch date ${c.launch ? `is expected in ${c.launch}` : "and details"}${c.min ? `, with an expected price of ${priceRange(c)}` : ""}. See ${c.name} specs, features, images and rivals before it arrives.`,
        }
      : {
          title: fit(`${c.full} Price ${Y}, Specs, Mileage & Review`, `${c.full} Price ${Y}, Specs & Review`, `${c.name} Price ${Y}, Specs & Review`, `${c.name} Price & Review`),
          description: `${c.full} price in India starts at ₹${lakh(c.min)}${c.max > c.min ? ` and goes up to ₹${lakh(c.max)}` : ""} (ex-showroom). Check ${c.name} on road price, ${parts("variants", hasMileage(c) && `mileage (${c.mileage})`, "specs", "colours")} and reviews.`,
        },
  price: (c, Y) => {
    const road = firstCityOnRoad(c);
    return {
      title: fit(`${c.full} On Road Price ${Y} & Price in India`, `${c.name} On Road Price ${Y} & Price in India`, `${c.name} On Road Price ${Y}`),
      description: `${road ? `${c.name} on road price in ${road.city} starts at ${rs(road.total)}. ` : ""}See the ${c.name} price in India for all ${variantsOf(c).length} variants with road tax, insurance and EMI in your city.`,
    };
  },
  variants: (c) => {
    const v = variantsOf(c);
    return {
      title: fit(`${c.full} Variants: Base & Top Model Price`, `${c.name} Variants: Base & Top Model Price`, `${c.name} Variants & Top Model Price`),
      description: v.length > 1 ? `${c.name} has ${v.length} variants: base model ${v[0].name} at ₹${lakh(v[0].price)} and top model ${v[v.length - 1].name} at ₹${lakh(v[v.length - 1].price)}. Compare every ${c.name} variant to pick the right one.` : `See the ${c.full} variants with price and features, and what each ${c.name} trim offers for your budget before you visit a dealer.`,
    };
  },
  specs: (c) => ({
    title: fit(`${c.full} Specifications, Features & Dimensions`, `${c.name} Specifications, Features & Dimensions`, `${c.name} Specs & Features`),
    description: `${c.name} specifications: ${parts(c.engine, c.power, c.torque, c.boot && `${c.boot}-litre boot`, c.seats && `${c.seats} seats`, c.dims?.length && `${c.dims.length} mm long`)}. See all ${c.name} features, dimensions and safety.`,
  }),
  images: (c) => ({
    title: fit(`${c.full} Images: Exterior & Interior Photos`, `${c.name} Images: Exterior & Interior Photos`, `${c.name} Images & Photos`),
    description: `${c.name} images: see ${carPhotos(c).length} photos of the ${c.full} exterior and interior, including front, rear and cabin views, in high resolution.`,
  }),
  colours: (c) => ({
    title: fit(`${c.full} Colours: All ${c.colors.length} Colour Options`, `${c.name} Colours: ${c.colors.length} Colour Options`, `${c.name} Colours`),
    description: `${c.name} colours: the ${c.full} comes in ${c.colors.length} colour${c.colors.length === 1 ? "" : "s"}${c.colors.length ? `, including ${c.colors.slice(0, 3).map((x) => x.name).join(", ")}` : ""}. See every ${c.name} colour option with photos.`,
  }),
  mileage: (c) =>
    isEvCar(c)
      ? { title: fit(`${c.full} Range: Claimed & Real-World Range`, `${c.name} Range: Claimed & Real-World`, `${c.name} Range`), description: `${c.name} range is ${c.mileage} (claimed). See the ${c.name} real-world range in city and highway driving, charging and its monthly running cost.` }
      : { title: fit(`${c.full} Mileage: Claimed & Real-World Mileage`, `${c.name} Mileage: Claimed & Real-World`, `${c.name} Mileage`), description: `${c.name} mileage is ${c.mileage} (claimed). See the ${c.name} real-world mileage in city and highway driving and its monthly running cost.` },
  reviews: (c) => ({
    title: fit(`${c.full} Owner Reviews, Ratings & Problems`, `${c.name} Owner Reviews, Ratings & Problems`, `${c.name} Owner Reviews`),
    description: `${c.name} owner reviews: ${c.rating ? `rated ${c.rating} out of 5 by ${c.reviews} owners` : "read what owners say"} about comfort, mileage, service and problems before you buy the ${c.full}.`,
  }),
  emi: (c, Y) => {
    const road = firstCityOnRoad(c);
    const monthly = road ? emi(road.total * 0.8, 9.5, 48) : 0;
    return {
      title: fit(`${c.full} EMI Calculator & Down Payment ${Y}`, `${c.name} EMI per Month & Down Payment`, `${c.name} EMI Calculator`),
      description: `${monthly ? `${c.name} EMI starts from about ${rs(monthly)} per month. ` : ""}Use the ${c.name} EMI calculator to set down payment, interest rate and tenure for your ${c.name} car loan.`,
    };
  },
  dealers: (c) => ({
    title: fit(`${c.full} Showrooms & Dealers Near You`, `${c.name} Showrooms & Dealers Near You`, `${c.name} Dealers`),
    description: `${c.name} showroom and dealers near you: find ${c.brand} dealers by city with addresses and opening hours, and book a ${c.name} test drive.`,
  }),
  news: (c, Y) => ({
    title: fit(`${c.full} Latest News & Updates ${Y}`, `${c.name} Latest News & Updates ${Y}`, `${c.name} News`),
    description: `Latest ${c.name} news in ${Y}: launches, price changes, facelift updates and road tests of the ${c.full}, with what each update means for buyers.`,
  }),
  faqs: (c) => ({
    title: fit(`${c.full} FAQs: Price, Mileage, Features & More`, `${c.name} FAQs: Price, Mileage & Features`, `${c.name} Questions & Answers`),
    description: `${c.name} FAQs: answers on the ${c.name} price, on road price, ${hasMileage(c) ? "mileage, " : ""}variants, colours, seating and safety, from the latest data.`,
  }),
};

// When a car has little data, its description is topped up with more of the tab's search phrases (guardrail: 120+).
const EXTRA = {
  specs: (c) => `Check the ${c.name} boot space, ground clearance, airbags and engine for every variant.`,
  colours: (c) => `Compare the ${c.name} colour options and pick yours before you book a test drive.`,
  faqs: (c) => `Quick answers to every common ${c.name} question, including boot space and EMI.`,
  images: (c) => `See the ${c.name} interior, dashboard and boot in detail.`,
};

export const modelMeta = (car, tab) => {
  const m = META[tab](car, contentYear());
  if (m.description.length < 120) m.description = `${m.description} ${(EXTRA[tab] ?? ((c) => `Updated with the latest ${c.full} price and specs.`))(car)}`;
  const path = tab === "overview" ? carUrl(car) : `${carUrl(car)}/${tab}`;
  return pageMeta({ ...m, path, image: carPhoto(car).src });
};

/** "creta on road price" -> "Creta on road price": the car's own spelling, first letter in capitals. */
const label = (car, phrase) => {
  const at = phrase.indexOf(car.name.toLowerCase());
  let s = at >= 0 ? phrase.slice(0, at) + car.name + phrase.slice(at + car.name.length) : phrase;
  for (const c of CITIES) s = s.replace(new RegExp(`\\b${c.name.toLowerCase()}\\b`), c.name);
  s = s.replace(/\bindia\b/, "India").replace(/\bemi\b/, "EMI").replace(/\bfaq\b/, "FAQs").replace(/\bev\b/, "EV").replace(/\bcng\b/, "CNG");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Links to the car's own pages, each with its main search phrase as the anchor text (and a few long-tail ones). */
function popularSearches(car) {
  const base = carUrl(car);
  const out = [];
  const add = (path, i = 0) => {
    const k = keywordsFor(path)[i];
    if (k && !out.some((l) => l.href === path || l.label.toLowerCase() === k)) out.push({ label: label(car, k), href: path });
  };
  for (const tab of tabsFor(car)) add(`${base}/${tab}`);
  add(`${base}/variants`, 1); // "creta top model price"
  add(`${base}/price`, 2); // "creta price in india"
  for (const city of CITIES.slice(0, 4)) add(`${base}/price-in-${city.slug}`);
  return out;
}

function Top({ car, crumb, h1, intro }) {
  return (
    <div className="border-b border-ink-200 bg-white">
      <Container className="py-6">
        <Breadcrumbs
          items={[
            { label: "New cars", href: "/new-cars" },
            { label: car.brand, href: `/brands/${car.brandSlug}` },
            { label: car.name, href: crumb ? carUrl(car) : undefined },
            ...(crumb ? [{ label: crumb }] : []),
          ]}
        />
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{h1}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500 sm:text-base">{intro}</p>
      </Container>
    </div>
  );
}

function Related({ car }) {
  const alts = alternatives(car);
  const pairs = COMPARE_PAIRS.filter((p) => p.includes(carKey(car))).map(([a, b]) => ({ a, b }));
  return (
    <Section className="bg-white">
      <SectionHead
        title={`Alternatives to the ${car.name}`}
        sub={`Other ${car.body.toLowerCase()} models close to this price.`}
        href={`/new-cars/${car.body.toLowerCase()}`}
        linkLabel={`See all ${car.body.toLowerCase()} cars`}
      />
      <Carousel label={`Alternatives to the ${car.name}`}>
        {alts.map((c) => (
          <CarCard key={carUrl(c)} car={cardOf(c)} />
        ))}
      </Carousel>
      <div className="mt-6">
        <LinkPills
          title={`Popular ${car.name} searches`}
          links={[
            ...popularSearches(car),
            ...pairs
              .filter(({ a, b }) => CARS_BY_KEY[a] && CARS_BY_KEY[b])
              .map(({ a, b }) => ({ label: `Compare ${CARS_BY_KEY[a].name} and ${CARS_BY_KEY[b].name}`, href: `/compare-cars/${a}-vs-${b}` })),
          ]}
        />
      </div>
    </Section>
  );
}

const Guide = ({ title, paras }) => (
  <Section>
    <h2 className="text-2xl font-extrabold">{title}</h2>
    <div className="prose-site max-w-3xl">
      {paras.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </div>
  </Section>
);

export function ModelTab({ car, tab }) {
  if (tab === "overview") return <CarOverview car={car} faqs={carFaqs(car)} related={<Related car={car} />} />;
  const url = carUrl(car);
  const variants = variantsOf(car);
  const photos = carPhotos(car).map((p) => ({ photo: { src: p.src, w: p.w, h: p.h }, kind: p.kind, colour: p.colour ?? null, title: p.title ?? null, angle: p.angle ?? null, group: p.group ?? null }));
  const ev = car.fuels.length === 1 && car.fuels[0] === "Electric";
  const stories = articlesForCar(car);

  const view = {
    price: () => (
      <>
        <Top
          car={car}
          crumb="On-road price"
          h1={`${car.name} on-road price`}
          intro={`Choose your city and variant to see what a ${car.full} would cost on the road, with every charge shown separately.`}
        />
        <Section>
          <OnRoadTable carName={car.full} variants={variants.map((v) => ({ name: v.name, price: v.price, fuel: v.fuel, onRoad: v.onRoad }))} />
          <div className="mt-6">
            <LinkPills title={`${car.name} price in your city`} links={CITIES.map((c) => ({ label: `${car.name} price in ${c.name}`, href: `${url}/price-in-${c.slug}` }))} />
          </div>
        </Section>
        <Guide
          title={`How the ${car.name} on-road price adds up`}
          paras={[
            `The ex-showroom price of the ${car.full} runs from ${priceRange(car)}, but that is not the amount you will actually pay. Road tax and registration are set by each state, which is why the same variant can cost tens of thousands of rupees more in one city than in another just a short drive away.`,
            `Insurance is the next large item. The first-year premium depends on the insured value and any add-ons you choose, and it is worth requesting a quote from outside the dealership before accepting the bundled offer. On cars above ten lakh rupees you will also see a one percent tax collected at source, which can later be claimed when you file your income tax return.`,
            `Dealers may also suggest accessories, extended warranty or handling charges. Ask for each line in writing, and question anything that you did not request. A clean written quote makes it far easier to compare two showrooms, and it gives you a useful reference if the final invoice looks different from what you were first promised.`,
            `Use the calculator above to estimate the ${car.name} cost for your city and trim. Prices are ex-showroom (Delhi) and change from time to time, so please confirm the current amounts with an authorised ${car.brand} dealer before making any payment.`,
          ]}
        />
      </>
    ),
    variants: () => (
      <>
        <Top car={car} crumb="Variants" h1={`${car.name} variants explained`} intro={`Every ${car.full} trim with its price and what you gain at each step, so you can stop at the right one.`} />
        <Section>
          <ol className="grid gap-4 lg:grid-cols-2">
            {variants.map((v, i) => (
              <li key={v.slug} className="rounded-2xl bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Step {i + 1}</p>
                    <h2 className="text-lg font-bold">
                      <Link href={`${url}/variants/${v.slug}`} className="hover:underline">
                        {v.name}
                      </Link>
                    </h2>
                  </div>
                  <p className="whitespace-nowrap text-lg font-extrabold">₹{lakhShort(v.price)}</p>
                </div>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {v.highlights.map((h) => (
                    <li key={h} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium">
                      {h}
                    </li>
                  ))}
                </ul>
                {i === 2 && <p className="mt-3 inline-block rounded-full bg-lime-400 px-2.5 py-1 text-xs font-bold">Our value pick</p>}
              </li>
            ))}
          </ol>
        </Section>
        <Guide
          title={`Which ${car.name} variant should you buy?`}
          paras={[
            `The ${variants[0].name} is the entry point at ₹${lakh(variants[0].price)}. It covers the basics and suits buyers who plan to keep the monthly instalment low, although it leaves out many of the comforts you will see in showroom display cars, which are usually higher trims.`,
            `For most people the sweet spot sits in the middle. The ${variants[Math.floor((variants.length - 1) / 2)].name} at ₹${lakh(variants[Math.floor((variants.length - 1) / 2)].price)} adds features you will actually use every day, such as a rear camera and automatic climate control, without pushing the price into the territory of larger and more spacious cars from a segment above.`,
            `The top ${variants[variants.length - 1].name} at ₹${lakh(variants[variants.length - 1].price)} makes sense if you really want the 360-degree camera, ventilated seats and premium audio. Before stretching this far, however, compare it with the alternatives listed below, because at this price you may be able to step up to a bigger model altogether.`,
            `Think about resale as well. Mid and upper trims often hold their value better since future buyers look for features, and automatics continue to gain popularity in cities. Variant names, prices and equipment can change, so confirm the final list with your ${car.brand} dealer.`,
          ]}
        />
      </>
    ),
    specs: () => (
      <>
        <Top
          car={car}
          crumb="Specifications"
          h1={`${car.name} specifications and features`}
          intro={`The complete technical sheet for the ${car.full}, grouped so that you can find what matters to you quickly.`}
        />
        <Section>
          <div className="grid gap-5 lg:grid-cols-2">
            {specGroups(car).map((g) => (
              <section key={g.title} className="rounded-2xl bg-white p-5 shadow-card">
                <h2 className="text-lg font-bold">{g.title}</h2>
                <dl className="mt-2 divide-y divide-ink-100 text-sm">
                  {g.rows.map(([k, val]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-ink-500">{k}</dt>
                      <dd className="text-right font-semibold">{val}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </Section>
        {(() => {
          const full = fullSheet(car);
          return [
            ["specification", `Complete ${car.name} specifications`, full.specification],
            ["features", `Complete ${car.name} feature list`, full.features],
          ].map(([id, title, groups]) =>
            groups.length ? (
              <Section key={id}>
                <h2 className="text-xl font-bold">{title}</h2>
                {full.trim && <p className="mt-1 text-sm text-ink-500">As listed for the {full.trim} variant. Lower variants can have less.</p>}
                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  {groups.map((g) => (
                    <section key={g.title} className="rounded-2xl bg-white p-5 shadow-card">
                      <h3 className="text-base font-bold">{g.title}</h3>
                      <dl className="mt-2 divide-y divide-ink-100 text-sm">
                        {g.rows.map(([k, val]) => (
                          <div key={k} className="flex justify-between gap-4 py-2.5">
                            <dt className="text-ink-500">{k}</dt>
                            <dd className="text-right font-semibold">{val}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              </Section>
            ) : null,
          );
        })()}
        <Guide
          title={`How to read the ${car.name} spec sheet`}
          paras={[
            `Power and torque tell different stories. The ${car.name} makes ${car.power}, which affects how it feels at higher speeds, while its ${car.torque} of torque decides how easily it pulls away in traffic or climbs with a full cabin. For daily driving, torque available at low speed usually matters far more than the headline power figure.`,
            `Boot space of ${car.boot} litres is measured in a standard way, but the shape of the boot and the height of the loading lip matter just as much. Take a suitcase to the showroom if you travel often, and check how much room is left with the rear seats occupied by your usual passengers.`,
            `Safety deserves the closest look. ${car.ncap ? `A ${car.ncap}-star crash test score is listed for this car, yet` : "This car has no published crash test score yet, and"} the number of airbags, the stability control and the child-seat mounts can change between trims. Always read the brochure for the exact variant you plan to buy, not just the top model used in the advertisements.`,
            `Comfort features can be tempting, but it helps to separate what you will use weekly from what only impresses on day one. Specifications can change between model years, so please verify them against the official ${car.brand} brochure before you decide.`,
          ]}
        />
      </>
    ),
    images: () => (
      <>
        <Top car={car} crumb="Images" h1={`${car.name} images and gallery`} intro={`Look around the ${car.full} from different angles, and open any photo at full size to study the details.`} />
        <Section>
          {car.spin ? (
            // The car's studio 360 right on the page, like the car portals: Exterior, Open and Interior.
            <section aria-labelledby="view360-title" className="mb-8">
              <h2 id="view360-title" className="mb-3 text-2xl font-extrabold">
                {car.full} 360° view
              </h2>
              <Studio360Lazy spin={car.spin} name={car.full} inline />
            </section>
          ) : (
            <div className="mb-4 flex justify-end">
              <View360Button model={car.model3d} spin={car.spin} name={car.full} photos={photos} colors={car.colors} />
            </div>
          )}
          <h2 className="mb-3 text-2xl font-extrabold">{car.full} images</h2>
          <PhotoGallery photos={photos} colours={car.colors} name={car.full} model={car.model3d} spin={car.spin} />
        </Section>
        <Guide
          title={`What to look for in ${car.name} photos`}
          paras={[
            `Photos are a good way to judge proportions and styling, so use them to decide whether the ${car.name} looks right to you from the front, side and rear. Press images are often of top variants, which means that the wheels, lights and roof details on lower trims can look noticeably different from what you see here.`,
            `Cabin photos are useful for checking the layout of screens and switches, but they cannot tell you about material quality, seat comfort or how much the sun heats a dark dashboard. If the interior matters to you, and it should since that is where you will spend your time, sit inside the car in person.`,
            `Colour is the hardest thing to judge on a screen. Your phone or laptop display will shift the shade, so make a final decision in daylight at a showroom. Light colours hide dust and stay cooler in summer, while darker shades look rich when clean but show scratches much more easily.`,
            `Photos remain the property of their owners, as explained on our image credits page. Some may show a different generation or an overseas model, so treat them as a visual reference rather than an exact description of the car on sale.`,
          ]}
        />
      </>
    ),
    colours: () => (
      <>
        <Top car={car} crumb="Colours" h1={`${car.name} colour options`} intro={`Preview the ${car.colors.length} shades listed for the ${car.full}, and see which one suits your daily life.`} />
        <Section>
          <ColourScope>
            <ColourPage photos={photos} colours={car.colors} name={car.full} />
          </ColourScope>
        </Section>
        <Guide
          title={`Choosing the right ${car.name} colour`}
          paras={[
            `The ${car.name} is listed in ${car.colors.map((x) => x.name).join(", ")}. Your choice affects more than appearance, because it influences how often the car looks dirty, how hot the cabin becomes in summer, and even how quickly the car will sell when it is time to move on.`,
            `White and silver stay popular in India for good reason. They reflect more heat, hide light scratches and dust well, and tend to resell quickly. Grey has become a favourite too, since it looks modern and rarely looks dirty even between washes, which helps a lot in dusty cities and during monsoon months.`,
            `Bold shades such as red or blue help a car stand out, and they often look best in brochures. They can suit you well if you keep the car clean and plan to own it for a long time. Black looks superb straight after a wash, though it needs the most care and shows swirl marks soon after.`,
            `Before you sign, ask whether your chosen shade changes the waiting period or adds a premium, since dual-tone paint frequently costs extra. The photographs above are real pictures of the car in each colour where we have one, and a shade with no picture says so. Please see the actual paint in daylight before you make your final decision.`,
          ]}
        />
      </>
    ),
    mileage: () => (
      <>
        <Top
          car={car}
          crumb={ev ? "Range" : "Mileage"}
          h1={`${car.name} ${ev ? "range" : "mileage"} in the real world`}
          intro={`The claimed figure is ${car.mileage}. Here is how that translates to everyday driving, with a simple running-cost estimate.`}
        />
        <Section>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Claimed figure", v: car.mileage },
              { l: "City estimate", v: ev ? `${Math.round(parseInt(car.mileage) * 0.72)} km range` : `${(parseFloat(car.mileage) * 0.72).toFixed(1)} kmpl` },
              { l: "Highway estimate", v: ev ? `${Math.round(parseInt(car.mileage) * 0.82)} km range` : `${(parseFloat(car.mileage) * 0.88).toFixed(1)} kmpl` },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white p-5 shadow-card">
                <p className="text-sm text-ink-500">{x.l}</p>
                <p className="font-display mt-1 text-2xl font-extrabold">{x.v}</p>
              </div>
            ))}
          </div>
        </Section>
        <Guide
          title={`What really changes the ${car.name} ${ev ? "range" : "mileage"}`}
          paras={[
            `Claimed figures come from controlled laboratory tests, so they are best used to compare one car with another rather than to predict what you will see at home. The ${car.name} is rated at ${car.mileage}, and our estimates above are simple calculations from that figure, not results from an actual test of this car.`,
            `Traffic is usually the biggest factor. Stop-and-go driving uses far more energy than a steady cruise, which is why highway results tend to beat city results for ${ev ? "most cars, although electric cars recover some energy under braking in town" : "cars that burn fuel"}. Smooth acceleration and looking well ahead can make a clear difference without slowing your journey.`,
            `Small habits add up. Correct tyre pressure, removing unnecessary weight from the boot and using the air conditioning sensibly all help, and regular servicing keeps everything efficient. Roof carriers and wider tyres, on the other hand, quietly increase consumption, particularly at speed on open highways during longer trips.`,
            `To estimate your monthly bill, divide your usual distance by a realistic figure and multiply by your local ${ev ? "electricity tariff" : "fuel price"}. You can check today's rates on our fuel price page. Then add this amount to your EMI so that you can see the true cost of owning the ${car.name} each month.`,
          ]}
        />
      </>
    ),
    reviews: () => {
      const list = ownerReviews(car);
      return (
        <>
          <Top car={car} crumb="Reviews" h1={`${car.name} reviews from owners`} intro={`Sample owner opinions on the ${car.full}, covering comfort, running costs and service experience.`} />
          <Section>
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="self-start rounded-2xl bg-ink-950 p-6 text-white">
                <p className="font-display text-5xl font-extrabold text-lime-400">{car.rating || "New"}</p>
                <p className="mt-1 text-sm text-ink-300">{car.reviews ? `Average from ${car.reviews} owner ratings` : "Reviews open after launch"}</p>
                <Link href="/write-review" className="mt-4 block rounded-xl bg-lime-400 py-2.5 text-center text-sm font-bold text-ink-950">
                  Write a car review
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {list.map((r) => (
                  <li key={r.id}>
                    <article className="h-full rounded-2xl bg-white p-5 shadow-card">
                      <p className="text-lime-700" aria-label={`Rated ${r.rating} out of 5`}>
                        {"★".repeat(r.rating)}
                        <span className="text-ink-200">{"★".repeat(5 - r.rating)}</span>
                      </p>
                      <h2 className="mt-1 font-bold">{r.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">{r.text}</p>
                      <p className="mt-3 text-xs text-ink-500">
                        {r.author} · {r.date}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
          <Guide
            title={`How to use ${car.name} reviews well`}
            paras={[
              `Owner reviews are most helpful when you look for patterns instead of single opinions. If several people mention that ${lc(car.pros[0])}, it is probably a real strength of the ${car.name}. In the same way, repeated comments that ${lc(car.cons[0])} tell you exactly what to test for yourself before you pay anything.`,
              `Pay attention to how the reviewer uses the car. A person doing short city runs will judge comfort and mileage quite differently from someone covering long highway distances every week. Reviews written after several months of ownership also tend to be more useful than those posted in the excitement of the first few days.`,
              `Remember that very low and very high ratings can both be emotional. A poor experience at one workshop, for example, says more about that dealer than about the car itself. Owner reviews appear here once our editors have checked them.`,
            ]}
          />
        </>
      );
    },
    emi: () => (
      <>
        <Top
          car={car}
          crumb="EMI"
          h1={`${car.name} EMI and loan planner`}
          intro={`Tune the down payment, interest rate and tenure to find a ${car.full} instalment that feels comfortable each month.`}
        />
        <Section>
          <EmiCalculator price={Math.round(car.min * 100000 * 1.15)} name={car.name} />
        </Section>
        <Guide
          title={`Planning a loan for the ${car.name}`}
          paras={[
            `A larger down payment does two useful things: it lowers your EMI and reduces the total interest you pay. Many buyers aim for at least twenty percent of the on-road price of the ${car.name}, which also keeps the loan closer to the actual value of the car during those early years when depreciation is steepest.`,
            `Tenure is a trade-off. Stretching the loan from five years to seven makes each payment smaller, but you will pay noticeably more interest overall, and you may still owe money when you want to sell. A shorter tenure with a comfortable EMI is generally the wiser choice if your monthly income allows for it.`,
            `Remember to budget for what comes on top of the instalment. Fuel, insurance renewal, servicing and parking all add to the monthly cost of ownership. A good rule of thumb is to check whether you could still pay all of these comfortably if your income dipped for a few months.`,
            `Compare the lender's processing fee, foreclosure terms and any insurance they bundle, not only the interest rate. The calculator here gives an illustrative estimate, and it is not a loan offer. Actual rates and eligibility depend on the lender and on your credit profile.`,
          ]}
        />
      </>
    ),
    dealers: () => {
      const list = showrooms(car.brand).map((s) => ({
        id: s.id,
        citySlug: s.citySlug,
        name: s.name,
        address: s.address,
        call: true,
        lines: s.hours ? [`Open ${s.hours}`] : [],
      }));
      return (
        <>
          <Top car={car} crumb="Dealers" h1={`Where to buy the ${car.name}`} intro={`${car.brand} showrooms by city where you could see the ${car.name}, take a test drive and ask for a quote.`} />
          <Section>
            <PlaceLocator items={list} />
          </Section>
          <Guide
            title={`Making the most of a ${car.name} showroom visit`}
            paras={[
              `Call ahead and ask for the exact variant you want to drive, because showroom demo cars are frequently top trims with a different engine or gearbox. If a dealer cannot arrange the right one, ask whether a nearby branch can, since the ${car.name} can feel quite different from one powertrain to the next.`,
              `Take your usual passengers with you, and bring anything you regularly carry, like a child seat or a large suitcase. Drive on a mix of roads, including a rough patch and a stretch where you can hold a steady speed, and try parking the car in a tight space to check the visibility.`,
              `Before you leave, ask for a written on-road quote, the current waiting period and the delivery timeline. Visiting two dealers is well worth the effort, since quotes can vary. Our dealer directory is still being built, so confirm the showroom with the brand's helpline before you visit.`,
            ]}
          />
        </>
      );
    },
    news: () => (
      <>
        <Top car={car} crumb="News" h1={`${car.name} news and stories`} intro={`Launch updates, price changes and expert road tests that relate to the ${car.full}.`} />
        <Section>
          <h2 className="mb-4 text-xl font-bold">Latest {car.name} stories</h2>
          {stories.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((a) => (
                <li key={a.slug}>
                  <ArticleCard a={a} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-white p-8 text-center text-ink-500 shadow-card">
              No {car.name} stories yet. See our{" "}
              <Link href="/news" className="font-bold underline">
                latest car news
              </Link>{" "}
              in the meantime.
            </p>
          )}
        </Section>
        <Guide
          title={`Why ${car.name} news matters to buyers`}
          paras={[
            `Model updates can change what your money buys. A mid-cycle refresh of the ${car.name} may add features, or it may adjust the trim line-up, and in either case a car bought just before the change may lose some resale value. If you plan to keep your car for many years, this may matter less to you.`,
            `Price revisions are common, particularly around the new year and at the start of a financial year. Following the news lets you decide whether to book now or wait, and it also gives you some useful context when a dealer tells you that the current price is about to rise.`,
            `Treat rumours with care. Spy shots and unconfirmed reports are interesting, but plans and dates can move. Before delaying a purchase for a new version, ask whether your current car can comfortably wait. Some stories on this site are sample articles written to show the format.`,
            `It also helps to read about close rivals, not only the ${car.name}. A competitor that gains new features or a lower price can change which car is the better buy, and it may even give you some extra negotiating power when you sit down with a ${car.brand} dealer to discuss the final deal.`,
          ]}
        />
      </>
    ),
    faqs: () => (
      <>
        <Top car={car} crumb="FAQs" h1={`${car.name} FAQs for buyers`} intro={`Straightforward answers to the questions people ask most often about the ${car.full}.`} />
        <Section>
          <Faq items={carFaqs(car)} />
        </Section>
        <Guide
          title={`More to check before buying the ${car.name}`}
          paras={[
            `Good answers start with good questions. Beyond price and mileage, ask how long the waiting period is in your city, how far the nearest authorised workshop is, and what the standard warranty covers. These practical details often shape your ownership experience far more than any single figure on the brochure.`,
            `It is also worth asking about the cost of common wear items such as tyres and brake pads, along with the service interval. For a ${car.body.toLowerCase()} like the ${car.name}, these can vary quite a lot between brands, and they are rarely mentioned during the excitement of a test drive at the showroom.`,
            `Finally, think about how your needs may change over the next five years. If your family is likely to grow, or your commute might get longer, it pays to choose with that in mind. Answers are based on current listings that can change, so please confirm them with an authorised ${car.brand} dealer.`,
          ]}
        />
      </>
    ),
  };
  return (
    <>
      {view[tab]()}
      <Related car={car} />
    </>
  );
}
