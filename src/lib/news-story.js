import { carPhoto, carPhotos, CARS, carUrl, lakh, priceRange, variantsOf } from "@/data/cars";

export const nearestRival = (car) =>
  CARS.filter((c) => c.slug !== car.slug && c.body === car.body).sort((a, b) => Math.abs(a.min - car.min) - Math.abs(b.min - car.min))[0] ?? CARS.find((c) => c.slug !== car.slug);

const link = (c) => `[[${c.full}|${carUrl(c)}]]`;
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
/** The car's real dimensions from its specification sheet. Any value can be missing (null). */
export const dimsOf = (c) => ({ length: c.dims?.length || null, width: c.dims?.width || null, height: c.dims?.height || null, wheelbase: c.dims?.wheelbase || null });
const safetyLine = (c) => (c.ncap > 0 ? `The ${c.name} carries a ${c.ncap}-star safety rating.` : `The ${c.name} has no crash test rating listed yet.`);
const signed = (n, unit) => `(${n >= 0 ? "+" : ""}${n} ${unit})`;
const shot = (c, kind) => carPhotos(c).find((p) => p.kind === kind);
const isEv = (c) => c.fuels.length === 1 && c.fuels[0] === "Electric";

const yes = (v, note) => ({ yes: v, note });
const NOT_LISTED = "Not listed";
const has = (v) => v === true || (typeof v === "number" && v > 0) || (typeof v === "string" && !/^(none|no|not available)$/i.test(v.trim()));
const known = (v) => v !== undefined && v !== null && v !== "";

/** A yes/no cell from the base and top trim values: "Top trims only" when only the top trim has it. */
const trimCell = (base, top) => {
  if (!known(base) && !known(top)) return NOT_LISTED;
  if (has(base)) return yes(true);
  if (has(top)) return yes(true, known(base) ? "Top trims only" : undefined);
  return yes(false);
};
/** A value cell ("8-inch", "6") that can differ between the base and top trims. */
const valueCell = (base, top, fmt) => {
  const [a, b] = [has(base) ? fmt(base) : null, has(top) ? fmt(top) : null];
  if (a && b) return a === b ? a : `${a} to ${b}`;
  if (b) return known(base) ? `${b} (top trims)` : b;
  if (a) return a;
  return known(base) || known(top) ? yes(false) : NOT_LISTED;
};
/** A value from the top variant's full feature sheet, e.g. "LED Headlamps". */
const sheetValue = (c, key) => {
  for (const section of Object.values(c.features?.sheet?.features ?? {})) if (section && known(section[key])) return section[key];
  return undefined;
};
const sheetCell = (c, key, fmt) => {
  const v = sheetValue(c, key);
  if (!known(v)) return NOT_LISTED;
  if (!has(v)) return yes(false);
  return fmt ? fmt(v) : /^yes$/i.test(String(v).trim()) ? yes(true) : String(v);
};
const inch = (v) => `${String(v).replace(/\s*inch(es)?$/i, "")}-inch`;
const SUNROOF = { "single-pane": "Single-pane", panoramic: "Panoramic", "dual-pane": "Dual-pane", "dual-sunroof": "Dual sunroof" };

/**
 * Real features of the car, from the scraped base and top trims and the top variant's feature sheet. A cell is a
 * string, or { yes, note } for a tick or cross. "Not listed" means the source does not say.
 */
const FEATURES = [
  ["Airbags", (c, b, t) => valueCell(b.airbags, t.airbags, String)],
  ["Electronic stability control", (c, b, t) => trimCell(b.esc, t.esc)],
  ["ISOFIX child seat mounts", (c, b, t) => trimCell(b.isofix, t.isofix)],
  ["Tyre pressure monitor", (c, b, t) => trimCell(b.tpms, t.tpms)],
  ["Rear parking camera", (c, b, t) => trimCell(b.rearCamera, t.rearCamera)],
  ["360-degree camera", (c, b, t) => trimCell(b.camera360, t.camera360)],
  ["ADAS driver assistance", (c, b, t) => trimCell(b.adas, t.adas)],
  ["Parking sensors", (c) => sheetCell(c, "Parking Sensors")],
  ["LED headlamps", (c) => sheetCell(c, "LED Headlamps")],
  ["LED tail lamps", (c) => sheetCell(c, "LED Taillights")],
  ["LED fog lamps", (c) => sheetCell(c, "LED Fog Lamps")],
  ["Wheels", (c, b, t) => {
    const size = valueCell(b.wheelSizeIn, t.wheelSizeIn, (v) => `${v}-inch`);
    return typeof size === "string" && size !== NOT_LISTED && t.wheelType ? `${size} ${t.wheelType}` : size;
  }],
  ["Touchscreen", (c, b, t) => valueCell(b.touchscreenIn, t.touchscreenIn, inch)],
  ["Digital driver display", (c) => sheetCell(c, "Digital Cluster")],
  ["Android Auto and Apple CarPlay", (c) => sheetCell(c, "Android Auto")],
  ["Wireless phone mirroring", (c, b, t) => trimCell(b.wirelessCarPlayAndroidAuto, t.wirelessCarPlayAndroidAuto)],
  ["Wireless phone charger", (c, b, t) => trimCell(b.wirelessCharger, t.wirelessCharger)],
  ["Speakers", (c) => sheetCell(c, "No. of Speakers", String)],
  ["Connected car technology", (c, b, t) => trimCell(b.connectedCarTech, t.connectedCarTech)],
  ["Automatic climate control", (c, b, t) => trimCell(b.autoClimate, t.autoClimate)],
  ["Rear AC vents", (c) => sheetCell(c, "Rear AC Vents")],
  ["Keyless entry", (c) => sheetCell(c, "KeyLess Entry")],
  ["Cruise control", (c, b, t) => trimCell(b.cruiseControl, t.cruiseControl)],
  ["Ventilated front seats", (c, b, t) => trimCell(b.ventilatedFrontSeats, t.ventilatedFrontSeats)],
  ["Sunroof", (c, b, t) => valueCell(b.sunroof, t.sunroof, (v) => SUNROOF[v] ?? String(v))],
];

export const featureRows = (c) => {
  const [b, t] = [c.features?.base ?? {}, c.features?.top ?? {}];
  return FEATURES.map(([label, fn]) => [label, fn(c, b, t)]);
};

export function buildStory(a, car, rival) {
  const compare = !!a.rival;
  const [x, y] = [car, rival];
  const [dx, dy] = [dimsOf(x), dimsOf(y)];
  const [vx, vy] = [variantsOf(x), variantsOf(y)];
  const cheaper = x.min <= y.min ? x : y;
  const dearer = cheaper === x ? y : x;
  const bigger = dx.length && dy.length && dx.length !== dy.length ? (dx.length > dy.length ? x : y) : null;
  const bigBoot = x.boot >= y.boot ? x : y;
  const smallBoot = bigBoot === x ? y : x;
  const stronger = parseInt(x.power) >= parseInt(y.power) ? x : y;
  const softer = stronger === x ? y : x;
  const paired = (kind, label) => {
    const l = shot(x, kind);
    const r = shot(y, kind);
    return l && r ? { t: "pair", left: { photo: l, alt: `${x.full} ${label}` }, right: { photo: r, alt: `${y.full} ${label}` } } : null;
  };
  const longer = Math.max(x.colors.length, y.colors.length);

  const intro = compare
    ? [
        {
          t: "p",
          text: `The ${link(x)} and the ${link(y)} sit close enough in price that plenty of buyers end up cross-shopping them, yet they go about the job very differently. One is ${x.angle}, while the other is ${y.angle}. ${a.excerpt}`,
        },
        {
          t: "p",
          text: `Both promise a comfortable and practical family car, but they differ in pricing, size, equipment and how they feel from behind the wheel. To make the decision simpler, we have lined them up section by section, so you can see exactly where each car pulls ahead and where it falls behind. Here is how the two compare, and which one we would pick for different kinds of buyers.`,
        },
      ]
    : [
        {
          t: "p",
          text: `${a.excerpt} The update concerns the ${link(x)}, which has built its reputation as ${x.angle}, so any change to it is likely to be noticed by the many shoppers who already have it on their shortlist.`,
        },
        {
          t: "p",
          text: `News like this rarely decides a purchase on its own. What matters is how the ${x.name} now stacks up against its closest rival in the same budget, and that is the ${link(y)}. So after covering what has changed, we have put the two side by side on price, size, equipment and powertrain, to help you judge whether this is the right time to buy.`,
        },
      ];

  const sections = [{ blocks: intro }];

  if (!compare) {
    sections.push({
      h: "What This Means For Buyers",
      blocks: [
        {
          t: "ul",
          items: [
            `If you are close to booking a ${x.name}, ask your dealer whether the stock on offer already reflects this update, because older cars may carry a better discount while newer ones bring the latest specification.`,
            `Shoppers who are still undecided do not need to rush. A careful look at the on-road price in your own city, the waiting period and the service network will tell you more than a single headline ever could.`,
            `Current owners are not directly affected, though resale values can shift a little whenever a popular model changes, especially around the time that a newer version reaches showrooms.`,
          ],
        },
      ],
    });
  }

  sections.push({
    h: "Price",
    blocks: [
      { t: "table", caption: `Price comparison of ${x.full} and ${y.full}`, head: ["Model", x.full, y.full], rows: [["Price (ex-showroom)", priceRange(x), priceRange(y)]] },
      {
        t: "ul",
        items: [
          `The ${x.name} is offered in ${vx.length} variants in our catalogue, starting with the ${vx[0].name} and going up to the ${vx[vx.length - 1].name}.`,
          `The ${y.name} also comes in ${vy.length} variants, from the ${vy[0].name} at the entry point to the fully loaded ${vy[vy.length - 1].name}.`,
          `The ${cheaper.name} has the lower starting price at ${priceRange(cheaper).split(" - ")[0]} lakh, which is about ₹${lakh(Math.abs(dearer.min - cheaper.min))} less than the ${dearer.name}.`,
          `At the top of the range, the ${x.max >= y.max ? x.name : y.name} is the more expensive of the two, though it is worth comparing mid-spec trims, as most buyers find the best value in the middle of the line-up.`,
        ],
      },
      {
        t: "p",
        text: `Remember that these are ex-showroom (Delhi) figures. Road tax, registration and insurance can add a substantial amount, and those charges change from state to state, so check the on-road price for your own city before you compare final quotes from two dealers.`,
      },
    ],
  });

  sections.push({
    h: "Dimensions",
    blocks: [
      {
        t: "table",
        caption: "Dimensions in millimetres and boot space in litres",
        head: ["Parameter", x.full, y.full, "Difference"],
        rows: [
          ...["length", "width", "height", "wheelbase"].map((k) => [
            k.charAt(0).toUpperCase() + k.slice(1),
            dx[k] ? `${dx[k]} mm` : "Not listed",
            dy[k] ? `${dy[k]} mm` : "Not listed",
            dx[k] && dy[k] ? signed(dx[k] - dy[k], "mm") : "",
          ]),
          ["Boot space", x.boot ? `${x.boot} litres` : "Not listed", y.boot ? `${y.boot} litres` : "Not listed", x.boot && y.boot ? signed(x.boot - y.boot, "litres") : ""],
        ],
      },
      {
        t: "ul",
        items: [
          bigger
            ? `The ${bigger.name} is the longer car of the two, and that extra length usually shows up as more presence on the road, though it also makes tight parking spots a little harder to manage.`
            : `Compare the length and turning circle of both cars in person, because they decide how easily each one fits into tight parking spots.`,
          `A longer wheelbase generally means more legroom for rear passengers, so if you are often driven around or carry older parents, sit in the back of both cars before you decide.`,
          x.boot && y.boot
            ? `The ${bigBoot.name} offers ${bigBoot.boot} litres of luggage space against the ${smallBoot.boot} litres of the ${smallBoot.name}, a gap you will notice on airport runs and long family holidays.`
            : `Boot space is not listed for both cars, so check the luggage room in person with the bags you usually carry.`,
        ],
      },
      { t: "slider", left: { photo: carPhoto(x), label: x.name }, right: { photo: carPhoto(y), label: y.name } },
      {
        t: "p",
        text: `Numbers only tell part of the story. The shape of the boot opening, the height of the loading lip and how far the rear seats fold all make a real difference to daily use, so take along your usual luggage or a child seat when you visit the showroom.`,
      },
    ],
  });

  const rearPair = paired("rear", "rear view");
  sections.push({
    h: "Design And Road Presence",
    blocks: [
      {
        t: "p",
        text: `Styling is personal, but the two cars make quite different first impressions. The ${x.name} is ${x.angle}, and that personality comes through in its proportions and detailing. The ${y.name} takes another route as ${y.angle}, and it will appeal to buyers who prefer that kind of character on the road.`,
      },
      ...(rearPair ? [rearPair] : []),
      {
        t: "ul",
        items: [
          `Look at the wheel size and the lighting on the specific trim that you can afford, because brochure photographs almost always show the top variant, and the lower trims can look noticeably plainer in person.`,
          `Ground clearance and tyre profile matter on Indian roads, so drive over a few speed breakers during your test drive, and listen for how each car deals with sharp bumps at low speed.`,
        ],
      },
    ],
  });

  sections.push({
    h: "Colour Options",
    blocks: [
      { t: "table", caption: "Paint shades listed for each car", head: [x.full, y.full], rows: Array.from({ length: longer }, (_, i) => [x.colors[i]?.name ?? "-", y.colors[i]?.name ?? "-"]) },
      {
        t: "ul",
        items: [
          `Both cars are listed with ${longer} shades in our catalogue, with lighter colours such as ${x.colors.find((c) => /White|Silver/.test(c.name))?.name ?? x.colors[0].name} being easier to keep clean in dusty cities.`,
          `Dual-tone roofs, where offered, usually come only on higher trims and can add a small premium, so ask the dealer before you settle on a final shade.`,
          `Popular colours can carry longer waiting periods, so if you need the car soon, it is worth asking which shades are in stock at your nearest showroom.`,
        ],
      },
    ],
  });

  const interiorPair = paired("interior", "cabin and dashboard");
  sections.push({
    h: "Features And Safety",
    blocks: [
      { t: "table", caption: "Feature comparison on top variants", head: ["Feature", x.full, y.full], rows: featureRows(x).map(([label, cell], i) => [label, cell, featureRows(y)[i][1]]) },
      {
        t: "ul",
        items: [
          `Both are reasonably well equipped on their top trims, but the feature list above refers to the highest variant, so check exactly which items your chosen trim includes before signing anything.`,
          `${safetyLine(x)} ${safetyLine(y)} Always look up the latest official crash test report for the specific model you are buying.`,
          `One highlight of the ${x.name} is this: ${lc(x.pros[1])}. The ${y.name} answers with its own strength: ${lc(y.pros[1])}.`,
          `Neither car is perfect. The weak spot we would check on the ${x.name} is this: ${lc(x.cons[0])}. On the ${y.name}, look out for this: ${lc(y.cons[0])}.`,
        ],
      },
      ...(interiorPair ? [interiorPair] : []),
      {
        t: "p",
        text: `Features are easy to compare on paper, but usability is not. Try the touchscreen while parked, check how quickly the phone connects and see whether the most common controls are physical buttons or buried in menus. These small details will matter far more after a few months than the length of the feature list does on the day you buy.`,
      },
    ],
  });

  sections.push({
    h: "Powertrain Options",
    blocks: [
      {
        t: "p",
        text: `Under the bonnet, the two cars take their own approach, and this is often where the decision gets made. The ${stronger.name} has the stronger headline figure, while the ${softer.name} focuses on being easy and efficient in everyday use.`,
      },
      {
        t: "table",
        caption: "Engine and performance figures",
        head: ["Model", x.full, y.full],
        rows: [
          [isEv(x) || isEv(y) ? "Engine or battery" : "Engine", x.engine, y.engine],
          ["Power", x.power, y.power],
          ["Torque", x.torque, y.torque],
          ["Fuel options", x.fuels.join(", "), y.fuels.join(", ")],
          ["Transmission", x.auto ? "Manual and automatic" : "Manual", y.auto ? "Manual and automatic" : "Manual"],
          ...(x.mileage || y.mileage ? [[isEv(x) || isEv(y) ? "Claimed mileage or range" : "Claimed mileage", x.mileage || "Not listed", y.mileage || "Not listed"]] : []),
        ],
      },
      {
        t: "ul",
        items: [
          `With ${stronger.power} and ${stronger.torque}, the ${stronger.name} should feel more relaxed during highway overtakes and when the cabin is fully loaded.`,
          `The ${softer.name} produces ${softer.power}, which is perfectly adequate for city traffic and steady cruising, though it may need a little more planning for quick overtakes.`,
          x.mileage && y.mileage
            ? `The claimed figures are ${x.mileage} for the ${x.name} and ${y.mileage} for the ${y.name}. Real-world numbers will be lower, and they depend on traffic, load, tyre pressure and driving style.`
            : `Real-world fuel economy depends on traffic, load, tyre pressure and driving style, so ask owners in your city what they actually get.`,
          `If most of your driving is in the city, an automatic gearbox is well worth its extra cost, so try that version during your test drive even if you were planning on a manual.`,
        ],
      },
    ],
  });

  sections.push({
    h: "Ownership And Running Costs",
    blocks: [
      {
        t: "p",
        text: `The purchase price is only the start. Over five years, fuel, insurance, servicing and depreciation can add up to a large share of what the car really costs you. ${x.brand} and ${y.brand} also differ in service reach, so check how far the nearest authorised workshop is from your home, and ask for a sample service bill for each car.`,
      },
      {
        t: "p",
        text: `Resale value deserves a thought as well. Cars from brands with wide service coverage and steady demand tend to hold their value better, and well-specified automatics are increasingly easy to sell in big cities. If you change cars every few years, this could matter as much as the price difference between the two on the day of purchase.`,
      },
    ],
  });

  sections.push({
    h: "Wheelora Says...",
    blocks: [
      { t: "p", text: `Both are good cars, and neither is a wrong choice. The right one depends on what you value most, so here is how we would decide between the two.` },
      { t: "p", text: `Choose the ${link(x)} if you want ${x.angle}. Its biggest strengths are these: ${lc(x.pros[0])} and ${lc(x.pros[2])}. The compromise to accept is this: ${lc(x.cons[1])}.` },
      { t: "p", text: `Pick the ${link(y)} if you are after ${y.angle}. Its biggest strengths are these: ${lc(y.pros[0])} and ${lc(y.pros[2])}. The compromise to accept is this: ${lc(y.cons[1])}.` },
      {
        t: "p",
        text: `Whichever way you lean, drive both on the same day, on roads that you actually use, with the people who usually travel with you. Then ask each dealer for a written on-road quote, and compare the final totals rather than just the discounts. You can also [[compare any two cars side by side|/compare-cars]] or [[work out your monthly EMI|/emi-calculator]] before you visit a showroom.`,
      },
    ],
  });

  const others = CARS.filter((c) => c.body === x.body && c.slug !== x.slug && c.slug !== y.slug)
    .sort((p, q) => Math.abs(p.min - x.min) - Math.abs(q.min - x.min))
    .slice(0, 5);
  if (others.length) {
    sections.push({
      h: "Other Options To Consider",
      blocks: [
        {
          t: "p",
          text: `These two are strong contenders, but they are not your only choices at this price. Here are a few alternatives in the same class that are worth a look, and what each one brings to the table:`,
        },
        { t: "ul", items: others.map((c) => `${link(c)}: A good pick if you want ${c.angle}. Its main strength is this: ${lc(c.pros[0])}. It is listed at ${priceRange(c)}.`) },
        {
          t: "p",
          text: `Prices, specifications and dimensions in this story come from current listings that can change, so please confirm all details with an authorised dealer before you decide.`,
        },
      ],
    });
  }
  return sections;
}

export const storyWords = (sections) => {
  let n = 0;
  const add = (s) => {
    n += s.split(/\s+/).length;
  };
  for (const s of sections)
    for (const b of s.blocks) {
      if (b.t === "p") add(b.text);
      if (b.t === "ul") b.items.forEach(add);
    }
  return n;
};
